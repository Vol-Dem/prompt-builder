import { SETTINGS_IMAGE_PREVIEW_WIDTH_DEF } from "../variables/constants";
import { checkIsInCurrentNsfwRange, clearFileExtension } from "./generalUtils";

/**
 * Creates a new src link to request image/video with desired width and separate links for video in different formats
 * @param {String} src - image/video src
 * @param {Number} width - desired image/video width
 * @param {String} type - file type: "video" or "image"
 * @returns {Object} object with previews {previewSrc, previewVideoWebmSrc, previewVideoMp4Src, originalVideoMp4Src, originalVideoWebmSrc}
 */
export const transformSrcPreview = (
  src,
  width = SETTINGS_IMAGE_PREVIEW_WIDTH_DEF,
  type = "image"
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
    srcSlice.includes("original")
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
        : `width=${width}`;

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
 * @param {String} postInput - input string
 * @returns {Number} post ID
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
 * @param {String} url - image url
 * @returns {String} uniq ID
 */
export const getUrlId = (url) => {
  if (typeof url !== "string") return null;
  return clearFileExtension(url?.split("/").pop());
};

/**
 * Check if current url is video
 * @param {String} url - url
 * @returns {Boolean}
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
 * @param {Array} images - images data
 * @param {String} nsfwLevel - current NSFW Level
 * @returns {Array} filtered images
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
 * @param {Array} items - array of objects
 * @param {String} groupBy - field to group by
 * @param {String} sortBy - field to sort by
 * @returns {Array} an array of arrays in which all elements are grouped and sorted by a specified fields
 */
export const groupAndSortByField = (items, groupBy, sortBy) => {
  const sortedItems = {};

  items.forEach((item) => {
    if (sortedItems.hasOwnProperty(item.postId)) {
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

  const images = sortedImageArr.map((key, i) => {
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
 * @param {Object} image - image data
 * @returns {Object} cleaned image data
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
