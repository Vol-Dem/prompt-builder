/**
 * Searches for subcategories
 * @param {String} query - Search query
 * @param {Array} categories - Categories data
 * @returns {Array} Search result
 */
export const subcategoriesSearch = (query, categories) => {
  let searchResult = [];

  categories.forEach((category) => {
    const subcategories = category?.subcategories?.filter((subcategory) => {
      return subcategory.name
        .toLowerCase()
        .includes(`${query.toLowerCase().trim()}`);
    });

    const subcategoriesData = subcategories.map((subcategory) => {
      return {
        type: category.type,
        id: category.id,
        name: category.name,
        subId: subcategory.id,
        subName: subcategory.name,
      };
    });
    searchResult = [...searchResult, ...subcategoriesData];
  });

  return searchResult;
};
