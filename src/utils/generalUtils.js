import { MotionGlobalConfig } from "framer-motion";
import {
  ERROR_MESSAGE_CIV_CONNECTION,
  ERROR_MESSAGE_DEFAULT,
  REGEX_MOBAL,
  SETTINGS_NSFW_VALUES_DATA,
  SETTINGS_SUPPORTED_FILE_EXTENSIONS,
} from "../variables/constants";
import { isNumber } from "./validationUtils";

/**
 * Removes unsupported Firestore symbols from object keys
 * @param {Object} obj - The object
 * @returns The cleaned object
 */
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

/**
 * Removes supported file extensions from file name.
 * Supported file extensions: safetensors, pt, pth, ckpt, mp4, mov, webm
 * @param {String} name - The file name
 * @returns The file name without the file extension
 */
export const clearFileExtension = (name) => {
  if (!name) return;

  const extension = SETTINGS_SUPPORTED_FILE_EXTENSIONS.find((extension) =>
    name.endsWith(`.${extension}`)
  );

  if (extension) {
    return name.replace(`.${extension}`, "");
  } else {
    return name;
  }
};

/**
 * Adds a promise that resolves after the specified delay
 * @param {Number} delay - The delay in ms
 * @returns {Promise} The promise that resolves after the specified delay
 */
export const addDelayPromise = (delay) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("resolve");
    }, delay);
  });
};

/**
 * Converts value to a string
 * @param {*} value - The value to convert
 * @returns The stringified value
 */
export const convertToString = (value) => {
  if (typeof value === "string") {
    return value;
  } else {
    return JSON.stringify(value);
  }
};

/**
 * Freezes scroll
 * @param {Number} scrollTop - The distance to the top
 */
export const disableScrollHandler = (scrollTop) => {
  window.scrollTo(0, scrollTop);
};

/**
 * Throws a new error with isCustom set to true
 * @param {String} message - The error message
 */
export const throwCustomError = (message) => {
  const error = new Error(message);
  error.isCustom = true; // Add a custom flag
  throw error;
};

/**
 * Handles caught errors and returns a custom or default error message
 * @param {Object} err - The error object
 * @returns {String} - The custom or default error message
 */
export const handleErrors = (err) => {
  let errorMessage = ERROR_MESSAGE_DEFAULT;

  if (err.isCustom) {
    errorMessage = err.message;
  } else {
    console.error(err);
  }

  //Error message for Civitai connection bug
  if (err.message.includes("prisma")) {
    errorMessage = ERROR_MESSAGE_CIV_CONNECTION;
  }

  return errorMessage;
};

/**
 * Checks if the current user's device is mobile
 * @returns {Boolean} True if the device is mobile, otherwise false
 */
export const checkIsMobile = () => {
  return REGEX_MOBAL.test(navigator.userAgent);
};

/**
 * Disables Framer Motion animations on mobile devices
 */
export const disableAnimationsOnMobile = () => {
  const isMobile = checkIsMobile();
  if (isMobile) {
    MotionGlobalConfig.skipAnimations = true;
  }
};

/**
 * Checks if the provided value is within the current allowed NSFW range
 * @param {String} curNsfwLevel - The current active NSFW level
 * @param {String} curNsfwvalue - The current NSFW value to check
 * @returns {Boolean} True if the value is within range, otherwise false
 */
export const checkIsInCurrentNsfwRange = (curNsfwLevel, curNsfwvalue) => {
  const nsfwValues = SETTINGS_NSFW_VALUES_DATA.map(
    (nsfwValueData) => nsfwValueData.value
  );
  const curNsfwLevelIndex = nsfwValues.findIndex(
    (nsfwValue) => nsfwValue === curNsfwLevel
  );
  const displayedValues = nsfwValues.slice(0, curNsfwLevelIndex + 1);

  return displayedValues.includes(curNsfwvalue);
};

/**
 * Filters duplicate values from an array of objects by an object field
 * @param {Array} arr - The array of objects
 * @param {String} field - The object field
 * @returns {Array} The filtered array
 */
export const filterDuplicates = (arr, field) => {
  if (!Array.isArray(arr) || !arr?.length) return arr;

  if (field) {
    const values = arr.map((item) => item[field]);
    return arr.filter((item, index) => {
      if (!item[field]) return item;
      return !values.includes(item[field], index + 1);
    });
  } else {
    return [...new Set(arr)];
  }
};

/**
 * Creates a category ID from the category name
 * @param {String} id - The category name
 * @param {Object} categoriesData - The existing categories data
 * @returns {String} The created ID
 */
