import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { useOnlineStatus } from "./use-online-status";
import { searchActions } from "../store/search";
import { civitaiSearch, liveSearch } from "../store/searchThunks";
import {
  selectQuickSearchResult,
  selectSearchErrorMessage,
  selectSearchIsLoading,
  selectSearchNsfw,
  selectSearchQuery,
  selectSearchSrc,
} from "../store/searchSelectors";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import {
  SETTINGS_SEARCH_MIN_QUERY_LENGTH,
  SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE,
} from "../variables/constants";

const searchTimeoutMs = 1000;

/**
 * Debounces quick-search requests outside the full search page.
 * Local search requests one extra result to detect whether more results exist.
 * NSFW mode changes restart the timer; level-only changes retain existing behavior.
 */
const useQuickSearchController = () => {
  const searchIsLoading = useAppSelector(selectSearchIsLoading);
  const errorMessage = useAppSelector(selectSearchErrorMessage);
  const nsfwData = useAppSelector(selectSearchNsfw);
  const nsfwMode = nsfwData.nsfwValue;
  const searchSrc = useAppSelector(selectSearchSrc);
  const searchResult = useAppSelector(selectQuickSearchResult);
  const searchInput = useAppSelector(selectSearchQuery);
  const isOnline = useOnlineStatus();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    let curQuery = searchInput.trim();
    if (
      isOnline &&
      location?.pathname !== "/search" &&
      curQuery?.length >= SETTINGS_SEARCH_MIN_QUERY_LENGTH
    ) {
      dispatch(searchActions.resetQuickSearchData());
      dispatch(searchActions.setErrorMessage(""));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const getModelsPreview = async () => {
        dispatch(searchActions.resetAllLastPageStatus());
        if (searchSrc === "aitools")
          dispatch(
            liveSearch(
              curQuery,
              nsfwData,
              SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE + 1,
              false,
              true,
            ),
          );

        if (searchSrc === "civitai")
          dispatch(
            civitaiSearch(
              curQuery,
              nsfwData,
              SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE,
              false,
              true,
            ),
          );
      };

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        getModelsPreview();
      }, searchTimeoutMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    searchInput,
    nsfwMode,
    dispatch,
    location?.pathname,
    isOnline,
    searchSrc,
  ]);

  const clearQuery = () => {
    dispatch(searchActions.setSearchQuery(""));
  };

  return {
    source: searchSrc,
    result: searchResult,
    status: { isLoading: searchIsLoading, errorMessage, isOnline },
    clearQuery,
  };
};

export default useQuickSearchController;
