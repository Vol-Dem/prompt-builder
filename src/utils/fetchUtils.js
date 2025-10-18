import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  addDelayPromise,
  clearFileExtension,
  filterDuplicates,
  throwCustomError,
  transformImageData,
  transformModelData,
} from "./generalUtils";
import firebaseApp from "../firebase-config";
import { getAuth } from "firebase/auth";
import {
  ERROR_MESSAGE_INVALID_DATA,
  SETTINGS_LOAD_DEFAULT_DATA_FROM_CIV,
  SETTINGS_SFW_RANGE,
  URL_CF_UPDATE_MODEL,
} from "../variables/constants";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export const makeBatchRequest = async (
  data,
  fetchFunc,
  concurrencyLimit = 5,
  returnResult = true,
  delay = 500
) => {
  try {
    let result = [];
    const queue = data.slice();

    const processQueue = async () => {
      while (queue.length > 0) {
        const curBatch = [];
        for (let i = 0; i < concurrencyLimit && queue.length > 0; i++) {
          const curElement = queue.shift();
          curBatch.push(curElement);
        }
        await addDelayPromise(delay);

        const batchResults = await fetchFunc(curBatch);

        if (returnResult) result = [...result, ...batchResults];
      }
    };

    await processQueue();
    return result;
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

export const getImagesInfo = async (images) => {
  try {
    const examplesDataWithRes = await Promise.all(
      images.map(async (item) => {
        const updatedImgData = { ...item };
        const newMeta = item?.meta && (await getModelInfo(item.meta));
        if (newMeta) updatedImgData.meta = newMeta;

        if (item.meta?.resources) {
          const updatedRes = await makeBatchRequest(
            item.meta.resources,
            addResourcesInfo
          );

          if (!updatedRes) {
            throw new Error("failed to update res");
          }
          updatedImgData.meta = {
            ...updatedImgData.meta,
            resources: updatedRes,
          };
        }
        if (item.meta?.civitaiResources) {
          const updatedCivRes = await makeBatchRequest(
            item.meta.civitaiResources,
            addResourcesInfo
          );

          if (!updatedCivRes) {
            throw new Error("failed to update res");
          }
          updatedImgData.meta = {
            ...updatedImgData.meta,
            civitaiResources: updatedCivRes,
          };
        }

        return await updatedImgData;
      })
    );
    return examplesDataWithRes;
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

export const getImageInfo = async (imageResources, image) => {
  try {
    let updatedImgResources = [];

    if (imageResources?.length) {
      const updatedRes = await makeBatchRequest(
        imageResources,
        addResourcesInfo
      );
      if (!updatedRes) {
        throw new Error("failed to update res");
      }
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
        addResourcesInfo
      );
      if (!updatedHashRes) {
        throw new Error("failed to update res");
      }
      updatedImgResources = [...updatedImgResources, ...updatedHashRes];
    }
    return filterDuplicates(updatedImgResources, "modelVersionId");
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

export const getModelInfo = async (resourcesData) => {
  try {
    let modelHash;
    if (resourcesData?.hasOwnProperty("Model hash")) {
      modelHash = resourcesData["Model hash"];
    } else if (resourcesData?.hasOwnProperty("Modelhash")) {
      modelHash = resourcesData["Modelhash"];
    } else {
      return resourcesData;
    }
    const response = await fetch(
      `https://civitai.com/api/v1/model-versions/by-hash/${modelHash}`
    );
    const data = await response.json();

    if (data?.error) {
      throw new Error(data.error);
    }

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

export const addResourcesInfo = async (resourcesData) => {
  try {
    const modelsData = await Promise.all(
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

        const response = await fetch(url);
        return await response.json();
      })
    );

    const updatedResources = resourcesData.map((resource, i) => {
      return {
        ...resource,
        ...(modelsData[i].model?.name && { name: modelsData[i].model?.name }),
        ...(modelsData[i]?.modelId && { modelId: modelsData[i]?.modelId }),
        ...(modelsData[i]?.name && { versionName: modelsData[i]?.name }),
        ...(modelsData[i]?.id && { versionId: modelsData[i]?.id }),
        ...(modelsData[i]?.model?.type && { type: modelsData[i]?.model?.type }),
        ...(modelsData[i]?.files && {
          fileName: clearFileExtension(
            modelsData[i].files.find((file) => file?.primary)?.name
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

export const getModelData = async (modelId, curModelVersionsData) => {
  try {
    const response = await fetch(
      `https://civitai.com/api/v1/models/${modelId}`
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Error status (${response.status})`);
    }

    let newVersions = responseData?.modelVersions;

    if (!!curModelVersionsData) {
      newVersions = responseData?.modelVersions?.filter(
        (version) =>
          !curModelVersionsData.some(
            (oldVersions) => version.id === oldVersions.id
          )
      );
    }

    let updatedModelversions = newVersions;

    // clear empty keys
    updatedModelversions?.forEach((version) => {
      version.images?.forEach((image) => {
        if (image?.meta) {
          const metaArr = Object.entries(image.meta).filter(
            (entry) => !!entry[0]
          );

          if (metaArr) {
            image.meta = Object.fromEntries(metaArr);
          }
          if (image?.meta?.comfy) {
            image.meta.comfy = "";
          }
        }
      });
    });

    const updatedModelData = {
      ...responseData,
      modelVersions: !curModelVersionsData
        ? updatedModelversions
        : [...updatedModelversions, ...curModelVersionsData],
    };

    return transformModelData(updatedModelData);
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

export const saveVersionImages = async (versionsData) => {
  const updatedModelversions = await Promise.all(
    versionsData?.map(async (version) => {
      const versionImagesRequest = await fetch(
        `https://civitai.com/api/v1/images?modelId=${version.modelId}&modelVersionId=${version.id}&username=${version.username}&nsfw=X`
      );
      const versionImages = await versionImagesRequest.json();
      const updatedImages = version?.images?.map((image) => {
        const fullImgData =
          versionImages?.items?.find((verImg) => verImg.hash === image.hash) ||
          image;
        const transformedImgData = transformImageData(fullImgData);

        return { ...image, ...transformedImgData };
      });

      const uid = auth.currentUser.uid;

      const modelImagesRef = doc(
        firestore,
        "users",
        uid,
        "models",
        versionsData[0].modelId + "",
        "defaultImages",
        version.id + ""
      );

      const nsfw = [...new Set(updatedImages.map((image) => image.nsfw))];

      await setDoc(
        modelImagesRef,
        {
          items: updatedImages.filter(Boolean),
          versionId: versionsData[0]?.id || null,
          default: true,
          createdAt: updatedImages[0]?.createdAt || null,
          savedAt: new Date().toISOString(),
          nsfw: updatedImages[0]?.nsfw || false,
          nsfwTypes: nsfw,
          nsfwLevel: updatedImages[0]?.nsfwLevel || null,
        },
        { merge: true }
      );

      return {
        images: updatedImages.filter(Boolean),
      };
    })
  );

  return updatedModelversions;
};

export const deleteModelDoc = async (uid, model) => {
  if (!!model?.savedImages) {
    Object.values(model.savedImages).forEach(async (versionData) => {
      const postsData = versionData.map((post) => {
        return {
          ...post,
          uid,
          modelId: model.id,
          type: "images",
        };
      });
      if (postsData?.length) {
        await makeBatchRequest(postsData, deleteImagePostDoc, 50, false);
      }
    });
  }

  const modelRef = doc(firestore, "users", uid, "models", model.id + "");
  const modelPreviewRef = doc(
    firestore,
    "users",
    uid,
    "preview",
    model.id + ""
  );

  await deleteDoc(modelRef);
  await deleteDoc(modelPreviewRef);
};

export const deleteImagePostDoc = async (posts) => {
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

export const updateImagePostData = async (
  postInfo,
  imagesData,
  replace = false
) => {
  try {
    const { postId, modelId, versionId, postData, location } = postInfo;

    if (!location) {
      throw new Error(ERROR_MESSAGE_INVALID_DATA);
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

export const getVersionImagesFromCiv = async (modelId, username, version) => {
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
};

export const saveGuideData = async (guideData, uid) => {
  try {
    if (!guideData || !uid) return;

    const userRef = doc(firestore, "users", uid);

    await setDoc(
      userRef,
      {
        guide: guideData,
      },
      { merge: true }
    );
  } catch (err) {
    console.error(err.message);
  }
};

export const fetchDataFromFirestore = async (...docPath) => {
  const dataDoc = doc(firestore, ...docPath);
  const docSnap = await getDoc(dataDoc);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throwCustomError("Can't find document");
  }
};

export const fetchUserDataFromFirestore = async (...docPath) => {
  const uid = auth?.currentUser?.uid;
  return fetchDataFromFirestore("users", uid, ...docPath);
};

export const getCollectionData = async (collectionId) => {
  return await fetchUserDataFromFirestore("collections", collectionId + "");
};

export const fetchModelFromCivitai = async (id) => {
  const responseCiv = await fetch(`https://civitai.com/api/v1/models/${id}`);
  const responseData = await responseCiv.json();

  if (!responseData?.id) {
    throw new Error("Civitai failed");
  }

  return responseData;
};

export const fetchModelData = async (uid, modelId) => {
  const modelData = await fetchDataFromFirestore(
    "users",
    uid,
    "models",
    modelId
  );

  let defModelData = {};

  if (SETTINGS_LOAD_DEFAULT_DATA_FROM_CIV) {
    defModelData = await fetchModelFromCivitai(modelId);
  } else {
    defModelData = await fetchDataFromFirestore("models", modelId);
  }

  return { ...modelData, data: defModelData };
};

export const fetchModelUpdates = async (modelId) => {
  const updateModelRes = await fetch(
    `${URL_CF_UPDATE_MODEL}/updateModel?modelId=${modelId}`
  );
  const updateModelResData = await updateModelRes.json();

  if (!updateModelResData?.modelId) {
    throw new Error("Failed to update");
  }

  const modelDefDataRef = doc(firestore, "models", `${modelId}`);

  const docSnap = await getDoc(modelDefDataRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("Model not found");
  }
};

export const updateUserCustomModelData = async (
  newModelData,
  newVersions,
  model,
  curBaseModels
) => {
  const newVersionsCustomData = {};

  newVersions.forEach((version, i) => {
    version.modelId = model.id;

    let fileName;
    if (version.hasOwnProperty("files") && version?.files) {
      fileName = clearFileExtension(
        version.files.find((file) => file?.primary).name
      ).toLowerCase();
    }

    newVersionsCustomData[version.id] = {
      versionId: version.id,
      name: version.name,
      versionName: version.name,
      baseModel: version.baseModel,
      index: version.index,
      defFileName: fileName || "",
      versionImageUrl:
        version.images?.filter((img, i) => img.type === "image")[0]?.url || "",
      downloadStatus: false,
    };
  });
  const modelVersionsCustomData = { ...newVersionsCustomData };

  Object.values(model?.modelVersionsCustomData).forEach((customVersion) => {
    modelVersionsCustomData[customVersion.versionId] = {
      ...customVersion,
      index: newModelData?.modelVersions?.find(
        (version) => version.id === customVersion.versionId
      )?.index,
    };
  });

  const fileNames = newModelData.modelVersions?.flatMap((version) => {
    if (version.hasOwnProperty("files") && version?.files) {
      return clearFileExtension(
        version.files.find((file) => file?.primary).name
      ).toLowerCase();
    }
    return [];
  });

  const hashes = newModelData.modelVersions
    ?.flatMap((version) => {
      if (version.hasOwnProperty("files") && version?.files) {
        const primaryFileHashes = version?.files.find(
          (file) => file?.primary
        )?.hashes;
        if (primaryFileHashes) {
          return Object.values(primaryFileHashes)?.map((hash) =>
            hash.toLowerCase()
          );
        }
      }
      return [];
    })
    .filter(Boolean);

  const versionIds =
    newModelData.modelVersions?.map((version) => version.id) || [];

  const baseModels = new Set(
    newModelData.modelVersions?.flatMap((version) => version?.baseModel || [])
  );

  let newBaseModel = false;

  if (curBaseModels?.length) {
    baseModels?.forEach((baseModel) => {
      const exists = curBaseModels?.some(
        (curBaseModel) => curBaseModel === baseModel
      );
      if (!exists) {
        newBaseModel = true;
      }
    });
  }
  const uid = auth?.currentUser?.uid;
  const modelsRef = doc(firestore, "users", uid, "models", model?.id + "");
  const modelsPrevRef = doc(firestore, "users", uid, "preview", model?.id + "");
  const userRef = doc(firestore, "users", uid);

  if (newBaseModel) {
    await updateDoc(
      userRef,
      {
        baseModels: arrayUnion(...baseModels),
      },
      { merge: true }
    );
  }

  await updateDoc(
    modelsRef,
    {
      modelVersionsCustomData: modelVersionsCustomData,
    },
    { merge: true }
  );
  await updateDoc(
    modelsPrevRef,
    {
      modelVersionsCustomData: modelVersionsCustomData,
      fileNames,
      hashes,
      versionIds,
      tags: newModelData.tags,
      baseModels: arrayUnion(...baseModels),
    },
    { merge: true }
  );
};
