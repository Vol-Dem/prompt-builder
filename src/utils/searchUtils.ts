import type {
  CategorySearchItem,
  ModelCategorySearchData,
} from "../types/search.types";

/**
 * Searches for subcategories
 * @param {string} query - Search query
 * @param {array} categories - Categories search data
 * @returns {array} Search result
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
