import { MotionGlobalConfig } from "framer-motion";
import {
  ERROR_MESSAGE_DEFAULT,
  REGEX_SPLIT_TAGS,
  SETTINGS_IMAGE_PREVIEW_WIDTH_DEF,
  SETTINGS_NSFW_VALUES_DATA,
  SETTINGS_PROMPT_DUPLICATE_EXCEPTIONS,
} from "../variables/constants";

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

  const arrFixBreak = fixBreakInPrompt(arr);
  return arrFixBreak?.split(splitRegEx)?.flatMap((tag) => tag?.trim() || []);
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

  const errorMessages = [];
  Object.keys(validTypes).forEach((type) => {
    if (!!validTypes[type] && type === "email") {
      const isValid = value.split("").includes("@");
      const errorMessage = isValid ? "" : "Please enter a valid email address";
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
    }
    if (!!validTypes[type] && type === "password") {
      const isValid = value.length >= 6;
      const errorMessage = isValid
        ? ""
        : "Password must be 6 or more characters";

      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
    }
    if (!!validTypes[type] && type === "required") {
      const isValid = !!value;

      const errorMessage = isValid ? "" : "This field is required";
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
    }
    if (!!validTypes[type] && type === "number") {
      const isValid = Number.isFinite(+value);
      const errorMessage = isValid ? "" : `Value must be a number`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
    }
    if (!!validTypes[type] && type === "maxLength") {
      const isValid = !(value.length > validTypes[type]);
      const errorMessage = isValid
        ? ""
        : `Value cannot be more than ${validTypes[type]} characters`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
    }
    if (!!validTypes[type] && type === "minLength") {
      const isValid = value.length >= validTypes[type];
      const errorMessage = isValid
        ? ""
        : `Value cannot be less than ${validTypes[type]} characters`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
    }
  });
  const isValid = !errorMessages.length;
  const errorMessage = !isValid ? errorMessages[0] : "";

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
        ...(imageData?.meta?.hasOwnProperty("Model hash") && {
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

export const convertToString = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return "";
};

export const disableScrollHandler = (scrollTop, e) => {
  window.scrollTo(0, scrollTop);
};

export const convertPromptToArr = (prompt) => {
  return prompt?.split(REGEX_SPLIT_TAGS)?.flatMap((tag) => tag.trim() || []);
};

export const addElementToIndex = ({
  item,
  type,
  dropTargetType,
  prevPosition,
  curPromptArr,
}) => {
  const curPromptArrUpdatedPosition = curPromptArr.toSpliced(
    item.position,
    0,
    item
  );
  return curPromptArrUpdatedPosition.map((tag) => {
    if (dropTargetType === type && Number.isFinite(prevPosition)) {
      if (
        item.position < prevPosition &&
        tag.position >= item.position &&
        tag.id !== item.id
      ) {
        return { ...tag, position: tag.position + 1 };
      }
      if (
        item.position > prevPosition &&
        tag.position >= item.position &&
        tag.id !== item.id
      ) {
        return { ...tag, position: tag.position + 1 };
      }
    }
    if (dropTargetType !== type) {
      if (tag.position >= item.position && tag.id !== item.id) {
        return {
          ...tag,
          position: tag.position + 1,
        };
      }
    }
    return tag;
  });
};

export const markDuplicateTags = (tagsArr) => {
  const duplicates = [];
  let duplicatesAmount = 0;
  return tagsArr.map((tag, i, tags) => {
    const duplicateIndex = duplicates.findIndex(
      (duplicate) => duplicate.tag === tag.tag
    );

    if (duplicateIndex < 0) {
      const duplicate = tags
        .slice(i + 1)
        .find((nextTag) => nextTag.tag === tag.tag);

      const isException = SETTINGS_PROMPT_DUPLICATE_EXCEPTIONS.includes(
        duplicate?.tag
      );

      if (duplicate && !isException) {
        duplicates.push(tag);
        return { ...tag, duplicateId: duplicates.length };
      } else {
        return { ...tag, duplicateId: null };
      }
    } else {
      return { ...tag, duplicateId: duplicateIndex + 1 };
    }
  });
};

export const getTagWeight = (tag) => {
  let regex = /\(|<[^)|>]*\)|>/i;
  const hasWeight = regex.test(tag);

  let tagweight = 1;

  if (hasWeight) {
    const tagArr = tag.split(":");
    const curWeight = parseFloat(tagArr[tagArr.length - 1]);
    if (curWeight) {
      tagweight = curWeight;
    } else {
      const allParentheses = tag
        .split("")
        .filter((char) => char === "(" || char === ")");
      tagweight = tagweight + Math.floor(allParentheses.length / 2) / 10;
    }
  }
  return tagweight;
};

export const createPromptItem = (tag, id, index) => {
  return {
    id,
    tag,
    position: index,
    weight: getTagWeight(tag),
  };
};

export const throwCustomError = (message) => {
  const error = new Error(message);
  error.isCustom = true; // Add a custom flag
  throw error;
};

export const handleErrors = (err) => {
  // const isStandardError = ERROR_MESSAGES.includes(err.message);
  let errorMessage = ERROR_MESSAGE_DEFAULT;

  if (err.isCustom) {
    errorMessage = err.message;
  } else {
    console.error(err);
  }

  return errorMessage;
};

