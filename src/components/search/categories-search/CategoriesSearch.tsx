import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import classes from "./CategoriesSearch.module.scss";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import { subcategoriesSearch } from "../../../utils/searchUtils";
import CategoriesSearchItem from "../categories-search-item/CategoriesSearchItem";
import { SETTINGS_SEARCH_MIN_QUERY_LENGTH } from "../../../variables/constants";
import { useAppSelector } from "../../../store/hooks/hooks";
import type { CategorySearchItem } from "../../../types/search.types";

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
 * @returns Subcategory quick search result list.
 */
const CategoriesSearch = () => {
  const [subcategoriesSearchResult, setSubcategoriesSearchResult] = useState<
    CategorySearchItem[]
  >([]);
  const searchInput = useAppSelector((state) => state.search.searchQuery);
  const categories = useAppSelector((state) => state.tabs.categoriesData);
  const collectionCategories = useAppSelector(
    (state) => state.images.categories,
  );
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
    if (isOnline && searchInput.length >= SETTINGS_SEARCH_MIN_QUERY_LENGTH) {
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
