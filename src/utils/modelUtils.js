import { throwCustomError } from "./generalUtils";

/**
 * Parse model an version IDs from string (ID, URL, AIR)
 * @param {String} value - string value
 * @returns {Array} an array with the model ID as the first element and the version ID as the second one
 */
export const parseModelIds = (value) => {
  if (value.includes("urn:air")) {
    const airArr = value.split(":");
    const ids = airArr[airArr.length - 1]
      .split("@")
      .map((id) => parseFloat(id));

    return ids;
  } else {
    const urlArr = value.split("/");
    const modelIdIndex =
      urlArr.findIndex((urlPart) => urlPart === "models") + 1;
    const modelVersionIdUrlArr = urlArr
      .find((urlPart) => urlPart.includes("modelVersionId"))
      ?.split("=");

    if (modelIdIndex < 0) {
      throwCustomError("Invalid ID");
    } else {
      const modelId = parseInt(urlArr[modelIdIndex]) || null;
      let modelVersionId = null;

      if (modelVersionIdUrlArr?.length) {
        modelVersionId =
          parseInt(modelVersionIdUrlArr[modelVersionIdUrlArr.length - 1]) ||
          null;
      }

      return [modelId, modelVersionId];
    }
  }
};

/**
 * Sort model versions by index and removes one that was not updated by current user.
 * @param {*} model - model data
 * @returns {Array} - sorted and filtered model versions
 */
export const sortModelVersions = (model) => {
  return model?.data?.modelVersions
    .filter((version) =>
      Object.keys(model?.modelVersionsCustomData).includes(`${version.id}`)
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
 * @param {Object} model - model data
 * @param {Array} modelVersions - model versions
 * @param {String} versionIdParam - search param ID
 * @returns  {Number} version ID
 */
export const getCurrentVersionId = (model, modelVersions, versionIdParam) => {
  let curVersionId;
  if (
    versionIdParam &&
    !!modelVersions?.find((version) => version.id === +versionIdParam)
  ) {
    curVersionId = +versionIdParam;
  } else {
    curVersionId = modelVersions?.find(
      (version) =>
        model?.modelVersionsCustomData.hasOwnProperty(version.id) &&
        model.modelVersionsCustomData[version.id].downloadStatus
    )?.id;
  }

  return curVersionId;
};

/**
 * Compare old and new model data and returns new model versions
 * @param {Object} newModelData - new model data
 * @param {Object} oldModelData - old model data
 * @returns {Array} new model versions
 */
export const filterNewModelVersions = (newModelData, oldModelData) => {
  const newVersions = newModelData?.modelVersions?.filter(
    (version) =>
      !Object.values(oldModelData?.modelVersionsCustomData)?.some(
        (oldVersions) => version?.id === oldVersions?.versionId
      )
  );

  return newVersions;
};

/**
 * Creates object with preview data
 * @param {Object} model - model data
 * @param {Object} curVersion - current version data
 * @param {Object} curCustomVersionData - current custom version data
 * @returns {Object} preview data
 */
export const createModelPreviewData = (
  model,
  curVersion,
  curCustomVersionData
) => {
  if (!model.id || !curVersion.id) return null;
  return {
    id: model.id,
    versionId: curVersion.id,
    src: model.src,
    main: model.main,
    sub: model.sub,
    title: model.name || model.title || model.data.name,
    versionName:
      curCustomVersionData?.name ||
      curCustomVersionData?.versionName ||
      curVersion.name,
    imgUrl: curVersion?.images[0]?.url,
    modelType: model?.data?.type,
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
    size: curCustomVersionData?.size || model?.defaultCustomData?.size,
    tags: curCustomVersionData?.trainedWords || curVersion?.trainedWords,
    helperTags:
      curCustomVersionData?.helperTags || model?.defaultCustomData?.helperTags,
    updatedAt: model?.updatedAt,
  };
};

/**
 * Parse model type from string
 * @param {String} value - string value
 * @returns {String} model type
 */
export const parseMoelType = (value) => {
  return value
    .replace(/[{}]/g, "")
    .split(",")
    .find((field) => field.includes("Type"))
    .split("=")[1];
};