export const createTagSetsInputData = (tagSetsData, defTagSetData) => {
  let tagSets;

  if (!tagSetsData?.length) {
    tagSets = defTagSetData;
  } else {
    tagSets = tagSetsData.map((tagSet, i) => {
      return [
        {
          type: "text",
          id: "set-name" + i,
          name: "set-name",
          placeholder: "Set name",
          value: tagSet.name,
          isValid: true,
          errorMessage: "",
        },
        {
          id: "set-value" + i,
          name: "set-value",
          placeholder: "Triger words",
          value: tagSet.value,
          isValid: true,
          errorMessage: "",
        },
      ];
    });
  }
  return tagSets;
};

export const checkIsMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const disableAnimationsOnMobile = () => {
  const isMobile = checkIsMobile();
  if (isMobile) {
    MotionGlobalConfig.skipAnimations = true;
  }
};

export const transformSrcPreview = (
  src,
  width = SETTINGS_IMAGE_PREVIEW_WIDTH_DEF,
  type
) => {
  if (!src) return;

  let previewSrc;
  let srcArr = src.split("/");
  const widthIndex = srcArr.findIndex((srcSlice) => srcSlice.includes("width"));

  if (widthIndex < 0) {
    previewSrc = src;
  } else {
    srcArr[widthIndex] = `width=${width}`;
    previewSrc = srcArr.join("/");
  }

  return previewSrc;
};

export const parseModelIds = (value) => {
  if (value.includes("urn:air")) {
    const airArr = value.split(":");
    const ids = airArr[airArr.length - 1]
      .split("@")
      .map((id) => parseFloat(id));

    return ids;
  } else {
    //urn:air:sdxl:checkpoint:civitai:827184@1283437
    const urlArr = value.split("/");
    const modelIdIndex =
      urlArr.findIndex((urlPart) => urlPart === "models") + 1;
    const modelVersionIdUrlArr = urlArr
      .find((urlPart) => urlPart.includes("modelVersionId"))
      ?.split("=");

    if (modelIdIndex < 0) {
      throwCustomError("Invalid ID");
    } else {
      const modelId = parseInt(urlArr[modelIdIndex]);
      let modelVersionId = null;

      if (modelVersionIdUrlArr?.length) {
        modelVersionId =
          parseInt(modelVersionIdUrlArr[modelVersionIdUrlArr.length - 1]) ||
          null;
      }

      return [+modelId, +modelVersionId];
    }
  }
};

export const checkIsInCurrentNsfwRange = (curNsfwLevel, curNsfwvalue) => {
  const nsfwValues = SETTINGS_NSFW_VALUES_DATA.map(
    (nsfwValueData) => nsfwValueData.value
  );
  const curNsfwLevelIndex = nsfwValues.findIndex(
    (nsfwValue) => nsfwValue === curNsfwLevel
  );
  const displayedValues = nsfwValues.slice(0, curNsfwLevelIndex + 1);
  // console.log(curNsfwLevel);
  // console.log(displayedValues);

  return displayedValues.includes(curNsfwvalue);
};

export const fixBreakInPrompt = (prompt) => {
  const fixedPromt = prompt
    ?.replaceAll("BREAK ", "BREAK, ")
    ?.replaceAll("BREAK\n", "BREAK, ");

  return fixedPromt;
};

export const filterDuplicates = (arr, field) => {
  if (!Array.isArray(arr) || !arr?.length) return arr;

  if (field) {
    const values = arr.map((item) => item[field]);
    return arr.filter(
      (item, index) => !values.includes(item[field], index + 1)
    );
  } else {
    return [...new Set(arr)];
  }
};

export const createCategoryId = (id, categoriesData) => {
  if (!id) {
    return null;
  }
  let curId = id?.toString()?.toLowerCase();
  let idExists;

  //Check if category id is exists
  idExists = categoriesData?.find(
    (category) => category.id?.toString()?.toLowerCase() === curId
  );

  while (idExists) {
    const idArr = curId.split("-");
    const lastNubmer = parseInt(idArr.slice(-1));

    curId = lastNubmer
      ? `${idArr.slice(0, -1).join("-")}-${lastNubmer + 1}`
      : `${curId}-2`;

    idExists = categoriesData.find((category) => category.id === curId);
  }

  return curId;
};

export const createCollectionId = (collectionCategories) => {
  const collectionIds = collectionCategories.flatMap(
    (category) =>
      category?.collectionNames.map((collectionName) => collectionName.id) || []
  );

  if (!collectionIds?.length) return 1;

  return collectionIds.toSorted((a, b) => a - b)[collectionIds.length - 1] + 1;
};

export const sortArrayBy = (arr, field = null, direction) => {
  if (!arr) return;

  if (!direction) {
    if (!field) return arr.toSorted((a, b) => a.localeCompare(b));

    return arr.toSorted((a, b) => a[field]?.localeCompare(b[field]));
  }

  if (!field)
    return arr.toSorted((a, b) => (direction === "asc" ? a - b : b - a));

  return arr.toSorted((a, b) =>
    direction === "asc" ? a[field] - b[field] : b[field] - a[field]
  );
};

export const checkArraysIsEqual = (arr1, arr2) => {
  return arr1?.toSorted().toString() === arr2?.toSorted().toString();
};
