import { MotionGlobalConfig } from "framer-motion";

import {
  ERROR_MESSAGE_CIV_CONNECTION,
  ERROR_MESSAGE_DEFAULT,
  REGEX_MOBAL,
  SETTINGS_NSFW_VALUES_DATA,
  // SETTINGS_SUPPORTED_FILE_EXTENSIONS,
} from "../variables/constants";
// import { isNumber } from "./validationUtils";
import type {
  CollectionCategory,
  ModelCategory,
} from "../../shared/types/user";
import type { NotificationData } from "../types/notification.types";
import { FirebaseError } from "firebase/app";

// type CustomError = Error & { isCustom: true };

interface CustomError extends Error {
  isCustom: true;
}

type ClientCoords = {
  clientX: number;
  clientY: number;
};

/**
 * Adds a promise that resolves after the specified delay
 * @param {number} delay - The delay in ms
 * @returns {Promise<string>} The promise that resolves after the specified delay
 */
export const addDelayPromise = (delay: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolve");
    }, delay);
  });
};

// /**
//  * Converts value to a string
//  * @param {*} value - The value to convert
//  * @returns The stringified value
//  */
// export const convertToString = (value) => {
//   if (typeof value === "string") {
//     return value;
//   } else {
//     return JSON.stringify(value);
//   }
// };

/**
 * Freezes scroll
 * @param {number} scrollTop - The distance to the top
 */
export const disableScrollHandler = (scrollTop: number): void => {
  window.scrollTo(0, scrollTop);
};

/**
 * Throws a new error with isCustom set to true
 * @param {string} message - The error message
 */
export const throwCustomError = (message: string): never => {
  const error = new Error(message) as CustomError;
  error.isCustom = true; // Add a custom flag
  throw error;
};

/**
 * Handles caught errors and returns a custom or default error message
 * @param {object} err - The error object
 * @returns {string} - The custom or default error message
 */
export const handleErrors = (err: CustomError): string => {
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
 * @returns {boolean} True if the device is mobile, otherwise false
 */
export const checkIsMobile = (): boolean => {
  return REGEX_MOBAL.test(navigator.userAgent);
};

/**
 * Disables Framer Motion animations on mobile devices
 */
export const disableAnimationsOnMobile = (): void => {
  const isMobile = checkIsMobile();
  if (isMobile) {
    MotionGlobalConfig.skipAnimations = true;
  }
};

/**
 * Checks if the provided value is within the current allowed NSFW range
 * @param {string} curNsfwLevel - The current active NSFW level
 * @param {string} curNsfwvalue - The current NSFW value to check
 * @returns {boolean} True if the value is within range, otherwise false
 */
export const checkIsInCurrentNsfwRange = (
  curNsfwLevel: string,
  curNsfwvalue: string,
): boolean => {
  const nsfwValues = SETTINGS_NSFW_VALUES_DATA.map(
    (nsfwValueData) => nsfwValueData.value,
  );
  const curNsfwLevelIndex = nsfwValues.findIndex(
    (nsfwValue) => nsfwValue === curNsfwLevel,
  );
  const displayedValues = nsfwValues.slice(0, curNsfwLevelIndex + 1);

  return displayedValues.includes(curNsfwvalue);
};

/**
 * Filters duplicate values from an array of objects by an object field
 * @param {array} arr - The array of objects
 * @param {string} field - The object field
 * @returns {array} The filtered array
 */
// export function filterDuplicates<T>(arr: T[]): T[];

// export function filterDuplicates<T, K extends keyof T>(arr: T[], field: K): T[];

export const filterDuplicates = <T, K extends keyof T>(
  arr: T[],
  field?: K,
): T[] => {
  if (!Array.isArray(arr) || !arr.length) return arr;

  if (field) {
    const values = arr.map((item) => item[field]);

    return arr.filter((item, index) => {
      const value = item[field];
      if (!value) return true;

      return !values.includes(value, index + 1);
    });
  }

  return [...new Set(arr)];
};

/**
 * Creates a category ID from the category name
 * @param {string} id - The category name
 * @param {object} categoriesData - The existing categories data
 * @returns {string | null} The created ID
 */
export const createCategoryId = (
  id: string,
  categoriesData: ModelCategory[],
): string => {
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
      .map((existedId) => +existedId.id.split("-").slice(-1)[0])
      .filter(Boolean)
      .sort();
    console.log(idIndexes);
    if (idIndexes?.length) {
      curId = `${curId}-${idIndexes[idIndexes.length - 1] + 1}`;
    }
  }

  return curId;
};

/**
 * Generates a collection ID
 * @param {array} collectionCategories - The existing collection data
 * @returns {number} The collection ID
 */
export const createCollectionId = (
  collectionCategories: CollectionCategory[],
): number => {
  const collectionIds = collectionCategories.flatMap(
    (category) =>
      category?.collectionNames?.map((collectionName) => collectionName.id) ||
      [],
  );

  if (!collectionIds?.length) return 1;

  return collectionIds.toSorted((a, b) => a - b)[collectionIds.length - 1] + 1;
};

/**
 * Universal sort function.
 * Sorts an array by object field when the field is specified.
 * Sorts by value when the field is not specified.
 * @param {array} arr - The array to sort
 * @param {string} field - The object field to sort by
 * @param {('asc'|'desc')} direction - The sort direction ("asc" or "desc")
 * @returns {array} The new sorted array of objects
 */
