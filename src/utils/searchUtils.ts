import type {
  CategorySearchItem,
  ModelCategorySearchData,
  SearchFilter,
} from "../types/search.types";
import {
  SETTINGS_SEARCH_RESULT_PER_PAGE,
  URL_CIV_MODELS,
} from "../variables/constants";
import { createParamString } from "./generalUtils";

/**
 * Searches for subcategories
 * @param query - search query
 * @param categories - categories search data
 * @returns Search result
 */
export const subcategoriesSearch = (
  query: string,
  categories: ModelCategorySearchData[],
): CategorySearchItem[] => {
  let searchResult: CategorySearchItem[] = [];

  categories.forEach((category) => {
    const subcategories = category?.subcategories?.filter((subcategory) => {
      return subcategory.name
        .toLowerCase()
        .includes(`${query.toLowerCase().trim()}`);
    });

    const subcategoriesData = subcategories?.map((subcategory) => {
      return {
        type: category.type,
        id: category.id,
        name: category.name,
        subId: subcategory.id,
        subName: subcategory.name,
      };
    });
    searchResult = [...searchResult, ...(subcategoriesData || [])];
  });

  return searchResult;
};

/**
 * Creates search url with query parameters
 *
 * @param searchQuery - search query
 * @param nsfw - whether NSFW mode is active
 * @param searchFilter - current search filter
 *
 * @returns search url with query parameters
 */
export const createCivitaiSearchUrl = (
  searchQuery: string | null,
  nsfw: boolean = false,
  searchFilter?: SearchFilter,
): string => {
  // const baseModels = searchFilter.baseModel?.length
  //   ? `&baseModels=${searchFilter.baseModel}`
  //   : "";
  const baseModels = searchFilter?.baseModel?.length
    ? createParamString(searchFilter.baseModel, "baseModels")
    : "";
  const modelType = searchFilter?.modelType?.length
    ? createParamString(searchFilter.modelType, "types")
    : "";

  return `${URL_CIV_MODELS}?${!searchFilter?.hashtag ? "query" : "tag"}=${searchQuery}&limit=${SETTINGS_SEARCH_RESULT_PER_PAGE}${baseModels}${modelType}&nsfw=${nsfw}&sort=${searchFilter?.sort || "Newest"}`;
};
