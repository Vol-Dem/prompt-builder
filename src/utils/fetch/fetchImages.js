import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  writeBatch,
} from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import { getAuth } from "firebase/auth";
import {
  ERROR_MESSAGE_INVALID_DATA,
  SETTINGS_SFW_RANGE,
} from "../../variables/constants";
import { fetchData, makeBatchRequest } from "./fetchUtils";
import {
  clearFileExtension,
  filterDuplicates,
  throwCustomError,
} from "../generalUtils";
import { transformImageData } from "../transformUtils";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

/**
 * Fetches data for all image resources and hashes, and merges it with existing resource data
 * @param {Array} imageResources - The array of image resources
 * @param {Object} image - The image data
 * @returns {Array} The updated image resources
 */
export const getImageInfo = async (imageResources, image) => {
  try {
    let updatedImgResources = [];

    if (imageResources?.length) {
      const updatedRes = await makeBatchRequest(
        imageResources,
        fetchResourceInfo
      );

      updatedImgResources = [...updatedImgResources, ...updatedRes];
    }

    if (image.meta?.hashes) {
      const hashes = { ...image.meta?.hashes, vae: null };
      const hashesData = Object.values(hashes)
        .filter(Boolean)
        .flatMap((hash) => {
          const isInRes = image.meta?.resources?.find(
            (res) => res.hash === hash
          );
          const isInCivRes = image.meta?.civitaiResources?.find(
            (res) => res.hash === hash
          );
          const isInAddRes = image.meta?.additionalResources?.find(
            (res) => res.hash === hash
          );

          if (!isInRes && !isInCivRes && !isInAddRes) {
            return { hash };
          }
          return [];
        });

      const updatedHashRes = await makeBatchRequest(
        hashesData,
        fetchResourceInfo
      );

      updatedImgResources = [...updatedImgResources, ...updatedHashRes];
    }
    return filterDuplicates(updatedImgResources, "modelVersionId");
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

/**
 * Fetches full resource data and merges it with existing data
 * @param {Array} resourcesData - The existing resource data
 * @returns {Array} The updated resources data
 */
export const fetchResourceInfo = async (resourcesData) => {
  try {
    const modelsData = await Promise.allSettled(
      resourcesData.map(async (resource) => {
        let url;
        if (resource.modelVersionId) {
          url = `https://civitai.com/api/v1/model-versions/${resource.modelVersionId}`;
        } else if (resource.hash) {
          url = `https://civitai.com/api/v1/model-versions/by-hash/${resource.hash}`;
        } else {
          return new Promise((resolve) => {
            resolve({});
          });
        }

        return await fetchData(url);
      })
    );

    const updatedResources = resourcesData.map((resource, i) => {
      if (modelsData.status === "rejected") {
        return resource;
      }

      return {
        ...resource,
        ...(modelsData[i]?.value?.model?.name && {
          name: modelsData[i]?.value.model?.name,
        }),
        ...(modelsData[i]?.value?.modelId && {
          modelId: modelsData[i]?.value?.modelId,
        }),
        ...(modelsData[i]?.value?.name && {
          versionName: modelsData[i]?.value?.name,
        }),
        ...(modelsData[i]?.value?.id && {
          versionId: modelsData[i]?.value?.id,
        }),
        ...(modelsData[i]?.value?.model?.type && {
          type: modelsData[i]?.value?.model?.type,
        }),
        ...(modelsData[i]?.value?.files && {
          fileName: clearFileExtension(
            modelsData[i]?.value.files.find((file) => file?.primary)?.name
          ),
        }),
      };
    });

    return updatedResources;
  } catch (err) {
    // console.log(err.message);
    throw new Error(err);
  }
};

/**
 * Deletes image posts from the database
 * @param {Array} posts - The array of posts to delete
 */
export const deleteImagePostDocs = async (posts) => {
  const batch = writeBatch(firestore);

  posts.forEach((post) => {
    const imgPostRef = doc(
      firestore,
      "users",
      post.uid,
      "models",
      post.modelId + "",
      post.type,
      post.postId + ""
    );

    batch.delete(imgPostRef);
  });

  // // Commit the batch
  await batch.commit();
};

/**
 * Adds new images to post data in the database or creates new post data if it doesn't exist
 * @param {Object} postInfo - The post data
 * @param {Array} imagesData - The array of image data
 * @returns {Object} An object containing the post ID and the updated array of saved image IDs
 */
export const updateImagePostData = async (postInfo, imagesData) => {
  try {
    const { postId, modelId, versionId, postData, location } = postInfo;

    if (!location) {
      throwCustomError(ERROR_MESSAGE_INVALID_DATA);
    }

    const uid = auth.currentUser.uid;
    const locationRef = doc(firestore, "users", uid, location, modelId + "");
    const modelImagesRef = doc(firestore, "users", uid, "images", postId + "");
    const newImagesId = imagesData.map((image) => image.id);
    const oldImagesId = postData?.imagesId || [];
    const imagesId = postInfo?.delete
      ? newImagesId
      : [...new Set([...oldImagesId, ...newImagesId])];
    const newImgData = {
      postId: +postId,
      imagesId,
    };

    const batch = writeBatch(firestore);

    const hasSfw = !!imagesData.find((image) =>
      SETTINGS_SFW_RANGE.includes(image?.nsfwLevel)
    );

    const docSnap = await getDoc(modelImagesRef);

    let curPostData;

    if (docSnap.exists()) {
      curPostData = docSnap.data();
    }

    const curImgIds = curPostData?.items?.map((item) => item?.id);

    const newImagesData = imagesData.filter(
      (image) => !curImgIds?.includes(image.id)
    );

    if (newImagesData?.length || !curPostData?.id || location === "models") {
      batch.set(
        modelImagesRef,
        {
          id: +postId,
          versionsId: arrayUnion(versionId),
          items: arrayUnion(...imagesData),
          createdAt: imagesData[0].createdAt,
          hasSfw: hasSfw,
        },
        { merge: true }
      );
    }

    if (location === "models") {
      if (postData) {
        batch.update(locationRef, {
          [`savedImages.${versionId}`]: arrayRemove(postData),
        });
      }

      if (imagesId?.length) {
        batch.set(
          locationRef,
          {
            savedImages: {
              [`${versionId}`]: arrayUnion(newImgData),
            },
          },
          { merge: true }
        );
      }
    }

    // Commit the batch
    await batch.commit();
    return newImgData;
  } catch (err) {
    console.error(err.message);
    throw new Error(err);
  }
};

/**
 * Fetches default model images with generation data from Civitai for the current version
 * @param {Number | String} modelId - The model ID
 * @param {String} username - The username
 * @param {Object} version - The current version data
 * @returns {Array} The images with generation data included
 */
export const getVersionImagesFromCiv = async (modelId, username, version) => {
  try {
    const versionImagesRequest = await fetch(
      `https://civitai.com/api/v1/images?modelId=${modelId}&modelVersionId=${version.id}&username=${username}&nsfw=X&limit=200&sort=Oldest`
    );
    const versionImages = await versionImagesRequest.json();
    const updatedImages = version?.images?.flatMap((image) => {
      const fullImgData = versionImages?.items?.find(
        (verImg) => verImg.hash === image.hash
      );

      if (!fullImgData) return [];

      const transformedImgData = transformImageData(fullImgData || image);

      return { ...image, ...transformedImgData };
    });

    return updatedImages.filter(Boolean);
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Fetches image model data from resources
 * @param {Object} resourcesData - The resource data
 * @returns The updated resource data
 */
export const getImageModelInfo = async (resourcesData) => {
  try {
    let modelHash;
    if (resourcesData?.hasOwnProperty("Model hash")) {
      modelHash = resourcesData["Model hash"];
    } else if (resourcesData?.hasOwnProperty("Modelhash")) {
      modelHash = resourcesData["Modelhash"];
    } else {
      return resourcesData;
    }
    const data = await fetchData(
      `https://civitai.com/api/v1/model-versions/by-hash/${modelHash}`
    );

    const updatedResources = {
      ...resourcesData,
      modelName: data?.model?.name,
      modelId: data.modelId,
      versionName: data.name,
      versionId: data.id,
    };

    return updatedResources;
  } catch (err) {
    // console.log(err.message);
    throw new Error(err);
  }
};
