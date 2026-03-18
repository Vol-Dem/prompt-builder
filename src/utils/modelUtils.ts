import type {
  CivitaiModelDoc,
  ModelPreview,
  ModelPreviewDoc,
  UserModelDoc,
} from "../../shared/types/firestore";
import type {
  ModelVersionCivitai,
  ModelVersionCustomData,
} from "../../shared/types/model";
import type { SidebarPreviewData } from "../types/general.types";
import type { ModelData } from "../types/models.types";
import { AppError } from "./generalUtils";

/**
 * Parse model an version IDs from string (ID, URL, AIR)
 * @param {string} value - string value
 * @returns {array} an array with the model ID as the first element and the version ID as the second one
 */
export const parseModelIds = (value: string): (number | null)[] => {
  if (Number.isFinite(+value)) {
    return [+value, null];
  }

  if (value.includes("urn:air")) {
    const airArr = value.split(":");
    const ids = airArr[airArr.length - 1]
      .split("@")
      .map((id) => parseFloat(id));

    return ids;
  }

  const urlArr = value.split("/");
  const modelIdIndex = urlArr.findIndex((urlPart) => urlPart === "models") + 1;
  const modelVersionIdUrlArr = urlArr
    .find((urlPart) => urlPart.includes("modelVersionId"))
    ?.split("=");

  if (modelIdIndex < 0) {
    throw new AppError("Invalid ID");
  }

  const modelId = parseInt(urlArr[modelIdIndex]) || null;
  let modelVersionId = null;

  if (modelVersionIdUrlArr?.length) {
    modelVersionId =
      parseInt(modelVersionIdUrlArr[modelVersionIdUrlArr.length - 1]) || null;
  }

  return [modelId, modelVersionId];
};

/**
 * Sort model versions by index and removes one that was not updated by current user.
 * @param {ModelData} model - model data
 * @returns {ModelVersionCivitai[]} - sorted and filtered model versions
 */
export const sortModelVersions = (
  model: ModelData,
): ModelVersionCivitai[] | null => {
  if (!model?.data) {
    return null;
  }
  return model?.data?.modelVersions
    .filter((version) =>
      Object.keys(model?.modelVersionsCustomData).includes(`${version.id}`),
    )
    .sort((a, b) => a?.index - b?.index)
    .map((version) => {
      return {
        ...version,
        id: version.id,
        name: version.name,
      };
    });
};

/**
 * Get initial current version ID
 * @param {object} model - model data
 * @param {array} modelVersions - model versions
 * @param {string} versionIdParam - search param ID
 * @returns {number} version ID
 */
export const getCurrentVersionId = (
  model: ModelData,
  modelVersions: ModelVersionCivitai[],
  versionIdParam: string,
): number | null => {
  let curVersionId: number | null = null;
  if (
    versionIdParam &&
    !!modelVersions?.find((version) => version.id === +versionIdParam)
  ) {
    curVersionId = +versionIdParam;
  } else {
    curVersionId =
      modelVersions?.find(
        (version) =>
          model?.modelVersionsCustomData &&
          Object.hasOwn(model.modelVersionsCustomData, version.id) &&
          model.modelVersionsCustomData[version.id].downloadStatus,
      )?.id || null;
  }

  return curVersionId;
};

/**
 * Compare old and new model data and returns new model versions
 * @param {CivitaiModelDoc} newModelData - new model data
 * @param {UserModelDoc | ModelData} oldModelData - old user model data
 * @returns {array} new model versions
 */
export const filterNewModelVersions = (
  newModelData: CivitaiModelDoc,
  oldModelData: UserModelDoc | ModelData,
): ModelVersionCivitai[] => {
  const newVersions = newModelData?.modelVersions?.filter(
    (version) =>
      !Object.values(oldModelData?.modelVersionsCustomData)?.some(
        (oldVersions) => version?.id === oldVersions?.versionId,
      ),
  );

  return newVersions;
};

/**
 * Creates object with preview data
 * @param {object} model - model data
 * @param {object} curVersion - current version data
 * @param {object} curCustomVersionData - current custom version data
 * @returns {object} preview data
 */
