import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { searchActions } from "../store/search";
import { civitaiSearch, liveSearch } from "../store/searchThunks";
import {
  selectSearchErrorMessage,
  selectSearchIsLastCollectionsPage,
  selectSearchIsLastPage,
  selectSearchIsLastSubPage,
  selectSearchIsLoading,
  selectSearchNsfw,
  selectSearchQuery,
  selectSearchResult,
  selectSearchSrc,
} from "../store/searchSelectors";
import { useOnlineStatus } from "./use-online-status";
import useIntersection from "./use-intersection";
import { checkObjectsIsEqual } from "../utils/generalUtils";
import { parseSearchFilterParams } from "../utils/searchUtils";
import {
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
  SETTINGS_SEARCH_MIN_QUERY_LENGTH,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../variables/constants";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";

/**
 * Coordinates full-search requests, retained results, and source-specific pagination.
 * The page owns its title, sidebar, and presentation.
 */
const useSearchResultsController = () => {
  const [initial, setInitial] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = useAppSelector(selectSearchQuery);
  const searchResult = useAppSelector(selectSearchResult);
  const searchIsLoading = useAppSelector(selectSearchIsLoading);
  const isLastPage = useAppSelector(selectSearchIsLastPage);
  const isLastSubPage = useAppSelector(selectSearchIsLastSubPage);
  const isLastCollectionsPage = useAppSelector(selectSearchIsLastCollectionsPage);
  const errorMessage = useAppSelector(selectSearchErrorMessage);
  const searchSrc = useAppSelector(selectSearchSrc);
  const nsfwData = useAppSelector(selectSearchNsfw);
  const { nsfwValue: nsfwMode, nsfwLevel } = nsfwData;
  const isOnline = useOnlineStatus();
  const dispatch = useAppDispatch();
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const endPageRef = useRef<HTMLDivElement>(null);
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`,
  );
  const searchQueryParam = searchParams.get("searchQuery");

  const searchFilter = useMemo(
    () => ({ ...parseSearchFilterParams(searchParams), src: searchSrc }),
    [searchParams, searchSrc],
  );

  const queryStringIsChanged = searchResult?.query !== searchQueryParam;
  const filterIsChanged =
    searchFilter &&
    searchResult?.filter &&
    !checkObjectsIsEqual(searchFilter, searchResult?.filter);
  const searchParamsIsChanged =
    queryStringIsChanged ||
    filterIsChanged ||
    searchResult.nsfw.nsfwValue !== nsfwMode ||
    searchResult.nsfw.nsfwLevel !== nsfwLevel;
  const loadMore = !searchParamsIsChanged && !!searchResult?.result?.length;

  let isNotLastPage = !isLastPage || !isLastSubPage || !isLastCollectionsPage;

  //Fix for a Civitai bug where the number of results per query could be less than the limit.
  const lessThanLimit =
    searchResult.result.length < SETTINGS_SEARCH_RESULT_PER_PAGE &&
    isNotLastPage;

  if (searchSrc === "civitai") {
    isNotLastPage = !isLastPage;
  }

  if (filterIsChanged) {
    window.scroll(0, 0);
  }

  useEffect(() => {
    setIsIntersecting(intersecting || intersectingSmall);
  }, [intersecting, intersectingSmall]);

  useEffect(() => {
    return () => {
      dispatch(searchActions.setSearchQuery(""));
    };
  }, [dispatch]);

  useEffect(() => {
    if (initial) {
      setInitial(false);
      if (searchQueryParam) {
        dispatch(searchActions.setSearchQuery(searchQueryParam));
      }
    }
  }, [dispatch, initial, searchQueryParam]);

  const retryImageLoadingHandler = () => {
    dispatch(searchActions.setErrorMessage(""));
    dispatch(
      civitaiSearch(
        searchQueryParam,
        nsfwData,
        SETTINGS_SEARCH_RESULT_PER_PAGE,
        true,
        false,
        searchFilter.hashtag,
        searchFilter,
      ),
    );
  };

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (
      ((isNotLastPage && isIntersecting) ||
        searchParamsIsChanged ||
        lessThanLimit) &&
      isOnline &&
      searchQueryParam &&
      searchQueryParam?.length >= SETTINGS_SEARCH_MIN_QUERY_LENGTH &&
      !searchIsLoading &&
      !errorMessage
    ) {
      if (searchParamsIsChanged) {
        dispatch(searchActions.resetAllLastPageStatus());
      }

      fetchTimeoutRef.current = setTimeout(() => {
        setIsIntersecting(false);
        if (searchSrc === "aitools")
          dispatch(
            liveSearch(
              searchQueryParam,
              nsfwData,
              SETTINGS_SEARCH_RESULT_PER_PAGE,
              loadMore,
              false,
              searchFilter.hashtag,
              searchFilter,
            ),
          );
        if (searchSrc === "civitai")
          dispatch(
            civitaiSearch(
              searchQueryParam,
              nsfwData,
              SETTINGS_SEARCH_RESULT_PER_PAGE,
              loadMore,
              false,
              searchFilter.hashtag,
              searchFilter,
            ),
          );
      }, 1000);
    }
  }, [
    dispatch,
    isOnline,
    isIntersecting,
    isNotLastPage,
    nsfwData,
    loadMore,
    searchFilter,
    searchQueryParam,
    searchParamsIsChanged,
    searchIsLoading,
    searchSrc,
    errorMessage,
    lessThanLimit,
  ]);

  return {
    source: searchSrc,
    query: { value: searchQuery, parameter: searchQueryParam },
    results: searchResult.result,
    status: { isLoading: searchIsLoading, errorMessage, isOnline },
    pagination: {
      endPageRef,
      hasMore: isNotLastPage,
      isLastPage,
      loadMore: retryImageLoadingHandler,
    },
  };
};

export default useSearchResultsController;
