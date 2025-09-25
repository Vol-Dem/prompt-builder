import React, { useCallback, useEffect, useMemo, useState } from "react";
import classes from "./CategoriesSearch.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import { motion } from "framer-motion";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../../variables/constants";
import { imagesActions } from "../../../store/images";
import { tabActions } from "../../../store/tabs";
import { searchActions } from "../../../store/search";
import { modelActions } from "../../../store/model";

const CategoriesSearch = () => {
  const [subcategoriesSearchResult, setSubcategoriesSearchResult] = useState(
    []
  );
  const uid = useSelector((state) => state.auth.user.uid);
  const searchInput = useSelector((state) => state.search.searchQuery);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const collectionCategories = useSelector((state) => state.images.categories);
  const dispatch = useDispatch();
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

    const catCollArr = collectionCategories.map((category) => {
      return {
        type: "collection",
        ...category,
      };
    });
    return [...categoriesArr, ...catCollArr];
  }, [categories, collectionCategories]);

  const subcategoriesSearch = useCallback(() => {
    let subcats = [];
    categoriesSearchData.forEach((category) => {
      const subcategories = category?.subcategories?.filter((subcategory) => {
        return subcategory.name
          .toLowerCase()
          .includes(`${searchInput.toLowerCase().trim()}`);
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
      subcats = [...subcats, ...subcategoriesData];
    });

    setSubcategoriesSearchResult(subcats);
  }, [categoriesSearchData, searchInput]);

  useEffect(() => {
    if (
      uid &&
      searchInput.length >= 3 &&
      isOnline &&
      location.pathname !== "/search"
    ) {
      subcategoriesSearch();
    } else {
      setSubcategoriesSearchResult([]);
    }
  }, [searchInput, uid, subcategoriesSearch, location?.pathname, isOnline]);

  const categoriesSearchResultHtml = subcategoriesSearchResult.map(
    (result, i) => {
      return (
        <motion.li
          key={i}
          initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          animate={ANIMATIONS_FM_SLIDEIN}
          exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
          className={classes["categories-item"]}
        >
          <span className={classes["type"]}>{result.type}</span>{" "}
          <Link
            to={result.type === "collection" ? "/images" : "/"}
            className={classes["search__text-link"]}
            onClick={() => {
              if (result.type === "collection") {
                dispatch(imagesActions.setActiveCategory(result.id));
                dispatch(imagesActions.setActiveSubcategory(""));
              } else {
                dispatch(tabActions.setCurrentTab(result.type));
                dispatch(tabActions.setCurrentCategory(result.id));
              }
              dispatch(searchActions.setSearchQuery(""));
              dispatch(searchActions.setSearchResult([]));
            }}
          >
            {result.name}
          </Link>{" "}
          -{" "}
          <Link
            to={result.type === "collection" ? "/images" : "/"}
            className={classes["text-link"]}
            onClick={() => {
              if (result.type === "collection") {
                dispatch(imagesActions.setActiveCategory(result.id));
                dispatch(imagesActions.setActiveSubcategory(result.subId));
              } else {
                dispatch(tabActions.setCurrentTab(result.type));
                dispatch(tabActions.setCurrentCategory(result.id));
                dispatch(tabActions.setCurrentSubcategory(result.subId));
              }
              dispatch(searchActions.setSearchQuery(""));
              dispatch(searchActions.setSearchResult([]));
              dispatch(modelActions.setActiveCarouselData({}));
            }}
          >
            {result.subName}
          </Link>
        </motion.li>
      );
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