export const createModelPreviewData = (
  model: ModelData,
  curVersion: ModelVersionCivitai,
  curCustomVersionData: ModelVersionCustomData,
): ModelPreview | null => {
  if (!model?.id || !curVersion?.id) return null;

  return {
    id: model.id,
    versionId: curVersion.id,
    src: model.src,
    main: model.main,
    sub: model.sub,
    title: model.name || model.data?.name,
    versionName:
      curCustomVersionData?.name ||
      curCustomVersionData?.versionName ||
      curVersion.name,
    imgUrl: curVersion?.images ? curVersion?.images[0]?.url : "",
    modelType: model?.data?.type || "",
    baseModel: curVersion?.baseModel,
    mainTag:
      curCustomVersionData?.mainTag ||
      model?.mainTag ||
      curCustomVersionData?.defActTag,
    weight: curCustomVersionData?.weight || model?.defaultCustomData?.weight,
    minWeight:
      curCustomVersionData?.minWeight || model?.defaultCustomData?.minWeight,
    maxWeight:
      curCustomVersionData?.maxWeight || model?.defaultCustomData?.maxWeight,
    size: curCustomVersionData?.size || model?.defaultCustomData?.size || null,
    tags: curCustomVersionData?.trainedWords || curVersion?.trainedWords,
    helperTags:
      curCustomVersionData?.helperTags || model?.defaultCustomData?.helperTags,
    updatedAt: model?.updatedAt,
  };
};

/**
 * Creates object with sidebar preview data
 * @param {number} versionId - version ID
 * @param {ModelPreviewDoc} previewData - current preview data
 * @param {ModelVersionCustomData} curVersionData - current custom version data
 * @returns {SidebarPreviewData} preview data
 */
export const createSidebarPreviewData = (
  versionId: number,
  previewData: ModelPreviewDoc,
  curVersionData: ModelVersionCustomData,
): SidebarPreviewData => {
  return {
    ...previewData,
    activeVersionId: versionId || null,
    title: previewData?.name || previewData?.title,
    versionName: previewData?.versionName || curVersionData?.name,
    imgUrl: previewData?.customPreviewImgUrl || previewData?.imgUrl,
    type: previewData?.type || previewData?.modelType,
    baseModel: curVersionData?.baseModel || previewData?.baseModel,
    mainTag:
      curVersionData?.mainTag ||
      previewData?.mainTag ||
      curVersionData?.defActTag,
    weight: curVersionData?.weight || previewData?.weight || null,
    minWeight: curVersionData?.minWeight || previewData?.minWeight || null,
    maxWeight: curVersionData?.maxWeight || previewData?.maxWeight || null,
    size: curVersionData?.size || previewData?.size,
    tags: curVersionData?.trainedWords || previewData?.tags || null,
    helperTags: curVersionData?.helperTags || previewData?.helperTags,
    updatedAt: previewData?.updatedAt,
  };
};

/**
 * Parse model type from string
 * @param {string} value - string value
 * @returns {string} model type
 */
export const parseMoelType = (value: string): string | null => {
  return (
    value
      ?.replace(/[{}]/g, "")
      ?.split(",")
      ?.find((field) => field.includes("Type"))
      ?.split("=")[1] || null
  );
};

/**
 * Selects the initial version data:
 * - Selects by version ID search parameter if corresponding version data is present
 * - Selects the latest saved version if the version ID search parameter is missing.
 * @param {object} model - model data
 * @param {string} versionIdParam - version ID search parameter
 * @returns version data
 */
export const getInitialVersionData = (
  model: ModelData,
  versionIdParam: string,
): ModelVersionCivitai | null => {
  const modelVersions = sortModelVersions(model);
  if (!modelVersions) {
    return null;
  }
  const curVersionId = getCurrentVersionId(
    model,
    modelVersions,
    versionIdParam,
  );

  const selectedVersionData = modelVersions?.find(
    (version) => version.id === curVersionId,
  );
  const curVersionData = selectedVersionData || modelVersions[0];

  return curVersionData;
};
