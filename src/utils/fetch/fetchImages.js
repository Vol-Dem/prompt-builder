import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

import firebaseApp from "../../firebase-config";
import {
  ERROR_MESSAGE_INVALID_DATA,
  SETTINGS_SFW_RANGE,
} from "../../variables/constants";
import { fetchData, makeBatchRequest } from "./fetchUtils";
import {
  // clearFileExtension,
  filterDuplicates,
  throwCustomError,
} from "../generalUtils";
// import { transformImageData } from "../transformUtils";
import { parseModelIds } from "../modelUtils";
import { getUniqImageResources } from "../imageUtils";
import { clearFileExtension, transformImageData } from "../../../shared/utils";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

/**
 * Fetches data for all image resources and hashes from Civitai API and DB
 * @param {object} image - The image data
 * @returns {array} The updated image resources
 */
export const getImageInfo = async (image) => {
  try {
    const imageResources = getUniqImageResources(image);

    let updatedImgResources = [];

    if (imageResources?.length) {
      const updatedRes = await makeBatchRequest(
        imageResources,
        fetchResourceInfo,
      );

      updatedImgResources = [...updatedImgResources, ...updatedRes];
    }

    if (image.meta?.hashes) {
      const hashes = { ...image.meta?.hashes, vae: null };
      const hashesData = Object.values(hashes)
        .filter(Boolean)
        .flatMap((hash) => {
          const isInRes = image.meta?.resources?.find(
            (res) => res.hash === hash,
          );
          const isInCivRes = image.meta?.civitaiResources?.find(
            (res) => res.hash === hash,
          );
          const isInAddRes = image.meta?.additionalResources?.find(
            (res) => res.hash === hash,
          );

          if (!isInRes && !isInCivRes && !isInAddRes) {
            return { hash };
          }
          return [];
        });

      const updatedHashRes = await makeBatchRequest(
        hashesData,
        fetchResourceInfo,
      );

      updatedImgResources = [...updatedImgResources, ...updatedHashRes];
    }
    return await fetchResourcesInfoFromDB(
      image,
      filterDuplicates(updatedImgResources, "modelVersionId"),
    );
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

/**
 * Fetches full resource data and merges it with existing data
 * @param {array} resourcesData - The existing resource data
 * @returns {array} The updated resources data
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
      }),
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
            modelsData[i]?.value.files.find((file) => file?.primary)?.name,
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
 * @param {array} posts - The array of posts to delete
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
      post.postId + "",
    );

    batch.delete(imgPostRef);
  });

  // // Commit the batch
  await batch.commit();
};

/**
 * Adds new images to post data in the database or creates new post data if it doesn't exist
 * @param {object} postInfo - The post data
 * @param {array} imagesData - The array of image data
 * @returns {object} An object containing the post ID and the updated array of saved image IDs
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
      SETTINGS_SFW_RANGE.includes(image?.nsfwLevel),
    );

    const docSnap = await getDoc(modelImagesRef);

    let curPostData;

    if (docSnap.exists()) {
      curPostData = docSnap.data();
    }

    const curImgIds = curPostData?.items?.map((item) => item?.id);

    const newImagesData = imagesData.filter(
      (image) => !curImgIds?.includes(image.id),
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
        { merge: true },
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
          { merge: true },
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
 * @param {number | string} modelId - The model ID
 * @param {string} username - The username
 * @param {object} version - The current version data
 * @returns {array} The images with generation data included
 */
export const getVersionImagesFromCiv = async (modelId, username, version) => {
  try {
    const versionImagesRequest = await fetch(
      `https://civitai.com/api/v1/images?modelId=${modelId}&modelVersionId=${version.id}&username=${username}&nsfw=X&limit=200&sort=Oldest`,
    );
    const versionImages = await versionImagesRequest.json();
    const updatedImages = version?.images?.flatMap((image) => {
      const fullImgData = versionImages?.items?.find(
        (verImg) => verImg.hash === image.hash,
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
 * @param {object} resourcesData - The resource data
 * @returns The updated resource data
 */
export const getImageModelInfo = async (resourcesData) => {
  try {
    let modelHash;
    if (Object.hasOwn(resourcesData, "Model hash")) {
      modelHash = resourcesData["Model hash"];
    } else if (Object.hasOwn(resourcesData, "Modelhash")) {
      modelHash = resourcesData["Modelhash"];
    } else {
      return resourcesData;
    }
    const data = await fetchData(
      `https://civitai.com/api/v1/model-versions/by-hash/${modelHash}`,
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

/**
 * Fetches data for all image resources and hashes from DB, and merges it with existing resource data
 * @param {object} image - The image data
 * @param {array} resourcesInfoCiv - The array of image resources from Civitai
 * @returns {array} The updated image resources
 */
export const fetchResourcesInfoFromDB = async (
  curImageData,
  resourcesInfoCiv,
) => {
  try {
    const imageResources =
      resourcesInfoCiv || getUniqImageResources(curImageData);
    const uid = auth?.currentUser?.uid;
    let modelHash = "";

    if (Object.hasOwn(curImageData?.meta, "Model hash")) {
      modelHash = curImageData.meta["Model hash"];
    } else if (Object.hasOwn(curImageData?.meta, "Modelhash")) {
      modelHash = curImageData.meta["Modelhash"];
    }

    let checkpointQ;

    if (modelHash) {
      checkpointQ = query(
        collection(firestore, "users", uid, `preview`),
        where("hashes", "array-contains", modelHash),
      );
    } else if (curImageData?.meta?.Model?.includes("urn:air")) {
      const [modelId] = parseModelIds(curImageData.meta.Model);
      checkpointQ = query(
        collection(firestore, "users", uid, `preview`),
        where("id", "==", modelId),
      );
    } else {
      const checkpointName = curImageData?.meta?.Model || "";
      checkpointQ = query(
        collection(firestore, "users", uid, `preview`),
        where("fileNames", "array-contains", checkpointName?.toLowerCase()),
      );
    }

    const checkpointQuerySnapshot = await getDocs(checkpointQ);

    const checkpointSearchResult = checkpointQuerySnapshot.docs.map((doc) => {
      // doc.data() is never undefined for query doc snapshots
      return doc.data();
    });
    const checkpointData = checkpointSearchResult?.length
      ? checkpointSearchResult[0]
      : null;

    let modelsIds = [];
    let modelsVersionIds = [];
    let modelsHashes = [];
    let modelsNames = [];
    let allModelsPreviews = [];

    if (checkpointData) {
      allModelsPreviews = [checkpointData];
    }

    imageResources?.forEach((resource) => {
      if (resource?.modelId) {
        modelsIds.push(resource?.modelId);
      } else if (resource?.versionId || resource?.modelVersionId) {
        modelsVersionIds.push(resource?.versionId || resource?.modelVersionId);
      } else if (resource?.hash) {
        modelsHashes.push(resource?.hash);
      } else if (resource?.name) {
        modelsNames.push(clearFileExtension(resource?.name).toLowerCase());
      }
    });

    if (modelsIds.length) {
      const q = query(
        collection(firestore, "users", uid, `preview`),
        //firestore query limit 30
        where("id", "in", modelsIds.slice(0, 29)),
      );
      const querySnapshot = await getDocs(q);

      const modelsPrewiewById = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data();
      });

      allModelsPreviews = [...allModelsPreviews, ...modelsPrewiewById];
    }

    if (modelsVersionIds.length) {
      const q = query(
        collection(firestore, "users", uid, `preview`),
        where("versionIds", "array-contains-any", modelsVersionIds),
      );
      const querySnapshot = await getDocs(q);

      const modelsPrewiewByVersionId = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data();
      });
      allModelsPreviews = [...allModelsPreviews, ...modelsPrewiewByVersionId];
    }

    if (modelsHashes.length) {
      const q = query(
        collection(firestore, "users", uid, `preview`),
        where("hashes", "array-contains-any", modelsHashes),
      );
      const querySnapshot = await getDocs(q);

      const modelsPrewiewByHash = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data();
      });
      allModelsPreviews = [...allModelsPreviews, ...modelsPrewiewByHash];
    }

    if (modelsNames.length) {
      const uniqModelsNames = modelsNames.filter(
        (name) =>
          !allModelsPreviews.find((model) => {
            const nameArr = name.split("-");
            if (Number.isFinite(+nameArr[nameArr?.length - 1])) {
              return model?.fileNames?.includes(
                name
                  .replace(`-${nameArr[nameArr?.length - 1]}`, "")
                  .toLowerCase(),
              );
            } else {
              return model?.fileNames?.includes(name.toLowerCase());
            }
          }),
      );

      if (uniqModelsNames.length) {
        const q = query(
          collection(firestore, "users", uid, `preview`),
          where("fileNames", "array-contains-any", uniqModelsNames),
        );
        const querySnapshot = await getDocs(q);

        const modelsPrewiewByName = querySnapshot.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return doc.data();
        });
        allModelsPreviews = [...allModelsPreviews, ...modelsPrewiewByName];
      }
    }

    const resources = imageResources?.map((resource) => {
      const versionId = resource?.modelVersionId || resource?.versionId;
      const preview = allModelsPreviews.find(
        (preview) =>
          preview?.id === resource.modelId ||
          preview?.versionIds?.includes(versionId) ||
          preview?.hashes?.includes(resource.hash) ||
          preview?.fileNames?.includes(
            clearFileExtension(resource.name)?.toLowerCase(),
          ),
      );

      if (preview) {
        return {
          ...resource,
          preview,
        };
      }
      return resource;
    });

    //Remove not uniq items from the end of array//////
    const filteredNewResult = resources
      .filter((obj1, i, arr) => {
        if (obj1?.preview?.id) {
          return (
            arr.findIndex((obj2) => obj2?.preview?.id === obj1?.preview?.id) ===
            i
          );
        } else if (obj1?.modelId) {
          return arr.findIndex((obj2) => obj2?.modelId === obj1?.modelId) === i;
        } else if (obj1?.name) {
          //filters duplicate models that only have names that match the file name
          const arrIndex = arr.findIndex(
            (obj2) => obj1?.name === obj2?.fileName,
          );
          return arrIndex === i || arrIndex < 0;
        } else {
          return true;
        }
      })
      ?.filter((resource) => {
        if (resource?.name && resource.name?.includes("urn:air:")) {
          return false;
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        if (!a?.versionId && b?.versionId) {
          return 1;
        }
        if (a?.versionId && !b?.versionId) {
          return -1;
        }
        return 0;
      });
    ////////////////////////////////////////////////////

    // const checkpointInfo = filteredNewResult.find(
    //   (resource) => resource.type === "Checkpoint"
    // );

    return filteredNewResult;
  } catch (err) {
    throw new Error(err.message);
  }
};
