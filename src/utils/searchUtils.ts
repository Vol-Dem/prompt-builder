import type {
  CategorySearchItem,
  ModelCategorySearchData,
  SearchFilter,
} from "../types/search.types";
import { URL_CIV_MODELS } from "../variables/constants";
import { createParamString } from "./generalUtils";

/** Parses URL-backed filters; the caller supplies the search source. */
export const parseSearchFilterParams = (
  searchParams: URLSearchParams,
): Omit<SearchFilter, "src"> => {
  const modelType = searchParams.get("modelType");
  const baseModel = searchParams.get("baseModel");

  return {
    modelType: modelType?.split(",").filter(Boolean) || [],
    baseModel: baseModel?.split(",").filter(Boolean) || [],
    hashtag: searchParams.get("hashtag") === "true",
    creator: searchParams.get("creator") === "true",
    sort: searchParams.get("sort"),
  };
};

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
  limit: number,
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

  let searchBy = "query";

  if (searchFilter?.hashtag) {
    searchBy = "tag";
  }

  if (searchFilter?.creator) {
    searchBy = "username";
  }

  return `${URL_CIV_MODELS}?${searchBy}=${searchQuery}&limit=${limit}${baseModels}${modelType}&nsfw=${nsfw}&sort=${searchFilter?.sort || "Newest"}`;
};
