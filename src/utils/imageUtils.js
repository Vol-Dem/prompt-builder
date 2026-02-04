import { clearFileExtension } from "../../shared/utils";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_DEF } from "../variables/constants";
import {
  checkIsInCurrentNsfwRange,
  // clearFileExtension,
  filterDuplicates,
} from "./generalUtils";
import { parseModelIds } from "./modelUtils";

/**
 * Creates a new src link to request image/video with desired width and separate links for video in different formats
 * @param {string} src - image/video src
 * @param {number} width - desired image/video width
 * @param {string} type - file type: "video" or "image"
 * @returns {object} object with previews {previewSrc, previewVideoWebmSrc, previewVideoMp4Src, originalVideoMp4Src, originalVideoWebmSrc}
 */
export const transformSrcPreview = (
  src,
  width = SETTINGS_IMAGE_PREVIEW_WIDTH_DEF,
  type = "image",
) => {
  if (!src) return;

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
 * @param {string} postInput - input string
 * @returns {number} post ID
 */
export const getPostIdFromInput = (postInput) => {
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
 * @param {string} url - image url
 * @returns {string} uniq ID
 */
export const getUrlId = (url) => {
  if (typeof url !== "string") return null;
  return clearFileExtension(url?.split("/").pop());
};

/**
 * Check if current url is video
 * @param {string} url - url
 * @returns {boolean}
 */
export const checkIsVideo = (url) => {
  if (typeof url !== "string") return;
  return (
    url
      .split(".")
      .findIndex((element) => element === "mp4" || element === "webm") > -1
  );
};

/**
 * Removes images that are not in the current NSFW range.
 * @param {array} images - images data
 * @param {string} nsfwLevel - current NSFW Level
 * @returns {array} filtered images
 */
export const filterNsfwImages = (images, nsfwLevel) => {
  return images?.filter((image) => {
    if (image?.nsfwLevel) {
      return (
        checkIsInCurrentNsfwRange(nsfwLevel, image.nsfwLevel) ||
        image.nsfwLevel === 1
      );
    } else {
      return image?.nsfw === "None" || image?.nsfw === false;
    }
  });
};

/**
 * Creates an array of arrays in which all elements are grouped and sorted by a specified fields
 * @param {array} items - array of objects
 * @param {string} groupBy - field to group by
 * @param {string} sortBy - field to sort by
 * @returns {array} an array of arrays in which all elements are grouped and sorted by a specified fields
 */
export const groupAndSortByField = (items, groupBy, sortBy) => {
  const sortedItems = {};

  items.forEach((item) => {
    if (Object.hasOwn(sortedItems, item.postId)) {
      sortedItems[item[groupBy]].push(item);
    } else {
      sortedItems[item[groupBy]] = [item];
    }
  });

  if (!sortedItems) return;

  const sortedImageArr = Object.keys(sortedItems).sort((a, b) => {
    return (
      Date.parse(sortedItems[b].slice(-1).pop()[sortBy]) -
      Date.parse(sortedItems[a].slice(-1).pop()[sortBy])
    );
  });

  const images = sortedImageArr.map((key) => {
    return sortedItems[key];
  });

  const sortedImageArrWithSortedImages = images.map((post) => {
    return post.sort((a, b) => {
      return Date.parse(a[sortBy]) - Date.parse(b[sortBy]);
    });
  });

  return sortedImageArrWithSortedImages;
};

/**
 * Removes empty keys and comfy data from image meta
 * @param {object} image - image data
 * @returns {object} cleaned image data
 */
export const cleanImageMeta = (image) => {
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
 * @param {object} imageData - image data
 * @returns {array} aray of unique image resources
 */
export const getUniqImageResources = (imageData) => {
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
  const allImageResources = [
    ...resources,
    ...additionalResources,
    ...civitaiResources,
  ];

  return filterDuplicates(allImageResources, "modelVersionId");
};
