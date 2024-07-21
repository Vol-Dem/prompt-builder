export const clearObjectKeys = (obj) => {
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

export const clearFileExtension = (name) => {
  const clearedName = name
    ?.replace(".safetensors", "")
    .replace(".pt", "")
    .replace(".pth", "")
    .replace(".ckpt", "");
  return clearedName;
};

export const addDelayPromise = (delay) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("foo");
    }, delay);
  });
};

export const splitTags = (arr) => {
  const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
  return arr.split(splitRegEx).flatMap((tag) => tag.trim() || []);
};

/**
 * Validate input data
 * @param {string} rules - Type of validation (email, password, required, minLength, maxLength, number, string)
 * @param {Object} value - value
 * @returns {Array} - Returns state object {inputValue, isValid, errorMessage}
 */
export const validateInput = (rules, value) => {
  const validTypes = rules;
  if (!validTypes) {
    return;
  }
  // const validTypes = {
  //   required: "",
  //   maxLength: "",
  //   minLength: "",
  //   email: "",
  //   password: true,
  //   number: "",
  //   string: "",
  // };
  const errorMessages = [];
  Object.keys(validTypes).forEach((type) => {
    if (!!validTypes[type] && type === "email") {
      const isValid = value.split("").includes("@");
      const errorMessage = isValid ? "" : "Please enter a valid email address";
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "password") {
      const isValid = value.length >= 6;
      const errorMessage = isValid
        ? ""
        : "Password must be 6 or more characters";
      console.log(isValid);
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "required") {
      const isValid = !!value;
      console.log(value);
      const errorMessage = isValid ? "" : "This field is required";
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "number") {
      const isValid = Number.isFinite(+value);
      const errorMessage = isValid ? "" : `Value must be a number`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "maxLength") {
      // let isValid;

      // if (
      //   validTypes.hasOwnProperty("number") &&
      //   validTypes["number"] === true &&
      //   Number.isFinite(+value)
      // ) {
      //   isValid = !(+value > 9999);
      // } else {
      //   isValid = !(value.length > validTypes[type]);
      // }
      const isValid = !(value.length > validTypes[type]);
      const errorMessage = isValid
        ? ""
        : `Value cannot be more than ${validTypes[type]} characters`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "minLength") {
      const isValid = value.length >= validTypes[type];
      const errorMessage = isValid
        ? ""
        : `Value cannot be less than ${validTypes[type]} characters`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
  });
  const isValid = !errorMessages.length;
  const errorMessage = !isValid ? errorMessages[0] : "";
  // console.log("VAL", value);
  // console.log("WTF", isValid);
  // console.log("WTFM", errorMessages);
  return { inputValue: value, isValid, errorMessage };
};

export const transformModelData = (modelData) => {
  const newModelData = {
    ...modelData,
    modelVersions: transformModelVersionData(modelData?.modelVersions),
    stats: "",
  };

  return newModelData;
};

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

export const transformImageData = (imageData) => {
  // {
  //   ...resource,
  //   ...(modelsData[i].model?.name && { name: modelsData[i].model?.name }),
  //   ...(modelsData[i]?.modelId && { modelId: modelsData[i]?.modelId }),
  //   ...(modelsData[i]?.name && { versionName: modelsData[i]?.name }),
  //   ...(modelsData[i]?.id && { versionId: modelsData[i]?.id }),
  //   ...(modelsData[i]?.model?.type && { type: modelsData[i]?.model?.type }),
  // }
  const newImageData = {
    // id: imageData?.id || "",
    ...(imageData?.id && { id: imageData?.id }),
    // postId: imageData?.postId || null,
    ...(imageData?.postId && { postId: imageData?.postId }),
    url: imageData?.url || "",
    // createdAt: imageData?.createdAt || "",
    ...(imageData?.createdAt && { createdAt: imageData?.createdAt }),
    nsfw: imageData?.nsfw || false,
    // hash: imageData?.hash || "",
    ...(imageData?.hash && { hash: imageData?.hash }),
    // browsingLevel: imageData?.browsingLevel || null,
    ...(imageData?.browsingLevel && {
      browsingLevel: imageData?.browsingLevel,
    }),
    // nsfwLevel: imageData?.nsfwLevel || null,
    ...(imageData?.nsfwLevel && { nsfwLevel: imageData?.nsfwLevel }),
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
        // Hiresupscaler: imageData?.meta?.Hiresupscaler || "",
        ...(imageData?.meta?.Hiresupscaler && {
          Hiresupscaler: imageData?.meta?.Hiresupscaler,
        }),
        // clipSkip: imageData?.meta?.clipSkip || null,
        ...(imageData?.meta?.clipSkip && {
          clipSkip: imageData?.meta?.clipSkip,
        }),
        // Modelhash: imageData?.meta?.Modelhash || "",
        ...(imageData?.meta?.Modelhash && {
          Modelhash: imageData?.meta?.Modelhash,
        }),
        ...(imageData?.meta?.hasOwnProperty("Model hash") && {
          "Model hash": imageData?.meta["Model hash"],
        }),
        // Version: imageData?.meta?.Version || "",
        ...(imageData?.meta?.Version && { Version: imageData?.meta?.Version }),
        // Model: imageData?.meta?.Model || "",
        ...(imageData?.meta?.Model && { Model: imageData?.meta?.Model }),
        // Denoisingstrength: imageData?.meta?.Denoisingstrength || null,
        ...(imageData?.meta?.Denoisingstrength && {
          Denoisingstrength: imageData?.meta?.Denoisingstrength,
        }),
        // prompt: imageData?.meta?.prompt || "",
        ...(imageData?.meta?.prompt && { prompt: imageData?.meta?.prompt }),
        // hashes: imageData?.meta?.hashes || "",
        ...(imageData?.meta?.hashes && {
          hashes: clearObjectKeys(imageData?.meta?.hashes),
        }),
        // steps: imageData?.meta?.steps || null,
        ...(imageData?.meta?.steps && { steps: imageData?.meta?.steps }),
        // seed: imageData?.meta?.seed || null,
        ...(imageData?.meta?.seed && { seed: imageData?.meta?.seed }),
        // TIhashes: imageData?.meta?.TIhashes || "",
        ...(imageData?.meta?.TIhashes && {
          TIhashes: imageData?.meta?.TIhashes,
        }),
        // sampler: imageData?.meta?.sampler || "",
        ...(imageData?.meta?.sampler && { sampler: imageData?.meta?.sampler }),
        // Hiresupscale: imageData?.meta?.Hiresupscale || null,
        ...(imageData?.meta?.Hiresupscale && {
          Hiresupscale: imageData?.meta?.Hiresupscale,
        }),
        // VAE: imageData?.meta?.VAE || "",
        ...(imageData?.meta?.VAE && { VAE: imageData?.meta?.VAE }),
        // negativePrompt: imageData?.meta?.negativePrompt || "",
        ...(imageData?.meta?.negativePrompt && {
          negativePrompt: imageData?.meta?.negativePrompt,
        }),
        // Scheduletype: imageData?.meta?.Scheduletype || "",
        ...(imageData?.meta?.Scheduletype && {
          Scheduletype: imageData?.meta?.Scheduletype,
        }),
        // Size: imageData?.meta?.Size || "",
        ...(imageData?.meta?.Size && { Size: imageData?.meta?.Size }),
        // resources: imageData?.meta?.resources || [],
        ...(imageData?.meta?.resources && {
          resources: imageData?.meta?.resources,
        }),
        // civitaiResources: imageData?.meta?.civitaiResources || [],
        ...(imageData?.meta?.civitaiResources && {
          civitaiResources: imageData?.meta?.civitaiResources,
        }),
        // additionalResources: imageData?.meta?.additionalResources || [],
        ...(imageData?.meta?.additionalResources && {
          additionalResources: imageData?.meta?.additionalResources,
        }),
      },
    }),
    height: imageData?.height || "",
    width: imageData?.width || "",
  };

  return newImageData;
};

export const disableScrollHandler = (scrollTop, e) => {
  window.scrollTo(0, scrollTop);
};
