import { useEffect, useMemo, useState } from "react";
import classes from "./CategoriesSearch.module.scss";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import { subcategoriesSearch } from "../../../utils/searchUtils";
import CategoriesSearchItem from "../categories-search-item/CategoriesSearchItem";

const CategoriesSearch = () => {
  const [subcategoriesSearchResult, setSubcategoriesSearchResult] = useState(
    []
  );
  const uid = useSelector((state) => state.auth.user.uid);
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
    if (
      uid &&
      searchInput.length >= 3 &&
      isOnline &&
      location.pathname !== "/search"
    ) {
      const searchResult = subcategoriesSearch(
        searchInput,
        categoriesSearchData
      );
      setSubcategoriesSearchResult(searchResult);
    } else {
      setSubcategoriesSearchResult([]);
    }
  }, [searchInput, uid, categoriesSearchData, location?.pathname, isOnline]);

  const categoriesSearchResultHtml = subcategoriesSearchResult.map(
    (result, i) => {
      return <CategoriesSearchItem key={i} result={result} />;
    }
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
