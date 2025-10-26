import {
  arrayUnion,
  deleteDoc,
  doc,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import { getAuth } from "firebase/auth";
import {
  ERROR_MESSAGE_CIV_CONNECTION,
  SETTINGS_LOAD_DEFAULT_DATA_FROM_CIV,
  URL_CF_UPDATE_MODEL,
} from "../../variables/constants";
import {
  fetchData,
  fetchDataFromFirestore,
  fetchUserDataFromFirestore,
  makeBatchRequest,
} from "./fetchUtils";
import { deleteImagePostDocs } from "./fetchImages";
import { clearFileExtension, throwCustomError } from "../generalUtils";
import { transformModelData } from "../transformUtils";
import { cleanImageMeta } from "../imageUtils";

const firestore = getFirestore(firebaseApp);
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
  console.log(updateModelResData);
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
