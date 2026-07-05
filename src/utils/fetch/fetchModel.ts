import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getFunctions,
  httpsCallable,
  type HttpsCallableResult,
} from "firebase/functions";

import firebaseApp from "../../firebase-config";
import {
  ERROR_MESSAGE_CIV_CONNECTION,
  ERROR_MESSAGE_DEFAULT,
  ERROR_MESSAGE_EXISTS,
  ERROR_MESSAGE_INVALID_DATA,
  ERROR_MESSAGE_MODEL_UPDATE,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
  URL_CIV_MODELS,
} from "../../variables/constants";
import {
  fetchData,
  fetchDataFromFirestore,
  fetchUserDataFromFirestore,
  makeBatchRequest,
} from "./fetchUtils";
import { deleteImagePostDocs } from "./fetchImages";
import { AppError, createCategoryId, normalizeError } from "../generalUtils";
import { transformModelData } from "../transformUtils";
import { cleanImageMeta, transformSrcPreview } from "../imageUtils";
import { splitTags } from "../promptUtils";
import { clearFileExtension } from "../../../shared/utils";
import type {
  CivitaiModelDoc,
  ModelPreviewDoc,
  UserModelDoc,
} from "../../../shared/types/firestore";
import type { UpdateModelResponse } from "../../../shared/types/api";
import type { ModelData } from "../../types/models.types";
import type {
  ModelVersionCivitai,
  ModelVersionsCustomData,
} from "../../../shared/types/model";
import type {
  ModelCategories,
  ModelCategory,
} from "../../../shared/types/user";
import type { ModelFormData } from "../../types/forms.types";

const firestore = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);
const auth = getAuth(firebaseApp);
const updateModel = httpsCallable(functions, "updateModelCallDev");

/**
 * Fetch model data from Civitai
 * @param modelId - The model ID
 * @returns The model data
 */
