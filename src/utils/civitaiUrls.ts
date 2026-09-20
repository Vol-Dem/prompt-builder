import { URL_CIV_IMAGES } from "../variables/constants";

type CivitaiImageFeedOptions = {
  modelId?: number;
  versionId?: number;
  username?: string;
  limit?: number;
  sortBy?: string;
  nsfwLevel: string | number;
};

/** Builds a model or author image feed URL with the existing raw query values. */
export const buildCivitaiImageFeedUrl = ({
  modelId,
  versionId,
  username,
  limit,
  sortBy,
  nsfwLevel,
}: CivitaiImageFeedOptions): string => {
  const source = username
    ? `username=${username}`
    : `modelId=${modelId}&modelVersionId=${versionId}`;

  return `${URL_CIV_IMAGES}?${source}${limit ? `&limit=${limit}` : ""}${sortBy ? `&sort=${sortBy}` : ""}&nsfw=${nsfwLevel}&withMeta=true`;
};

type CivitaiPostImagesOptions = {
  postId: number;
  modelId?: number | null;
  nsfwLevel: string | number;
};

/** Builds a post image URL, optionally restricted to a model. */
export const buildCivitaiPostImagesUrl = ({
  postId,
  modelId,
  nsfwLevel,
}: CivitaiPostImagesOptions): string =>
  `${URL_CIV_IMAGES}?postId=${postId}${modelId ? `&modelId=${modelId}` : ""}&nsfw=${nsfwLevel}&withMeta=true`;
