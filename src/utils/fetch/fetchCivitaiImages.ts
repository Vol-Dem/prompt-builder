import type { CivitaiFetchResult } from "../../../shared/types/api";
import type { Image } from "../../../shared/types/image";
import { buildCivitaiPostImagesUrl } from "../civitaiUrls";
import { AppError } from "../generalUtils";
import { ERROR_MESSAGE_CIV_CONNECTION } from "../../variables/constants";

/** The feed validates items but retains its existing HTTP status handling. */
export const fetchCivitaiImagePage = async (
  url: string,
  signal: AbortSignal,
): Promise<CivitaiFetchResult> => {
  const response = await fetch(url, { signal });
  const data = (await response.json()) as CivitaiFetchResult;
  if (!data?.items) {
    throw new AppError(ERROR_MESSAGE_CIV_CONNECTION);
  }
  return data;
};

/** Image selection rejects HTTP 500 before attempting to decode the body. */
export const fetchCivitaiPostImagesForSelection = async (
  options: Parameters<typeof buildCivitaiPostImagesUrl>[0],
): Promise<{ items: Image[] }> => {
  const response = await fetch(buildCivitaiPostImagesUrl(options));
  if (response.status === 500) {
    throw new AppError(ERROR_MESSAGE_CIV_CONNECTION);
  }
  return response.json();
};

/** Uploads retain their version-specific URL and caller-owned empty-result check. */
export const fetchCivitaiPostImagesForUpload = async ({
  postId,
  modelId,
  versionId,
  nsfwMode,
}: {
  postId: number;
  modelId?: number | null;
  versionId?: number | null;
  nsfwMode: boolean;
}): Promise<{ items: Image[] }> => {
  const response = await fetch(
    `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}${
      nsfwMode ? `&nsfw=X` : `&nsfw=None`
    }`,
  );
  return response.json();
};
