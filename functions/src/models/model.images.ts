import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  clearFileExtension,
  fixCivImagesMeta,
  transformImageData,
} from "@utils/shared";

import { fetchImages } from "../integrations/civitai.js";
import { ModelVersion } from "../shared/types/model.js";
import type { Image } from "@utils/shared/types/image.ts";

/**
 * Fetches and stores version images.
 */
export const saveVersionImages = async (
  modelId: number | string,
  username: string,
  versionsData: ModelVersion[],
) => {
  const updatedModelversions = await Promise.all(
    versionsData?.map(async (version) => {
      const versionImages = await fetchImages(modelId, version.id, username);

      // Fix for Civitai bug with meta data in meta.meta
      const fixedVersionImages = fixCivImagesMeta(
        versionImages?.items,
      ) as Image[];

      if (!version?.images?.length) return;

      const updatedImages = version?.images?.flatMap((image) => {
        const fullImgData = fixedVersionImages?.find((verImg) => {
          if (verImg?.type === "video" && !!verImg?.url) {
            const uniqUrlPart = clearFileExtension(
              verImg.url.split("/").pop()!,
            );
            return uniqUrlPart && image.url.includes(uniqUrlPart);
          }
          return verImg.hash === image.hash;
        });

        if (!fullImgData) return [];

        const transformedImgData = transformImageData(fullImgData || image);

        return { ...image, ...transformedImgData };
      });

      if (!updatedImages?.length) return;

      const modelDataRef = getFirestore()
        .collection("models")
        .doc(`${modelId}`)
        .collection("defaultImages")
        .doc(`${version.id}`);

      const nsfw = [...new Set(updatedImages.map((image) => image.nsfw))];

      modelDataRef.set({
        items: updatedImages.filter(Boolean),
        versionId: versionsData[0]?.id || null,
        default: true,
        createdAt: updatedImages[0]?.createdAt || null,
        savedAt: Timestamp.now().toMillis(),
        nsfw: updatedImages[0]?.nsfw || false,
        nsfwTypes: nsfw,
        nsfwLevel: updatedImages[0]?.nsfwLevel || null,
      });
    }),
  );

  return updatedModelversions;
};