export const getModelData = async (modelId: number) => {
  try {
    const model = (await fetchData(
      `${URL_CIV_MODELS}/${modelId}`,
    )) as CivitaiModelDoc;

    // Clears empty keys and excessive data (too much weight for Firestore) from image metadata
    const updatedModelversions = model?.modelVersions.map((modelVersion) => {
      const cleanedImages = modelVersion?.images?.map((image) => {
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
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Deletes custom user model data, preview, and saved model images
 * @param uid - The user ID
 * @param model - The model data
 */
export const deleteModelDoc = async (uid: string, model: UserModelDoc) => {
  if (model?.savedImages) {
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
    model.id + "",
  );

  await deleteDoc(modelRef);
  await deleteDoc(modelPreviewRef);
};

/**
 * Fetches model data from Civitai
 * @param id - The model ID
 * @returns The model data
 */
export const fetchModelFromCivitai = async (id: number | string) => {
  const responseCiv = await fetch(`${URL_CIV_MODELS}/${id}`);
  const responseData = await responseCiv.json();

  if (!responseCiv?.ok) {
    throw new AppError(ERROR_MESSAGE_CIV_CONNECTION);
  }

  return responseData;
};

/**
 * Fetches user custom model data and default model data
 * @param modelId - The model ID
 * @returns User custom model data with default model data
 */
export const fetchModelData = async (
  modelId: number | string,
): Promise<ModelData> => {
  const customModelData = (await fetchUserDataFromFirestore(
    "models",
    modelId + "",
  )) as UserModelDoc;

  let defModelData: CivitaiModelDoc;

  if (!customModelData) {
    defModelData = await fetchModelFromCivitai(modelId);
  } else {
    defModelData = (await fetchDataFromFirestore(
      "models",
      modelId + "",
    )) as CivitaiModelDoc;
  }

  if (defModelData && !customModelData) {
    return {
      data: defModelData,
      // ...defModelData,
      id: defModelData.id,
      type: defModelData.type,
      modelType: defModelData.type,
      creator: defModelData.creator,
      name: defModelData.name,
      nsfw: defModelData.nsfw,
      nsfwLevel: defModelData.nsfwLevel,
      hashtags: defModelData.tags,
      description: defModelData.description,
    };
  }

  return { ...customModelData, data: defModelData };
};

/**
 * Checks for updates and fetches new model data with updated model versions
 * @param modelId - The model ID
 * @returns The updated model data
 */
export const fetchModelUpdates = async (
  modelId: number | string,
): Promise<CivitaiModelDoc | undefined> => {
  const updateModelResData = (await updateModel({
    id: modelId,
  })) as HttpsCallableResult<UpdateModelResponse>;

  if ("error" in updateModelResData?.data) {
    console.error(updateModelResData.data.error);
    throw new AppError(ERROR_MESSAGE_MODEL_UPDATE);
  }

  return updateModelResData.data.modelData;
};

/**
 * Updates existing custom data, creates custom data for new model versions, and updates the list of existing base models if a new one is found
 * @param newModelData - The updated model data
 * @param newVersions - The new model versions
 * @param model - The old model data
 * @param curBaseModels - The list of currently existing base models
 */
export const updateUserCustomModelData = async (
  newModelData: CivitaiModelDoc,
  newVersions: ModelVersionCivitai[],
  model: UserModelDoc,
  curBaseModels: string[],
): Promise<void> => {
  const newVersionsCustomData: ModelVersionsCustomData = {};

  newVersions.forEach((version) => {
    version.modelId = model.id;

    let fileName;

    if (Object.hasOwn(version, "files") && version?.files) {
      fileName = clearFileExtension(
        version.files.find((file) => file?.primary)?.name || "",
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
        version.images?.filter((img) => img.type === "image")[0]?.url || "",
      downloadStatus: false,
    };
  });
  const modelVersionsCustomData = { ...newVersionsCustomData };

  if (model?.modelVersionsCustomData) {
    Object.values(model?.modelVersionsCustomData).forEach((customVersion) => {
      modelVersionsCustomData[customVersion.versionId] = {
        ...customVersion,
        index:
          newModelData?.modelVersions?.find(
            (version) => version.id === customVersion.versionId,
          )?.index || 0,
      };
    });
  }

  const fileNames = newModelData.modelVersions?.flatMap((version) => {
    if (Object.hasOwn(version, "files") && version?.files) {
      return clearFileExtension(
        version.files.find((file) => file?.primary)?.name || "",
      ).toLowerCase();
    }
    return [];
  });

  const hashes = newModelData.modelVersions
    ?.flatMap((version) => {
      if (Object.hasOwn(version, "files") && version?.files) {
        const primaryFileHashes = version?.files.find(
          (file) => file?.primary,
        )?.hashes;
        if (primaryFileHashes) {
          return Object.values(primaryFileHashes)?.map((hash) =>
            hash.toLowerCase(),
          );
        }
      }
      return [];
    })
    .filter(Boolean);

  const versionIds =
    newModelData.modelVersions?.map((version) => version.id) || [];

  const baseModels = new Set(
    newModelData.modelVersions?.flatMap((version) => version?.baseModel || []),
  );

  let newBaseModel = false;

  if (curBaseModels?.length) {
    baseModels?.forEach((baseModel) => {
      const exists = curBaseModels?.some(
        (curBaseModel) => curBaseModel === baseModel,
      );
      if (!exists) {
        newBaseModel = true;
      }
    });
  }
  const uid = auth?.currentUser?.uid;

  if (!uid) {
    throw new Error(ERROR_MESSAGE_DEFAULT);
  }

  const modelsRef = doc(firestore, "users", uid, "models", model?.id + "");
  const modelsPrevRef = doc(firestore, "users", uid, "preview", model?.id + "");
  const userRef = doc(firestore, "users", uid);

  if (newBaseModel) {
    await updateDoc(userRef, {
      baseModels: arrayUnion(...baseModels),
    });
  }

  await updateDoc(modelsRef, {
    modelVersionsCustomData: modelVersionsCustomData,
  });
  await updateDoc(modelsPrevRef, {
    modelVersionsCustomData: modelVersionsCustomData,
    fileNames,
    hashes,
    versionIds,
    tags: newModelData.tags,
    baseModels: arrayUnion(...baseModels),
  });
};

/**
 * Saves model data to database
 * @param newModelData - The new model data
 * @param categories - Existed user categories
 * @param curBaseModels - Existed user base models
 * @param modelData - Existed model data
 * @returns The model's preview data and updated user's base models
 */
export const saveModelData = async (
  newModelData: ModelFormData,
  categories: ModelCategories,
  curBaseModels: string[],
  modelData?: ModelData,
): Promise<{
  preview: ModelPreviewDoc;
  modelData: UserModelDoc;
  baseModels: string[] | null;
}> => {
  try {
    let data: CivitaiModelDoc;
    let modelVersions = [];
    const uid = auth?.currentUser?.uid;

    if (!uid) {
      throw new Error(ERROR_MESSAGE_DEFAULT);
    }

    const modelsRef = doc(
      firestore,
      "users",
      uid,
      "models",
      newModelData.modelId + "",
    );
    const userRef = doc(firestore, "users", uid);
    const modelsPrevRef = doc(
      firestore,
      "users",
      uid,
      "preview",
      newModelData.modelId + "",
    );

    const modelsPrevRefSnap = await getDoc(modelsPrevRef);

    // Throw error if user try to add existing model using new model form
    if (modelsPrevRefSnap.exists() && !modelData) {
      throw new AppError(ERROR_MESSAGE_EXISTS);
    } else {
      if (!modelData?.data) {
        //Upload model to database

        const uploadResponse = (await updateModel({
          id: newModelData.modelId,
        })) as HttpsCallableResult<UpdateModelResponse>;

        if ("error" in uploadResponse.data) {
          if (uploadResponse.data.error.startsWith("No model")) {
            throw new AppError(uploadResponse.data.error);
          }
          throw new Error(uploadResponse.data.error);
        }

        const responseCiv = await fetch(
          `${URL_CIV_MODELS}/${newModelData.modelId}`,
        );

        data = (await responseCiv.json()) as CivitaiModelDoc;
        modelVersions = data?.modelVersions;
      } else {
        data = modelData.data;
        modelVersions = data?.modelVersions.filter(
          (version) =>
            modelData?.modelVersionsCustomData &&
            Object.keys(modelData?.modelVersionsCustomData).includes(
              `${version.id}`,
            ),
        );
      }

      if (!data?.id) {
        throw new AppError(ERROR_MESSAGE_INVALID_DATA);
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
            (dlData) => Number.parseInt(dlData.id) === version.id,
          )?.value;
        }

        const dlStatus =
          newModelData.versionsDownloadStatus.length ||
          newModelData.modelVersionId === version.id
            ? !!curVersionDlStatus
            : false;
        const currVersionData = Object.hasOwn(
          modelVersionsCustomData,
          version.id,
        )
          ? modelVersionsCustomData[version.id]
          : {};

        let fileName;
        if (Object.hasOwn(version, "files") && version?.files) {
          fileName = clearFileExtension(
            version.files.find((file) => file?.primary)?.name || "",
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
        (version) =>
          modelVersionsCustomData[version.id].downloadStatus === true,
      )?.id;

      const activePreviewImg =
        (activePreviewId &&
          modelVersions
            ?.find((version) => version.id === activePreviewId)
            ?.images?.filter((img) => img.type === "image")[0]) ||
        "";

      const previewImgDefault =
        (modelVersions.length &&
          modelVersions[0]?.images?.length &&
          modelVersions[0]?.images[0]) ||
        "";

      const previewImgData = activePreviewImg || previewImgDefault;
      const imagePreviews =
        previewImgData &&
        transformSrcPreview(
          previewImgData?.url,
          SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
          previewImgData?.type,
        );
      const previewImg = imagePreviews && imagePreviews?.previewSrc;

      const fileNames = modelVersions?.flatMap((version) => {
        if (Object.hasOwn(version, "files") && version?.files) {
          return [
            ...new Set(
              version.files
                .filter((file) => file?.type === "Model")
                .map((file) => clearFileExtension(file?.name).toLowerCase()),
            ),
          ];
        }
        return [];
      });

      const hashes = modelVersions
        ?.flatMap((version) => {
          if (Object.hasOwn(version, "files") && version?.files) {
            return version?.files
              .filter((file) => file?.type === "Model")
              .flatMap((file) => Object.values(file?.hashes).filter(Boolean))
              .map((hash) => hash.toLowerCase());
          }
          return [];
        })
        .filter(Boolean);

      const customFileNames = Object.values(modelVersionsCustomData)?.flatMap(
        (version) => {
          if (version?.fileName) {
            return clearFileExtension(version.fileName)?.toLowerCase();
          }
          return [];
        },
      );

      const nameArr =
        (newModelData.modelName || data.name)
          .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "")
          .toLowerCase()
          .split(" ") || [];

      const versionIds = modelVersions?.map((version) => version.id) || [];

      const baseModels = [
        ...new Set(
          modelVersions?.flatMap((version) => version?.baseModel || []),
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
            (curBaseModel) => curBaseModel === baseModel,
          );
          if (!exists) {
            newBaseModel = true;
          }
        });
      }

      let updatedCategories: ModelCategory[];
      let mainId: string | null;
      let subIds: string[];
      const mainCategoryData = categories[newModelData.modelType]?.find(
        (category) =>
          category.name?.toLowerCase() === newModelData.main?.toLowerCase(),
      );

      if (!mainCategoryData) {
        newCategory = true;
        const currCategories = categories[newModelData.modelType] || [];
        mainId = createCategoryId(
          newModelData.main,
          categories[newModelData.modelType],
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
          const subExists = mainCategoryData?.subcategories?.find(
            (oldSucategories) =>
              oldSucategories.name?.toLowerCase() ===
              subcategory?.toLowerCase(),
          );

          if (!subExists && mainCategoryData?.subcategories) {
            newSubcategory = true;
            const categoryId = createCategoryId(
              subcategory,
              mainCategoryData.subcategories,
            );

            subIds = [...subIds, categoryId];
            return {
              id: categoryId,
              name: subcategory,
            };
          }
          if (subExists) {
            subIds = [...subIds, subExists.id];
            return [];
          }
          return [];
        });
        const mainCategoryIndex = categories[newModelData.modelType].findIndex(
          (category) => category.name === newModelData.main,
        );

        const curUpdatedCategory = {
          id: mainId,
          name: mainCategoryData.name,
          subcategories: [
            ...(mainCategoryData.subcategories || []),
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
        if (!categories || !Object.keys(categories)?.length) {
          batch.set(
            userRef,
            {
              categoriesById: { [newModelData.modelType]: updatedCategories },
              baseModels: baseModels,
            },
            { merge: true },
          );
        } else {
          batch.update(userRef, {
            [categoryField]: updatedCategories,
            baseModels: arrayUnion(...baseModels),
          });
        }
      }

      let createdAt;
      if (modelData?.createdAt) {
        createdAt =
          typeof modelData?.createdAt === "number"
            ? modelData?.createdAt
            : Date.parse(modelData?.createdAt);
      } else {
        createdAt =
          (modelData?.downloadedAt && Date.parse(modelData?.downloadedAt)) ||
          Date.now();
      }

      const modelInfo = {
        ...modelData,
        id: modelData?.id || +newModelData.modelId,
        versionIds,
        modelType: newModelData.modelType,
        main: mainId,
        sub: subIds,
        name: newModelData.modelName || data.name,
        hashtags: newModelData.hashtags,
        mainTag: newModelData.mainTag || "",
        nsfw: newModelData.nsfw || false,
        src: "civitai.com",
        modelVersionsCustomData,
        savedImages: modelData?.savedImages || {},
        updatedAt: new Date().toISOString(),
        createdAt,
      };

      let previewModelVersionsCustomData: ModelVersionsCustomData = {};

      Object.values(modelVersionsCustomData).forEach((version) => {
        if (version?.versionId) {
          previewModelVersionsCustomData[version.versionId] = {
            size: version?.size || null,
            weight: version?.weight || null,
            minWeight: version?.minWeight || null,
            maxWeight: version?.maxWeight || null,
            fileName: version?.fileName || "",
            name: version?.name || "",
            mainTag: version?.mainTag || "",
            index: version?.index || 0,
            downloadStatus: version?.downloadStatus || false,
            trainedWords: version?.trainedWords || [],
            defActTag: version?.defActTag || "",
            versionId: version?.versionId,
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
        imgType: (previewImgData && previewImgData?.type) || "",
        type: data.type,
        creator: data?.creator || "",
        nsfw: newModelData.nsfw || false,
        nsfwLevel: data?.nsfwLevel || "",
        baseModel: modelVersions[0].baseModel,
        baseModels: [...baseModels],
        mainTag: newModelData.mainTag || "",
        fileName: newModelData.fileName || "",
        latestFileName: fileNames?.length ? fileNames[0] : "",
        hashes,
        fileNames,
        customFileNames,
        size: newModelData.size || null,
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

      return {
        preview: loraPrevData,
        modelData: modelInfo,
        baseModels: updatedBaseModels,
      };
    }
  } catch (error) {
    console.log(error);
    throw normalizeError(error);
  }
};