export const sortArrayBy = <T, K extends keyof T>(
  arr: T[],
  field?: K,
  direction: "asc" | "desc" = "asc",
): T[] => {
  if (!arr) return arr;

  return arr.toSorted((a, b) => {
    const order = direction === "asc" ? 1 : -1;

    const aValue = field ? a[field] : a;
    const bValue = field ? b[field] : b;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * order;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * order;
    }

    return 0;
  });
};

/**
 * Sorts an object by keys
 * @param {object} obj - The object to sort
 * @returns {boolean} The new sorted object
 */
export const sortObjectByKeys = <T extends Record<string, any>>(obj: T): T => {
  return Object.keys(obj)
    .toSorted()
    .reduce((acc, key) => {
      acc[key as keyof T] = obj[key as keyof T];
      return acc;
    }, {} as T);
};

/**
 * Checks arrays for equality
 * @param {array} arr1 - The first array
 * @param {array} arr2 - The second array
 * @returns {boolean} True if the arrays are equal, otherwise false
 */
export const checkArraysIsEqual = <T, K>(arr1: T[], arr2: K[]): boolean => {
  return arr1?.toSorted().toString() === arr2?.toSorted().toString();
};

/**
 * Checks objects for equality
 * @param {object} obj1 - The first object
 * @param {object} obj2 - The second object
 * @returns {boolean} True if the objects are equal, otherwise false
 */
export const checkObjectsIsEqual = (
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): boolean => {
  return (
    JSON.stringify(sortObjectByKeys(obj1)) ===
    JSON.stringify(sortObjectByKeys(obj2))
  );
};

/**
 * Enables smooth scroling
 * @param {string | number} hashId - The element ID
 * @returns
 */
export const smoothScroll = (hashId: string | number): void => {
  if (hashId) {
    const scrollTarget = document?.querySelector(`${hashId}`);
    const headerElement = document.querySelector("#header") as HTMLDivElement;

    if (!scrollTarget || !headerElement) return;

    const distToTop = window.scrollY + scrollTarget.getBoundingClientRect().top;

    window.scrollTo({
      top: distToTop - headerElement.offsetHeight - 10,
      behavior: "smooth",
    });
  }
};

/**
 *  Adds a new entry to the URL search params
 * @param {URLSearchParams} prevParams - The previous params
 * @param {URLSearchParams} newEntry  - The new search params entry
 * @returns {URLSearchParams} The updated URL search params
 */
export const updateSearchParams = (
  prevParams: URLSearchParams,
  newEntry: URLSearchParams,
): URLSearchParams => {
  return new URLSearchParams({
    ...Object.fromEntries(prevParams.entries()),
    ...newEntry,
  });
};

/**
 * Parses the intersection field value and converts it to a suitable form
 * @param {number | string} value - The margin value
 * @returns {string} The intersection margin value in a suitable form
 */
export const parseIntersectionMargin = (value: number | string): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`;
  }
  const parsedValue = parseInt(value + "");

  if (typeof value === "string") {
    if (parsedValue ?? value.includes("%")) {
      return `${parsedValue}%`;
    }
    if (parsedValue ?? value.includes("px")) {
      return `${parsedValue}px`;
    }
  }

  return "0px";
};

/**
 *
 * @param {Event} e - event
 * @returns {{clientX: number, clientY: number}}
 */
export const getClientCoord = (e: MouseEvent | TouchEvent): ClientCoords => {
  if ("touches" in e) {
    const touch = e.touches[0];
    return {
      clientX: Math.round(touch.clientX),
      clientY: Math.round(touch.clientY),
    };
  }

  return {
    clientX: Math.round(e.clientX),
    clientY: Math.round(e.clientY),
  };
};

export const timeout = function (s: number): Promise<Error> {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const saveToStorage = <T>(key: string, data: T): void => {
  window.sessionStorage.setItem(key, JSON.stringify(data));
};

export const uploadStorage = <T>(key: string): T | null => {
  const storageData = window.sessionStorage?.getItem(key);
  return storageData ? JSON.parse(storageData) : null;
};

export const removeFromStorage = (key: string): void => {
  window.sessionStorage.removeItem(key);
};

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const uploadLocalStorage = (key: string) => {
  const storageData = localStorage?.getItem(key);
  return storageData ? JSON.parse(storageData) : null;
};

export const removeFromLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

export const getUserNotifications = (
  notifications: NotificationData[],
): NotificationData[] => {
  const noticeInfo = uploadLocalStorage(`notifications`) as {
    messages: NotificationData[];
  };
  const updatedNotifications = notifications.map((message) => {
    const notice = noticeInfo?.messages?.find(
      (userNotice) => userNotice.id === message.id,
    );
    return {
      ...message,
      read: notice ? notice.read : message.read,
    };
  });

  return updatedNotifications;
};

export const checkIsNsfw = (
  nsfw: boolean | string,
  nsfwLevel: string | number,
  sfwValue: string,
): boolean => {
  return nsfw === false ||
    nsfw === "None" ||
    nsfwLevel === sfwValue ||
    nsfwLevel === 1
    ? false
    : true;
};

export class AppError extends Error {
  public readonly code?: string;
  public readonly original?: unknown;
  public readonly isCustom?: unknown;

  constructor(
    message: string,
    code?: string,
    original?: unknown,
    isCustom?: boolean,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.original = original;
    this.isCustom = isCustom === false ? false : true;
  }
}

export const normalizeError = (error: unknown): AppError => {
  // Firebase error
  if (error instanceof FirebaseError) {
    return new AppError(error.message, error.code, error, false);
  }

  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Generic JS error
  if (error instanceof Error) {
    return new AppError(error.message, undefined, error, false);
  }

  // Totally unknown
  return new AppError(ERROR_MESSAGE_DEFAULT, undefined, error, false);
};
