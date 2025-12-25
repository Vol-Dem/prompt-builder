import { clearObjectKeys, convertToString } from "./generalUtils";

/**
 * Creates a model object
 * @param {object} modelData - model data
 * @returns {object} model object
 */
export const transformModelData = (modelData) => {
  const newModelData = {
    ...modelData,
    modelVersions: transformModelVersionData(modelData?.modelVersions),
    stats: "",
  };

  return newModelData;
};

/**
 * Creates a model version object
 * @param {object} versionData - version data
 * @returns {object} model version object
 */
export const transformModelVersionData = (versionData) => {
  const newVersionData = versionData.map((version) => {
    const files =
      version?.files?.map((fileData) => {
        return transformFilesData(fileData);
      }) || [];

    const newImageData = version?.images?.map((imageData) => {
      return transformImageData(imageData);
    });

    return {
      baseModel: version?.baseModel || "",
      createdAt: version?.createdAt || "",
      downloadUrl: version?.downloadUrl || "",
      files: files,
      id: version?.id || null,
      images: newImageData || [],
      index: version?.index ?? null,
      name: version?.name || "",
      nsfwLevel: version?.nsfwLevel || null,
      trainedWords: version?.trainedWords || [],
    };
  });

  return newVersionData;
};

/**
 * Creates a files object
 * @param {object} fileData - files data
 * @returns {object} files object
 */
export const transformFilesData = (fileData) => {
  const newFileData = {
    downloadUrl: fileData?.downloadUrl || "",
    hashes: fileData?.hashes || [],
    id: fileData?.id || null,
    metadata: { format: fileData?.metadata?.format || "" },
    name: fileData?.name || "",
    primary: fileData?.primary || false,
    sizeKB: fileData?.sizeKB || null,
    type: fileData?.type || "",
  };
  return newFileData;
};

/**
 * Creates an image object
 * @param {object} imageData - image data
 * @returns {object} image object
 */
export const transformImageData = (imageData) => {
  const newImageData = {
    ...(imageData?.id && { id: imageData?.id }),
    ...(imageData?.postId && { postId: imageData?.postId }),
    url: imageData?.url || "",
    ...(imageData?.createdAt && { createdAt: imageData?.createdAt }),
    nsfw: imageData?.nsfw || false,
    ...(imageData?.hash && { hash: imageData?.hash }),
    ...(imageData?.browsingLevel && {
      browsingLevel: imageData?.browsingLevel,
    }),
    ...(imageData?.nsfwLevel && { nsfwLevel: imageData?.nsfwLevel }),
    ...(imageData?.type && { type: imageData?.type }),
    ...(imageData?.username && { username: imageData?.username }),
    ...(imageData?.meta && {
      meta: {
        ...(imageData?.meta?.ADetailerconfidence && {
          ADetailerconfidence: imageData?.meta?.ADetailerconfidence,
        }),
        ...(imageData?.meta?.ADetailerdenoisingstrength && {
          ADetailerdenoisingstrength:
            imageData?.meta?.ADetailerdenoisingstrength,
        }),
        ...(imageData?.meta?.ADetailerdilateerode && {
          ADetailerdilateerode: imageData?.meta?.ADetailerdilateerode,
        }),
        ...(imageData?.meta?.ADetailerinpaintonlymasked && {
          ADetailerinpaintonlymasked:
            imageData?.meta?.ADetailerinpaintonlymasked,
        }),
        ...(imageData?.meta?.ADetailerinpaintpadding && {
          ADetailerinpaintpadding: imageData?.meta?.ADetailerinpaintpadding,
        }),
        ...(imageData?.meta?.ADetailermaskblur && {
          ADetailermaskblur: imageData?.meta?.ADetailermaskblur,
        }),
        ...(imageData?.meta?.ADetailermaskmaxratio && {
          ADetailermaskmaxratio: imageData?.meta?.ADetailermaskmaxratio,
        }),
        ...(imageData?.meta?.ADetailermaskminratio && {
          ADetailermaskminratio: imageData?.meta?.ADetailermaskminratio,
        }),
        ...(imageData?.meta?.ADetailermodel && {
          ADetailermodel: imageData?.meta?.ADetailermodel,
        }),
        ...(imageData?.meta?.ADetailerversion && {
          ADetailerversion: imageData?.meta?.ADetailerversion,
        }),
        ...(imageData?.meta?.cfgScale && {
          cfgScale: imageData?.meta?.cfgScale,
        }),
        ...(imageData?.meta?.Hiresupscaler && {
          Hiresupscaler: imageData?.meta?.Hiresupscaler,
        }),
        ...(imageData?.meta?.clipSkip && {
          clipSkip: imageData?.meta?.clipSkip,
        }),
        ...(imageData?.meta?.Modelhash && {
          Modelhash: imageData?.meta?.Modelhash,
        }),
        ...(imageData?.meta &&
          Object.hasOwn(imageData.meta, "Model hash") && {
            "Model hash": imageData?.meta["Model hash"],
          }),
        ...(imageData?.meta?.Version && { Version: imageData?.meta?.Version }),
        ...(imageData?.meta?.Model && { Model: imageData?.meta?.Model }),
        ...(imageData?.meta?.Denoisingstrength && {
          Denoisingstrength: imageData?.meta?.Denoisingstrength,
        }),
        ...(imageData?.meta?.prompt && { prompt: imageData?.meta?.prompt }),
        ...(imageData?.meta?.hashes && {
          hashes: clearObjectKeys(imageData?.meta?.hashes),
        }),
        ...(imageData?.meta?.steps && { steps: imageData?.meta?.steps }),
        ...(imageData?.meta?.seed && { seed: imageData?.meta?.seed }),
        ...(imageData?.meta?.TIhashes && {
          TIhashes: imageData?.meta?.TIhashes,
        }),
        ...(imageData?.meta?.sampler && { sampler: imageData?.meta?.sampler }),
        ...(imageData?.meta?.Hiresupscale && {
          Hiresupscale: imageData?.meta?.Hiresupscale,
        }),
        ...(imageData?.meta?.VAE && { VAE: imageData?.meta?.VAE }),
        ...(imageData?.meta?.negativePrompt && {
          negativePrompt: imageData?.meta?.negativePrompt,
        }),
        ...(imageData?.meta?.Scheduletype && {
          Scheduletype: imageData?.meta?.Scheduletype,
        }),
        ...(imageData?.meta?.Size && { Size: imageData?.meta?.Size }),
        ...(imageData?.meta?.resources && {
          resources: imageData?.meta?.resources,
        }),
        ...(imageData?.meta?.civitaiResources && {
          civitaiResources: imageData?.meta?.civitaiResources,
        }),
        ...(imageData?.meta?.additionalResources && {
          additionalResources: imageData?.meta?.additionalResources,
        }),
        //To large file size for firestore
        // ...(imageData?.meta?.comfy && {
        //   comfy: convertToString(imageData.meta.comfy),
        // }),
        ...(imageData?.meta?.controlNets && {
          controlNets: convertToString(imageData.meta.controlNets),
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
          versionIds: imageData?.meta?.versionIds,
        }),
      },
    }),
    height: imageData?.height || "",
    width: imageData?.width || "",
  };

  return newImageData;
};
