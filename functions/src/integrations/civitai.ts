import { HttpsError } from "firebase-functions/v2/https";
import type { CivitaiModelDoc } from "../shared/types/firestore.js";
import { Image } from "../shared/types/image.js";
/**
 * Fetches model data from Civitai.
 *
 * @param {number | string} modelId - Civitai model ID.
 * @returns {Promise<CivitaiModelDoc>} The model data.
 */
export const fetchModel = async (
  modelId: number | string,
): Promise<CivitaiModelDoc> => {
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
 * @returns {Image[]} The model images.
 */
export const fetchImages = async (
  modelId: number | string,
  versionId: number | string,
  username: string,
): Promise<{ items: Image[] }> => {
  const versionImagesRequest = await fetch(
    `https://civitai.com/api/v1/images?modelId=${modelId}&modelVersionId=${versionId}&username=${username}&nsfw=X&limit=200&sort=Oldest`,
  );
  return await versionImagesRequest.json();
};
