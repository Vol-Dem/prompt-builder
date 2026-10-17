import type { CivitaiFetchResult } from "../../../shared/types/api";
import type { Image } from "../../../shared/types/image";
import { buildCivitaiPostImagesUrl } from "../civitaiUrls";
import { fetchCivitaiItems } from "./fetchCivitaiData";

export const fetchCivitaiImagePage = (
  url: string,
  signal: AbortSignal,
): Promise<CivitaiFetchResult> => {
  return fetchCivitaiItems(url, { signal });
};

export const fetchCivitaiPostImagesForSelection = (
  options: Parameters<typeof buildCivitaiPostImagesUrl>[0],
): Promise<{ items: Image[] }> => {
  return fetchCivitaiItems<Image>(buildCivitaiPostImagesUrl(options));
};

/** Uploads retain their version-specific URL and caller-owned empty-result check. */
export const fetchCivitaiPostImagesForUpload = ({
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
  return fetchCivitaiItems<Image>(
    `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}${
      nsfwMode ? `&nsfw=X` : `&nsfw=None`
    }`,
  );
};
