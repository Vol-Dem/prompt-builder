import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import classes from "./CategoriesSearch.module.scss";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import { subcategoriesSearch } from "../../../utils/searchUtils";
import CategoriesSearchItem from "../categories-search-item/CategoriesSearchItem";

/**
 * CategoriesSearch
 *
 * Live subcategory search for the QuickSearch dropdown.
 *
 * Finds matching model and collection subcategories based on
 * the current search query and displays them as navigation shortcuts.
 *
 * Responsibilities:
 * - Filters all available categories and subcategories by search query.
 * - Combines model and collection category sources into a single result set.
 * - Updates results in real time as the user types.
 * - Clears results when offline.
 *
 * @component
 * @returns {JSX.Element} Subcategory quick search result list.
 */
const CategoriesSearch = () => {
  const [subcategoriesSearchResult, setSubcategoriesSearchResult] = useState(
    [],
  );
  const searchInput = useSelector((state) => state.search.searchQuery);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const collectionCategories = useSelector((state) => state.images.categories);
  const location = useLocation();
  const isOnline = useOnlineStatus();

  const categoriesSearchData = useMemo(() => {
    const categoriesArr = Object.keys(categories)?.flatMap((type) => {
      return categories[type]?.map((category) => {
        return {
          type: type,
          ...category,
        };
      });
    });

    const collectionCategoriesArr = collectionCategories.map((category) => {
      return {
        type: "collection",
        ...category,
      };
    });
    return [...categoriesArr, ...collectionCategoriesArr];
  }, [categories, collectionCategories]);

  useEffect(() => {
    if (isOnline) {
      const searchResult = subcategoriesSearch(
        searchInput,
        categoriesSearchData,
      );
      setSubcategoriesSearchResult(searchResult);
    } else {
      setSubcategoriesSearchResult([]);
    }
  }, [searchInput, categoriesSearchData, location?.pathname, isOnline]);

  const categoriesSearchResultHtml = subcategoriesSearchResult.map(
    (result, i) => {
      return <CategoriesSearchItem key={i} result={result} />;
    },
  );

  return (
    <>
      {!!subcategoriesSearchResult.length && (
        <ul className={classes["categories"]}>{categoriesSearchResultHtml}</ul>
      )}
    </>
  );
};

export default CategoriesSearch;
