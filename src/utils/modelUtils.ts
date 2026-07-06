import type {
  CivitaiModelDoc,
  CollectionPreviewDoc,
  ModelPreview,
  ModelPreviewDoc,
  UserModelDoc,
} from "../../shared/types/firestore";
import type {
  ModelVersion,
  ModelVersionCivitai,
  ModelVersionCustomData,
} from "../../shared/types/model";
import { clearFileExtension } from "../../shared/utils";
import type { SidebarPreviewData } from "../types/general.types";
import type { ModelData } from "../types/models.types";
import { AppError } from "./generalUtils";

/**
 * Parse model an version IDs from string (ID, URL, AIR)
 * @param value - string value
 * @returns an array with the model ID as the first element and the version ID as the second one
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
 * @param model - model data
 * @returns - sorted and filtered model versions
 */
export const sortModelVersions = (
  model: ModelData,
): ModelVersionCivitai[] | null => {
  if (!model?.data) {
    return null;
  }
  return model?.data?.modelVersions
    .filter(
      (version) =>
        model?.modelVersionsCustomData &&
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
 * @param model - model data
 * @param modelVersions - model versions
 * @param versionIdParam - search param ID
 * @returns version ID
 */
export const getCurrentVersionId = (
  model: ModelData,
  modelVersions: ModelVersionCivitai[],
  versionIdParam: string | null,
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
 * @param newModelData - new model data
 * @param oldModelData - old user model data
 * @returns new model versions
 */
export const filterNewModelVersions = (
  newModelData: CivitaiModelDoc,
  oldModelData: UserModelDoc | ModelData,
): ModelVersionCivitai[] => {
  const newVersions = newModelData?.modelVersions?.filter(
    (version) =>
      oldModelData?.modelVersionsCustomData &&
      !Object.values(oldModelData?.modelVersionsCustomData)?.some(
        (oldVersions) => version?.id === oldVersions?.versionId,
      ),
  );

  return newVersions;
};

/**
 * Creates object with preview data
 * @param model - model data
 * @param curVersion - current version data
 * @param curCustomVersionData - current custom version data
 * @returns preview data
 */
export const createModelPreviewData = (
  model: ModelData | CivitaiModelDoc | null,
  curVersion: ModelVersionCivitai | ModelVersion | null,
  curCustomVersionData?: ModelVersionCustomData | null,
): ModelPreview | null => {
  if (!model?.id || !curVersion?.id) return null;

  return {
    id: model.id,
    versionId: curVersion.id,
    src: "src" in model && model.src ? model.src : "",
    main: ("main" in model && model.main) || "",
    sub: ("sub" in model && model.sub) || [],
    title: model.name || ("data" in model ? model?.data?.name : ""),
    versionName:
      curCustomVersionData?.name ||
      curCustomVersionData?.versionName ||
      curVersion.name,
    imgUrl: curVersion?.images ? curVersion?.images[0]?.url : "",
    imgType: curVersion?.images && curVersion?.images[0]?.type,
    modelType: ("data" in model ? model?.data?.type : model.type) || "",
    baseModel: curVersion?.baseModel,
    type:
      ("data" in model && model?.data?.type) ||
      ("modelType" in model && model?.modelType) ||
      model.type ||
      "",
    mainTag:
      curCustomVersionData?.mainTag ||
      ("mainTag" in model && model?.mainTag) ||
      curCustomVersionData?.defActTag,
    weight:
      curCustomVersionData?.weight ||
      ("defaultCustomData" in model && model?.defaultCustomData?.weight) ||
      null,
    minWeight:
      curCustomVersionData?.minWeight ||
      ("defaultCustomData" in model && model?.defaultCustomData?.minWeight) ||
      null,
    maxWeight:
      curCustomVersionData?.maxWeight ||
      ("defaultCustomData" in model && model?.defaultCustomData?.maxWeight) ||
      null,
    size:
      curCustomVersionData?.size ||
      ("defaultCustomData" in model && model?.defaultCustomData?.size) ||
      null,
    tags: curCustomVersionData?.trainedWords || curVersion?.trainedWords,
    helperTags:
      curCustomVersionData?.helperTags ||
      ("defaultCustomData" in model && model?.defaultCustomData?.helperTags) ||
      [],
    updatedAt: model?.updatedAt + "" || curVersion?.publishedAt || "",
  };
};

/**
 * Creates object with sidebar preview data
 * @param versionId - version ID
 * @param previewData - current preview data
 * @param curVersionData - current custom version data
 * @returns preview data
 */
export const createSidebarPreviewData = (
  versionId: number | null,
  previewData: ModelPreview | CollectionPreviewDoc | ModelPreviewDoc,
  curVersionData?: ModelVersionCustomData | null,
): SidebarPreviewData => {
  if ("src" in previewData) {
    return {
      id: previewData.id,
      activeVersionId: versionId || null,
      title: previewData?.title || previewData?.name,
      versionName: previewData?.versionName || curVersionData?.name || "",
      imgUrl: previewData?.customPreviewImgUrl || previewData?.imgUrl,
      imgUrlNsfw: previewData?.nsfwPreviewImgUrl,
      type: previewData?.modelType,
      baseModel: curVersionData?.baseModel || previewData?.baseModel,
      mainTag:
        curVersionData?.mainTag ||
        previewData?.mainTag ||
        curVersionData?.defActTag,
      weight: curVersionData?.weight || previewData?.weight || null,
      minWeight: curVersionData?.minWeight || previewData?.minWeight || null,
      maxWeight: curVersionData?.maxWeight || previewData?.maxWeight || null,
      tags: curVersionData?.trainedWords || previewData?.tags || null,
    };
  }

  return {
    id: previewData.id,
    title: previewData?.name,
    imgUrl: previewData?.customPreviewImgUrl,
    imgUrlNsfw: previewData?.nsfwPreviewImgUrl,
    type: previewData?.type || "",
  };
};

/**
 * Parse model type from string
 * @param value - string value
 * @returns model type
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
 * @param model - model data
 * @param ersionIdParam - version ID search parameter
 * @returns version data
 */
export const getInitialVersionData = (
  model: ModelData,
  versionIdParam: string | null,
): ModelVersionCivitai | null => {
  const modelVersions = model?.modelVersionsCustomData
    ? sortModelVersions(model)
    : model.data?.modelVersions;

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

/**
 * Creates a default activation tag for LORA models.
 *
 * @param version - model version data
 * @returns activation tag
 */
export const createDefaultActivationTag = (
  version: ModelVersionCivitai | ModelVersion,
): string | null => {
  let fileName;

  if (Object.hasOwn(version, "files") && version?.files) {
    fileName = clearFileExtension(
      version.files.find((file) => file?.primary)?.name || "",
    ).toLowerCase();
  }

  return fileName ? `<lora:${fileName}:1>` : null;
};
