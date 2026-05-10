import type {
  AdditionalResource,
  CivitaiResource,
  ComfyResource,
  Image,
  ModelResource,
} from "../../shared/types/image";
import { clearFileExtension, extractComfyResources } from "../../shared/utils";
import type { ImageSrcs } from "../types/images.types";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_DEF } from "../variables/constants";
import {
  checkIsInCurrentNsfwRange,
  // clearFileExtension,
  filterDuplicates,
} from "./generalUtils";
import { parseModelIds } from "./modelUtils";

/**
 * Creates a new src link to request image/video with desired width and separate links for video in different formats
 * @param src - image/video src
 * @param width - desired image/video width
 * @param type - file type: "video" or "image"
 * @returns object with previews {previewSrc, previewVideoWebmSrc, previewVideoMp4Src, originalVideoMp4Src, originalVideoWebmSrc}
 */
export const transformSrcPreview = (
  src: string,
  width: number = SETTINGS_IMAGE_PREVIEW_WIDTH_DEF,
  type: string = "image",
): ImageSrcs => {
  // if (!src) return {previewSrc: src};

  let previewSrc;
  let previewVideoWebmSrc;
  let previewVideoMp4Src;
  let originalVideoMp4Src;
  let originalVideoWebmSrc;
  const srcArr = src.split("/");
  const widthIndex = srcArr.findIndex((srcSlice) => srcSlice.includes("width"));
  const originalIndex = srcArr.findIndex((srcSlice) =>
    srcSlice.includes("original"),
  );
  const configIndex = widthIndex < 0 ? originalIndex : widthIndex;

  if (configIndex < 0) {
    previewSrc = src;
    previewVideoWebmSrc = src;
    previewVideoMp4Src = src;
    originalVideoMp4Src = src;
    originalVideoWebmSrc = src;
  } else {
    const imgSrc =
      type === "video" || checkIsVideo(src)
        ? `anim=false,transcode=true,width=${width}`
        : `anim=false,width=${width},optimized=true`;

    previewSrc = srcArr.toSpliced(configIndex, 1, imgSrc).join("/");

    if (type === "video") {
      const videoSrc = `transcode=true,width=${width},quality=90`;
      const videoOriginalSrc = `anim=true,transcode=true,original=true,quality=90`;

      previewVideoMp4Src = srcArr.toSpliced(configIndex, 1, videoSrc).join("/");
      originalVideoMp4Src = srcArr
        .toSpliced(configIndex, 1, videoOriginalSrc)
        .join("/");
      previewVideoWebmSrc = srcArr
        .toSpliced(configIndex, 1, videoSrc)
        .join("/")
        .replace(".mp4", "webm");
      originalVideoWebmSrc = srcArr
        .toSpliced(configIndex, 1, videoOriginalSrc)
        .join("/")
        .replace(".mp4", "webm");
    }
  }

  return {
    previewSrc,
    previewVideoWebmSrc,
    originalVideoWebmSrc,
    previewVideoMp4Src,
    originalVideoMp4Src,
  };
};

/**
 * Parce post ID from post url (can be post url or post ID)
 * @param postInput - input string
 * @returns post ID
 */
export const getPostIdFromInput = (postInput: string): number | null => {
  if (Number.isFinite(+postInput)) {
    return +postInput;
  }
  const postInputArr = postInput.split("/");
  const postId = postInputArr[postInputArr.length - 1];

  if (Number.isFinite(+postId)) {
    return +postId;
  } else {
    return null;
  }
};

/**
 * Parce uniq ID from video url
 * (to have a unique value due to another Civitai bug with the same hash for all videos in a post)
 * @param url - image url
 * @returns uniq ID
 */
export const getUrlId = (url: string): string | null => {
  if (typeof url !== "string") return null;
  return clearFileExtension(url.split("/").slice(-1)[0]);
};

/**
 * Check if current url is video
 * @param url - url
 * @returns
 */
export const checkIsVideo = (url: string): boolean => {
  return (
    url
      .split(".")
      .findIndex((element) => element === "mp4" || element === "webm") > -1
  );
};

