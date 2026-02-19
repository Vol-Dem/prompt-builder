"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixCivImagesMeta = exports.transformImageData = exports.clearObjectKeys = exports.convertToString = exports.clearFileExtension = exports.SUPPORTED_FILE_EXTENSIONS = void 0;
exports.SUPPORTED_FILE_EXTENSIONS = [
    "safetensors",
    "pt",
    "pth",
    "ckpt",
    "mp4",
    "mov",
    "webm",
];
/**
 * Removes supported file extensions from file name.
 * Supported file extensions: safetensors, pt, pth, ckpt, mp4, mov, webm
 * @param {string} name - The file name
 * @returns The file name without the file extension
 */
const clearFileExtension = (name) => {
    if (!name)
        return;
    //test
    const extension = exports.SUPPORTED_FILE_EXTENSIONS.find((extension) => name.endsWith(`.${extension}`));
    if (extension) {
        return name.replace(`.${extension}`, "");
    }
    else {
        return name;
    }
};
exports.clearFileExtension = clearFileExtension;
/**
 * Converts value to a string
 * @param {*} value - The value to convert
 * @returns The stringified value
 */
const convertToString = (value) => {
    if (typeof value === "string") {
        return value;
    }
    else {
        return JSON.stringify(value);
    }
};
exports.convertToString = convertToString;
/**
 * Removes unsupported Firestore symbols from object keys
 * @param {Object} obj - The object
 * @returns The cleaned object
 */
const clearObjectKeys = (obj) => {
    const convertedMetaArr = Object.entries(obj).map((entry, i) => {
        let newKey;
        newKey = entry[0]
            ? entry[0].replace(/[^\w\s]/gi, "X").replace(/[^\\x00-\\xFF]*/giu, "")
            : `key${i}`;
        newKey = newKey.replaceAll("__", "");
        if (newKey === "" || newKey === undefined) {
            newKey = `key${i}`;
        }
        let newValue = entry[1];
        if (!newValue) {
            newValue = null;
        }
        return [newKey, newValue];
    });
    return Object.fromEntries(convertedMetaArr);
};
exports.clearObjectKeys = clearObjectKeys;
/**
 * Creates an image object
 * @param {Image} imageData - image data
 * @returns {Image} image object
 */
