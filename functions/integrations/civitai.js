import { HttpsError } from "firebase-functions/v2/https";

/**
 * Fetches model data from Civitai.
 *
 * @param {number | string} modelId - Civitai model ID.
 * @returns {Object} The model data.
 */
export const fetchModel = async (modelId) => {
  const responseCiv = await fetch(
    `https://civitai.com/api/v1/models/${modelId}`,
  );

  const responseData = await responseCiv.json();

  if (responseData.error) {
    throw new HttpsError("internal", responseData.error);
  }

  return responseData;
};

/**
 * Fetches model images from Civitai.
 *
 * @param {number | string} modelId - Civitai model ID.
 * @param {number | string} versionId - Civitai model version ID.
 * @param {string} username - Civitai creator name.
 * @returns {Array} The model images.
 */
export const fetchImages = async (modelId, versionId, username) => {
  const versionImagesRequest = await fetch(
    `https://civitai.com/api/v1/images?modelId=${modelId}&modelVersionId=${versionId}&username=${username}&nsfw=X&limit=200&sort=Oldest`,
  );
  return await versionImagesRequest.json();
};
