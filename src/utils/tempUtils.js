/**
 * Fix for Civitai bug with meta data in meta.meta
 * @param {array} images - Images data
 * @returns Updated images with fixed data
 */
export const fixCivImagesMeta = (images) => {
  return images.map((image) => {
    if (image?.meta && image?.meta?.meta) {
      return { ...image, meta: { ...image.meta, ...image.meta.meta } };
    }
    return image;
  });
};
