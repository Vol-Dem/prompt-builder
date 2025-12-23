import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

import {
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE,
} from "../../../variables/constants";
import classes from "./QuickSearch.module.scss";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import { liveSearch, searchActions } from "../../../store/search";
import Spinner from "../../ui/Spinner";
import CategoriesSearch from "../categories-search/CategoriesSearch";
import ErrorMessage from "../../ui/ErrorMessage";
import ButtonTertiary from "../../ui/ButtonTertiary";
import QuickSearchResultList from "../quick-search-list/QuickSearchResultList";

const searchTimeoutMs = 1000;

const QuickSearch = ({ onSubmit, onOpen }) => {
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const searchResult = useSelector((state) => state.search.quickSerchResult);
  const searchInput = useSelector((state) => state.search.searchQuery);
  const isOnline = useOnlineStatus();
  const location = useLocation();
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (
      searchInput.length >= 3 &&
      isOnline &&
      location.pathname !== "/search"
    ) {
      let curQuery = searchInput.trim();

      dispatch(searchActions.resetQuickSearchData());
      dispatch(searchActions.setErrorMessage(""));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const getModelsPreview = async () => {
        dispatch(searchActions.resetAllLastPageStatus());
        dispatch(
          liveSearch(
            curQuery,
            nsfwMode,
            SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE + 1,
            false,
            true
          )
        );
      };

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        getModelsPreview();
      }, searchTimeoutMs);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      dispatch(searchActions.setSearchIsLoading(false));
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchInput, nsfwMode, dispatch, location?.pathname, isOnline]);

  return (
    <motion.div
      initial={ANIMATIONS_FM_ZOOM_IN_INITIAL}
      animate={ANIMATIONS_FM_ZOOM_IN}
      exit={ANIMATIONS_FM_ZOOM_IN_INITIAL}
      className={classes["search__dropdown"]}
    >
      <div className={classes["search__settings"]}>
        <button
          className={classes["search__btn-close"]}
          onClick={() => {
            dispatch(searchActions.setSearchQuery(""));
            onOpen(false);
          }}
        >
          <span className={classes["search__cross"]}></span>
        </button>
      </div>
      <div className={classes["search__result"]}>
        <CategoriesSearch />
        <QuickSearchResultList />
        {searchResult.result.length > SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE && (
          <ButtonTertiary
            type="button"
            className={classes["btn-more"]}
            onClick={onSubmit}
          >
            Show more
          </ButtonTertiary>
        )}
        {searchIsLoading && (
          <div className={classes["spiner-container"]}>
            <Spinner size="small" />
          </div>
        )}
        {!searchIsLoading && errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
        {!searchIsLoading &&
          !errorMessage &&
          !searchResult?.result?.length &&
          !!searchResult?.query &&
          isOnline && <div className={classes.error}>No resources found</div>}
        {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      </div>
    </motion.div>
  );
};

export default QuickSearch;