export const createCategoryId = (id, categoriesData) => {
  if (!id) {
    return null;
  }
  let curId = id?.toString()?.toLowerCase();

  //Checks if a category ID exists
  const existedIds = categoriesData?.filter((category) => {
    const normalizedId = category.id?.toString()?.toLowerCase();
    const normalizedIdWithoutIndex = normalizedId
      .split("-")
      .toSpliced(-1, 1)
      .join("-");

    return normalizedId === curId || normalizedIdWithoutIndex === curId;
  });

  if (existedIds?.length === 1) {
    curId = `${curId}-1`;
  } else if (existedIds?.length > 1) {
    const idIndexes = existedIds
      .map((existedId) => +existedId.id.split("-").pop())
      .filter(Boolean)
      .sort();

    if (!!idIndexes?.length) {
      curId = `${curId}-${idIndexes[idIndexes.length - 1] + 1}`;
    }
  }

  return curId;
};

/**
 * Generates a collection ID
 * @param {Array} collectionCategories - The existing collection data
 * @returns The collection ID
 */
export const createCollectionId = (collectionCategories) => {
  const collectionIds = collectionCategories.flatMap(
    (category) =>
      category?.collectionNames.map((collectionName) => collectionName.id) || []
  );

  if (!collectionIds?.length) return 1;

  return collectionIds.toSorted((a, b) => a - b)[collectionIds.length - 1] + 1;
};

/**
 * Universal sort function.
 * Sorts an array by object field when the field is specified.
 * Sorts by value when the field is not specified.
 * @param {Array} arr - The array to sort
 * @param {String} field - The object field to sort by
 * @param {('asc'|'desc')} direction - The sort direction ("asc" or "desc")
 * @returns {Array} The new sorted array of objects
 */
export const sortArrayBy = (arr, field = null, direction = "asc") => {
  if (!arr) return;

  return arr.toSorted((a, b) => {
    if (!field) {
      if (isNumber(a) && isNumber(b)) {
        return direction === "asc" ? a - b : b - a;
      }

      return a.localeCompare(b);
    } else {
      if (isNumber(a[field]) && isNumber(b[field])) {
        return direction === "asc" ? a[field] - b[field] : b[field] - a[field];
      }

      return a[field]?.localeCompare(b[field]);
    }
  });
};

/**
 * Sorts an object by keys
 * @param {Object} obj - The object to sort
 * @returns {Boolean} The new sorted object
 */
export const sortObjectByKeys = (obj) => {
  return Object.keys(obj)
    .toSorted()
    .reduce((newObj, key) => {
      newObj[key] = obj[key];
      return newObj;
    }, {});
};

/**
 * Checks arrays for equality
 * @param {Array} arr1 - The first array
 * @param {Array} arr2 - The second array
 * @returns {Boolean} True if the arrays are equal, otherwise false
 */
export const checkArraysIsEqual = (arr1, arr2) => {
  return arr1?.toSorted().toString() === arr2?.toSorted().toString();
};

/**
 * Checks objects for equality
 * @param {Object} obj1 - The first object
 * @param {Object} obj2 - The second object
 * @returns {Boolean} True if the objects are equal, otherwise false
 */
export const checkObjectsIsEqual = (obj1, obj2) => {
  return (
    JSON.stringify(sortObjectByKeys(obj1)) ===
    JSON.stringify(sortObjectByKeys(obj2))
  );
};

/**
 * Enables smooth scroling
 * @param {String} hashId - The element ID
 * @returns
 */
export const smoothScroll = (hashId) => {
  if (hashId) {
    const scrollTarget = document?.querySelector(`${hashId}`);
    const headerHeight = document.querySelector("#header").offsetHeight;
    const distToTop =
      window.scrollY + scrollTarget?.getBoundingClientRect().top;
    window.scrollTo({ top: distToTop - headerHeight - 10, behavior: "smooth" });
  }
};

/**
 *  Adds a new entry to the URL search params
 * @param {String} prevParams - The previous params
 * @param {String} newEntry  - The new search params entry
 * @returns {String} The updated URL search params
 */
export const updateSearchParams = (prevParams, newEntry) => {
  return new URLSearchParams({
    ...Object.fromEntries(prevParams.entries()),
    ...newEntry,
  });
};

/**
 * Parses the intersection field value and converts it to a suitable form
 * @param {Number | String} value - The margin value
 * @returns {String} The intersection margin value in a suitable form
 */
export const parseIntersectionMargin = (value) => {
  let rootMarginValue;
  const parcedValue = parseInt(value);

  if (Number.isFinite(value)) {
    rootMarginValue = `${value}px`;
  } else if (parcedValue ?? value?.includes("%")) {
    rootMarginValue = `${parcedValue}%`;
  } else if (parcedValue ?? value?.includes("px")) {
    rootMarginValue = `${parcedValue}px`;
  } else {
    value = "0px";
  }

  return rootMarginValue;
};