/**
 * Removes images that are not in the current NSFW range.
 * @param images - images data
 * @param nsfwLevel - current NSFW Level
 * @returns filtered images
 */
export const filterNsfwImages = (
  images: Image[],
  nsfwLevel: string,
): Image[] => {
  return images?.filter((image) => {
    if (image?.nsfwLevel) {
      return checkIsInCurrentNsfwRange(nsfwLevel, image.nsfwLevel);
    }

    return image?.nsfw === "None" || image?.nsfw === false;
  });
};

/**
 * Creates an array of arrays in which all elements are grouped and sorted by a specified fields
 * @param items - array of objects
 * @param groupBy - field to group by
 * @param sortBy - field to sort by
 * @returns an array of arrays in which all elements are grouped and sorted by a specified fields
 */
export const groupAndSortByField = <
  T,
  GroupKey extends keyof T,
  SortKey extends keyof T,
>(
  items: T[],
  groupBy: GroupKey,
  sortBy: SortKey,
): T[][] => {
  const grouped: Record<string, T[]> = {};

  for (const item of items) {
    const key = String(item[groupBy]);

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(item);
  }

  for (const key in grouped) {
    grouped[key].sort(
      (a, b) =>
        Date.parse(a[sortBy] as string) - Date.parse(b[sortBy] as string),
    );
  }

  return Object.values(grouped).sort(
    (a, b) =>
      Date.parse(b[b.length - 1][sortBy] as string) -
      Date.parse(a[a.length - 1][sortBy] as string),
  );
};

/**
 * Removes empty keys and comfy data from image meta
 * @param image - image data
 * @returns cleaned image data
 */
export const cleanImageMeta = (image: Image): Image => {
  if (image?.meta) {
    const metaArr = Object.entries(image.meta).filter((entry) => !!entry[0]);

    const updatedMeta = Object.fromEntries(metaArr);

    if (updatedMeta?.comfy) {
      updatedMeta.comfy = "";
    }

    return {
      ...image,
      meta: updatedMeta,
    };
  } else {
    return image;
  }
};

/**
 * Creates array of uniq image resources
 * @param imageData - image data
 * @returns aray of unique image resources
 */
export const getUniqImageResources = (
  imageData: Image,
): (CivitaiResource | ModelResource | AdditionalResource | ComfyResource)[] => {
  const resources = imageData?.meta?.resources || [];
  const additionalResources =
    imageData?.meta?.additionalResources?.map((res) => {
      const [modelId, modelVersionId] = parseModelIds(res.name);
      return {
        ...res,
        modelId,
        modelVersionId,
      };
    }) || [];
  const civitaiResources = imageData?.meta?.civitaiResources || [];
  const idResources =
    imageData?.modelVersionIds?.map((versionId) => ({
      modelVersionId: versionId,
    })) || [];
  const comfyResources =
    imageData?.meta?.comfyResources ||
    extractComfyResources(imageData?.meta?.comfy);

  const allImageResources = [
    ...resources,
    ...additionalResources,
    ...civitaiResources,
    ...idResources,
    ...comfyResources,
  ];

  return filterDuplicates(allImageResources, "modelVersionId");
};

export const combineImagesData = (
  newImageData: Image[],
  oldImageData: Image[],
  isTester?: boolean,
) => {
  return filterDuplicates(
    [
      ...oldImageData,
      ...newImageData.map((item) => {
        let data = { ...item };
        const curData = oldImageData.find((oldItem) => oldItem.id === item.id);
        if (
          curData &&
          !item.modelVersionIds?.length &&
          !!curData.modelVersionIds?.length &&
          isTester
        ) {
          data = {
            ...data,
            modelVersionIds: curData.modelVersionIds,
          };
        }

        if (
          curData &&
          !item?.meta?.prompt &&
          !!curData?.meta?.prompt &&
          isTester
        ) {
          data = {
            ...data,
            meta: { ...item?.meta, ...curData.meta },
          };
        }

        return data;
      }),
    ],
    "id",
  );
};
