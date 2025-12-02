import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import { getAuth } from "firebase/auth";
import {
  ERROR_MESSAGE_CIV_CONNECTION,
  ERROR_MESSAGE_EXISTS,
  ERROR_MESSAGE_INVALID_DATA,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
  SETTINGS_LOAD_DEFAULT_DATA_FROM_CIV,
  URL_CF_UPDATE_MODEL,
  URL_CIV_MODELS,
} from "../../variables/constants";
import {
  fetchData,
  fetchDataFromFirestore,
  fetchUserDataFromFirestore,
  makeBatchRequest,
} from "./fetchUtils";
import { deleteImagePostDocs } from "./fetchImages";
import {
  clearFileExtension,
  createCategoryId,
  throwCustomError,
} from "../generalUtils";
import { transformModelData } from "../transformUtils";
import { cleanImageMeta, transformSrcPreview } from "../imageUtils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { splitTags } from "../promptUtils";

const firestore = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);
const auth = getAuth(firebaseApp);

/**
 * Fetch model data from Civitai
 * @param {Number | String} modelId - The model ID
 * @returns {Object} The model data
 */
export const getModelData = async (modelId) => {
  try {
    const model = await fetchData(
      `https://civitai.com/api/v1/models/${modelId}`
    );

    // Clears empty keys and excessive data (too much weight for Firestore) from image metadata
    const updatedModelversions = model?.modelVersions.map((modelVersion) => {
      const cleanedImages = modelVersion.images.map((image) => {
        return cleanImageMeta(image);
      });

      return {
        ...modelVersion,
        images: cleanedImages,
      };
    });

    const updatedModelData = {
      ...model,
      modelVersions: updatedModelversions,
    };

    return transformModelData(updatedModelData);
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Deletes custom user model data, preview, and saved model images
 * @param {String} uid - The user ID
 * @param {Object} model - The model data
 */
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
        await makeBatchRequest(postsData, deleteImagePostDocs, 50, false);
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

/**
 * Fetches model data from Civitai
 * @param {Number | String} id - The model ID
 * @returns {Object} The model data
 */
export const fetchModelFromCivitai = async (id) => {
  const responseCiv = await fetch(`https://civitai.com/api/v1/models/${id}`);
  const responseData = await responseCiv.json();

  if (!responseCiv?.ok) {
    throwCustomError(ERROR_MESSAGE_CIV_CONNECTION);
  }

  return responseData;
};

/**
 * Fetches user custom model data and default model data
 * @param {Number | String} modelId - The model ID
 * @returns {Object} User custom model data with default model data
 */
export const fetchModelData = async (modelId) => {
  const customModelData = await fetchUserDataFromFirestore(
    "models",
    modelId + ""
  );

  let defModelData = {};

  if (SETTINGS_LOAD_DEFAULT_DATA_FROM_CIV) {
    defModelData = await fetchModelFromCivitai(modelId);
  } else {
    defModelData = await fetchDataFromFirestore("models", modelId);
  }

  return { ...customModelData, data: defModelData };
};

/**
 * Checks for updates and fetches new model data with updated model versions
 * @param {Number | String} modelId - The model ID
 * @returns {Object} The updated model data
 */
export const fetchModelUpdates = async (modelId) => {
  const updateModelResData = await fetchData(
    `${URL_CF_UPDATE_MODEL}/updateModel?modelId=${modelId}`
  );

  if (!updateModelResData?.modelId) {
    throwCustomError("Failed to update");
  }

  const newModelData = fetchDataFromFirestore("models", `${modelId}`);

  return newModelData;
};

/**
 * Updates existing custom data, creates custom data for new model versions, and updates the list of existing base models if a new one is found
 * @param {Object} newModelData - The updated model data
 * @param {Array} newVersions - The new model versions
 * @param {Object} model - The old model data
 * @param {Array} curBaseModels - The list of currently existing base models
 */
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

/**
 * Saves model data to database
 * @param {Object} newModelData - The new model data
 * @param {Object} categories - Existed user categories
 * @param {Array} curBaseModels - Existed user base models
 * @param {Object} modelData - Existed model data
 * @returns {{preview: Object, baseModels: Array}} The model's preview data and updated user's base models
 */
export const saveModelData = async (
  newModelData,
  categories,
  curBaseModels,
  modelData
) => {
  try {
    let data = {};
    let modelVersions = [];
    const uid = auth?.currentUser?.uid;

    const modelsRef = doc(
      firestore,
      "users",
      uid,
      "models",
      newModelData.modelId + ""
    );
    const userRef = doc(firestore, "users", uid);
    const modelsPrevRef = doc(
      firestore,
      "users",
      uid,
      "preview",
      newModelData.modelId + ""
    );

    const modelsPrevRefSnap = await getDoc(modelsPrevRef);

    // Throw error if user try to add existing model using new model form
    if (modelsPrevRefSnap.exists() && !modelData) {
      throwCustomError(ERROR_MESSAGE_EXISTS);
    } else {
      if (!modelData) {
        //Upload model to database
        const updateModel = httpsCallable(functions, "updateModelCall");

        const uploadResponse = await updateModel({
          id: modelData?.id || newModelData.modelId,
        });

        if (uploadResponse?.error) {
          throw new Error(uploadResponse.error);
          // throwCustomError(ERROR_MESSAGE_UPLOAD_MODEL);
        }

        const responseCiv = await fetch(
          `${URL_CIV_MODELS}${newModelData.modelId}`
        );

        data = await responseCiv.json();
        modelVersions = data?.modelVersions;
      } else {
        data = modelData.data;
        modelVersions = data?.modelVersions.filter((version) =>
          Object.keys(modelData?.modelVersionsCustomData).includes(
            `${version.id}`
          )
        );
      }

      if (data?.error) {
        throwCustomError(data.error);
      }
      if (!data?.id) {
        throwCustomError(ERROR_MESSAGE_INVALID_DATA);
      }

      let modelVersionsCustomData = modelData?.modelVersionsCustomData || {};

      modelVersions.forEach((version, i) => {
        const isSingle =
          !newModelData.modelVersionId &&
          !Object.keys(modelVersionsCustomData).length;
        let curVersionDlStatus;
        if (
          newModelData.modelVersionId &&
          newModelData.modelVersionId === version.id
        ) {
          curVersionDlStatus = true;
        } else {
          curVersionDlStatus = newModelData.versionsDownloadStatus.find(
            (dlData) => Number.parseInt(dlData.id) === version.id
          )?.value;
        }

        const dlStatus =
          newModelData.versionsDownloadStatus.length ||
          newModelData.modelVersionId === version.id
            ? !!curVersionDlStatus
            : false;
        const currVersionData = modelVersionsCustomData.hasOwnProperty(
          version.id
        )
          ? modelVersionsCustomData[version.id]
          : {};

        let fileName;
        if (version.hasOwnProperty("files") && version?.files) {
          fileName = clearFileExtension(
            version.files.find((file) => file?.primary).name
          ).toLowerCase();
        }

        const defActTag =
          fileName && data?.type === "LORA" ? `<lora:${fileName}:1>` : "";

        modelVersionsCustomData = {
          ...modelVersionsCustomData,
          [version.id]: {
            versionId: version.id,
            index: version.index,
            name: version.name,
            versionName: version.name,
            baseModel: version.baseModel,
            defActTag,
            trainedWords:
              version?.trainedWords?.flatMap((word) => {
                return splitTags(word);
              }) || [],
            defFileName: fileName || "",
            versionImageUrl: version?.images ? version?.images[0]?.url : "",
            ...currVersionData,
            downloadStatus: isSingle && !i ? true : dlStatus,
          },
        };
      });

      const activePreviewId = modelVersions.find(
        (version) => modelVersionsCustomData[version.id].downloadStatus === true
      )?.id;

      const activePreviewImg =
        (activePreviewId &&
          modelVersions
            ?.find((version) => version.id === activePreviewId)
            .images?.filter((img, i) => img.type === "image")[0]) ||
        "";

      const previewImgDefault = modelVersions[0]?.images[0] || "";

      const previewImgData = activePreviewImg || previewImgDefault;
      const { previewSrc } = transformSrcPreview(
        previewImgData?.url,
        SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
        previewImgData?.type
      );
      const previewImg = previewSrc;

      const fileNames = modelVersions?.flatMap((version) => {
        if (version.hasOwnProperty("files") && version?.files) {
          return [
            ...new Set(
              version.files
                .filter((file) => file?.type === "Model")
                .map((file) => clearFileExtension(file?.name).toLowerCase())
            ),
          ];
        }
        return [];
      });

      const hashes = modelVersions
        ?.flatMap((version) => {
          if (version.hasOwnProperty("files") && version?.files) {
            return version?.files
              .filter((file) => file?.type === "Model")
              .flatMap((file) => Object.values(file?.hashes).filter(Boolean))
              .map((hash) => hash.toLowerCase());
          }
          return [];
        })
        .filter(Boolean);

      const customFileNames = Object.values(modelVersionsCustomData)
        ?.map((version) => {
          return clearFileExtension(version?.fileName)?.toLowerCase();
        })
        .filter(Boolean);

      const nameArr =
        (newModelData.modelName || data.name)
          .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "")
          .toLowerCase()
          .split(" ") || [];

      const versionIds = modelVersions?.map((version) => version.id) || [];

      const baseModels = [
        ...new Set(
          modelVersions?.flatMap((version) => version?.baseModel || [])
        ),
      ];

      // Get a new write batch
      const batch = writeBatch(firestore);

      let newCategory = false;
      let newSubcategory = false;
      let newBaseModel = false;

      const curUserBaseModels = curBaseModels;

      if (!curUserBaseModels?.length) {
        newBaseModel = true;
      } else {
        baseModels.forEach((baseModel) => {
          const exists = curUserBaseModels.some(
            (curBaseModel) => curBaseModel === baseModel
          );
          if (!exists) {
            newBaseModel = true;
          }
        });
      }

      let updatedCategories;
      let mainId;
      let subIds;
      const mainCategoryData = categories[newModelData.modelType]?.find(
        (category) =>
          category.name?.toLowerCase() === newModelData.main?.toLowerCase()
      );

      if (!mainCategoryData) {
        newCategory = true;
        const currCategories = categories[newModelData.modelType] || [];
        mainId = createCategoryId(
          newModelData.main,
          categories[newModelData.modelType]
        );
        subIds = newModelData.sub;
        updatedCategories = [
          ...currCategories,
          {
            id: mainId,
            name: newModelData.main,
            subcategories: newModelData.sub.map((subcategory) => {
              return { id: subcategory, name: subcategory };
            }),
          },
        ];
      } else {
        mainId = mainCategoryData.id;
        subIds = [];
        const newSubcategoriesData = newModelData.sub.flatMap((subcategory) => {
          const subExists = mainCategoryData.subcategories.find(
            (oldSucategories) =>
              oldSucategories.name?.toLowerCase() === subcategory?.toLowerCase()
          );

          if (!subExists) {
            newSubcategory = true;
            const categoryId = createCategoryId(
              subcategory,
              mainCategoryData.subcategories
            );

            subIds = [...subIds, categoryId];
            return {
              id: categoryId,
              name: subcategory,
            };
          } else {
            subIds = [...subIds, subExists.id];
            return [];
          }
        });
        const mainCategoryIndex = categories[newModelData.modelType].findIndex(
          (category) => category.name === newModelData.main
        );

        const curUpdatedCategory = {
          id: mainId,
          name: mainCategoryData.name,
          subcategories: [
            ...mainCategoryData.subcategories,
            ...newSubcategoriesData,
          ],
        };
        updatedCategories = [
          ...categories[newModelData.modelType].slice(0, mainCategoryIndex),
          curUpdatedCategory,
          ...categories[newModelData.modelType].slice(mainCategoryIndex + 1),
        ];
      }

      const categoryField = `categoriesById.${newModelData.modelType}`;

      if (newBaseModel || newCategory || newSubcategory) {
        if (!categories) {
          batch.set(
            userRef,
            {
              categoriesById: { [newModelData.modelType]: updatedCategories },
              baseModels: baseModels,
            },
            { merge: true }
          );
        } else {
          batch.update(
            userRef,
            {
              [categoryField]: updatedCategories,
              baseModels: arrayUnion(...baseModels),
            },
            { merge: true }
          );
        }
      }

      let createdAt;
      if (modelData?.createdAt) {
        createdAt = Number.isFinite(modelData?.createdAt)
          ? modelData?.createdAt
          : Date.parse(modelData?.createdAt);
      } else {
        createdAt = Date.parse(modelData?.downloadedAt) || Date.now();
      }

      const modelInfo = {
        defaultCustomData: {},
        ...modelData,
        id: modelData?.id || +newModelData.modelId,
        versionIds,
        modelType: newModelData.modelType,
        main: mainId,
        sub: subIds,
        name: newModelData.modelName || data.name,
        hashtags: newModelData.hashtags,
        mainTag: newModelData.mainTag,
        nsfw: newModelData.nsfw || false,
        src: "civitai.com",
        modelVersionsCustomData,
        savedImages: modelData?.savedImages || {},
        updatedAt: new Date().toISOString(),
        createdAt,
      };

      let previewModelVersionsCustomData = {};

      Object.values(modelVersionsCustomData).forEach((version) => {
        if (version?.versionId) {
          previewModelVersionsCustomData[version.versionId] = {
            size: version?.size || "",
            weight: version?.weight || null,
            minWeight: version?.minWeight || null,
            maxWeight: version?.maxWeight || null,
            fileName: version?.fileName || "",
            name: version?.name || "",
            mainTag: version?.mainTag || "",
            index: version?.index || null,
            downloadStatus: version?.downloadStatus || false,
            trainedWords: version?.trainedWords || [],
            defActTag: version?.defActTag || "",
            versionId: version?.versionId || null,
            defFileName: version?.defFileName || "",
            versionImageUrl: version?.versionImageUrl || "",
            baseModel: version?.baseModel || "",
            versionName: version?.versionName || "",
          };
        }
      });

      const loraPrevData = {
        id: modelData?.id || newModelData.modelId,
        versionIds,
        modelType: newModelData.modelType,
        src: "civitai.com",
        main: mainId,
        sub: subIds,
        name: newModelData.modelName || data.name || "",
        nameArr,
        imgUrl: previewImg || "",
        imgType: previewImgData?.type || "",
        type: data.type,
        creator: data?.creator || "",
        nsfw: newModelData.nsfw || false,
        nsfwLevel: data?.nsfwLevel || "",
        baseModel: modelVersions[0].baseModel,
        baseModels: [...baseModels],
        mainTag: newModelData.mainTag,
        fileName: newModelData.fileName,
        latestFileName: !!fileNames?.length ? fileNames[0] : "",
        hashes,
        fileNames,
        customFileNames,
        size: newModelData.size,
        authorTags: newModelData.hashtags?.length
          ? newModelData.hashtags
          : data.tags,
        modelVersionsCustomData: previewModelVersionsCustomData,
        updatedAt: new Date().toISOString(),
        createdAt,
      };

      const curPrevData = modelsPrevRefSnap.data() || {};

      batch.set(modelsRef, modelInfo);

      batch.set(modelsPrevRef, { ...curPrevData, ...loraPrevData });

      // Commit the batch
      await batch.commit();

      let updatedBaseModels = null;

      if (newBaseModel) {
        updatedBaseModels = [...new Set([...baseModels, ...curBaseModels])];
      }

      return { preview: loraPrevData, baseModels: updatedBaseModels };
    }
  } catch (err) {
    if (err.isCustom) {
      throwCustomError(err.message);
    }

    throw new Error(err.message);
  }
};