const transformImageData = (imageData) => {
    const newImageData = {
        id: imageData.id,
        ...(imageData?.postId && { postId: imageData.postId }),
        url: imageData?.url || "",
        createdAt: imageData.createdAt,
        nsfw: imageData?.nsfw || false,
        ...(imageData?.hash && { hash: imageData.hash }),
        ...(imageData?.browsingLevel && {
            browsingLevel: imageData.browsingLevel,
        }),
        ...(imageData?.nsfwLevel && { nsfwLevel: imageData.nsfwLevel }),
        ...(imageData?.type && { type: imageData.type }),
        ...(imageData?.username && { username: imageData.username }),
        ...(imageData?.meta && {
            meta: {
                ...(imageData?.meta?.ADetailerconfidence && {
                    ADetailerconfidence: imageData.meta.ADetailerconfidence,
                }),
                ...(imageData?.meta?.ADetailerdenoisingstrength && {
                    ADetailerdenoisingstrength: imageData.meta.ADetailerdenoisingstrength,
                }),
                ...(imageData?.meta?.ADetailerdilateerode && {
                    ADetailerdilateerode: imageData.meta.ADetailerdilateerode,
                }),
                ...(imageData?.meta?.ADetailerinpaintonlymasked && {
                    ADetailerinpaintonlymasked: imageData.meta.ADetailerinpaintonlymasked,
                }),
                ...(imageData?.meta?.ADetailerinpaintpadding && {
                    ADetailerinpaintpadding: imageData.meta.ADetailerinpaintpadding,
                }),
                ...(imageData?.meta?.ADetailermaskblur && {
                    ADetailermaskblur: imageData.meta.ADetailermaskblur,
                }),
                ...(imageData?.meta?.ADetailermaskmaxratio && {
                    ADetailermaskmaxratio: imageData.meta.ADetailermaskmaxratio,
                }),
                ...(imageData?.meta?.ADetailermaskminratio && {
                    ADetailermaskminratio: imageData.meta.ADetailermaskminratio,
                }),
                ...(imageData?.meta?.ADetailermodel && {
                    ADetailermodel: imageData.meta.ADetailermodel,
                }),
                ...(imageData?.meta?.ADetailerversion && {
                    ADetailerversion: imageData.meta.ADetailerversion,
                }),
                ...(imageData?.meta?.cfgScale && {
                    cfgScale: imageData.meta.cfgScale,
                }),
                ...(imageData?.meta?.Hiresupscaler && {
                    Hiresupscaler: imageData.meta.Hiresupscaler,
                }),
                ...(imageData?.meta?.clipSkip && {
                    clipSkip: imageData.meta.clipSkip,
                }),
                ...(imageData?.meta?.Modelhash && {
                    Modelhash: imageData.meta.Modelhash,
                }),
                ...(imageData?.meta &&
                    Object.hasOwn(imageData.meta, "Model hash") && {
                    "Model hash": imageData.meta["Model hash"],
                }),
                ...(imageData?.meta?.Version && { Version: imageData.meta.Version }),
                ...(imageData?.meta?.Model && { Model: imageData.meta.Model }),
                ...(imageData?.meta?.Denoisingstrength && {
                    Denoisingstrength: imageData.meta.Denoisingstrength,
                }),
                ...(imageData?.meta?.prompt && { prompt: imageData.meta.prompt }),
                ...(imageData?.meta?.hashes && {
                    hashes: (0, exports.clearObjectKeys)(imageData.meta.hashes),
                }),
                ...(imageData?.meta?.steps && { steps: imageData.meta.steps }),
                ...(imageData?.meta?.seed && { seed: imageData.meta.seed }),
                ...(imageData?.meta?.TIhashes && {
                    TIhashes: imageData.meta.TIhashes,
                }),
                ...(imageData?.meta?.sampler && { sampler: imageData.meta.sampler }),
                ...(imageData?.meta?.Hiresupscale && {
                    Hiresupscale: imageData.meta.Hiresupscale,
                }),
                ...(imageData?.meta?.VAE && { VAE: imageData.meta.VAE }),
                ...(imageData?.meta?.negativePrompt && {
                    negativePrompt: imageData.meta.negativePrompt,
                }),
                ...(imageData?.meta?.Scheduletype && {
                    Scheduletype: imageData.meta.Scheduletype,
                }),
                ...(imageData?.meta?.Size && { Size: imageData.meta.Size }),
                ...(imageData?.meta?.resources && {
                    resources: imageData.meta.resources,
                }),
                ...(imageData?.meta?.civitaiResources && {
                    civitaiResources: imageData.meta.civitaiResources,
                }),
                ...(imageData?.meta?.additionalResources && {
                    additionalResources: imageData.meta.additionalResources,
                }),
                //To large file size for firestore
                // ...(imageData?.meta?.comfy && {
                //   comfy: convertToString(imageData.meta.comfy),
                // }),
                ...(imageData?.meta?.controlNets && {
                    controlNets: (0, exports.convertToString)(imageData.meta.controlNets),
                }),
                ...(imageData?.meta?.denoise && {
                    denoise: imageData.meta.denoise,
                }),
                ...(imageData?.meta?.modelIds && {
                    modelIds: imageData.meta.modelIds,
                }),
                ...(imageData?.meta?.models && {
                    models: imageData.meta.models,
                }),
                ...(imageData?.meta?.scheduler && {
                    scheduler: imageData.meta.scheduler,
                }),
                ...(imageData?.meta?.upscalers && {
                    upscalers: imageData.meta.upscalers,
                }),
                ...(imageData?.meta?.vaes && {
                    vaes: imageData.meta.vaes,
                }),
                ...(imageData?.meta?.versionIds && {
                    versionIds: imageData.meta.versionIds,
                }),
            },
        }),
        height: imageData.height,
        width: imageData.width,
    };
    return newImageData;
};
exports.transformImageData = transformImageData;
/**
 * Fix for Civitai bug with meta data in meta.meta
 * @param {array} images - Images data
 * @returns Updated images with fixed data
 */
const fixCivImagesMeta = (images) => {
    return images.map((image) => {
        if (image?.meta && image?.meta?.meta) {
            return { ...image, meta: { ...image.meta, ...image.meta.meta } };
        }
        return image;
    });
};
exports.fixCivImagesMeta = fixCivImagesMeta;
