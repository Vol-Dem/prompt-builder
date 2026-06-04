import { useEffect, useMemo, useRef, useState } from "react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router-dom";

import classes from "./SearchPage.module.scss";
import { liveSearch, searchActions } from "../store/search";
import { useOnlineStatus } from "../hooks/use-online-status";
import useIntersection from "../hooks/use-intersection";
import { checkObjectsIsEqual, createParamString } from "../utils/generalUtils";
import {
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
  SETTINGS_SEARCH_MIN_QUERY_LENGTH,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
  URL_CIV_MODELS,
} from "../variables/constants";
import PreviewCard from "../components/general-elements/preview-card/PreviewCard";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import LeftSidebar from "../components/layout/left-sidebar/LeftSidebar";
import NotificationMessage from "../components/ui/NotificationMessage";
import SearchFilter from "../components/search/search-filter/SearchFilter";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import useFetchCivitai from "../hooks/use-fetch-civitai";
import { createModelPreviewData } from "../utils/modelUtils";
import type { SearchFilter as SearchFilterType } from "../types/search.types";
import Button from "../components/ui/buttons/Button";

interface SearchPageProps {
  title: string;
}

/**
 * Full search page with filters and infinite scroll.
 *
 * Responsibilities:
 * - Reads query and filters from the URL.
 * - Performs paginated search with intersection observers.
 * - Preserves results when navigating away and back.
 * - Reloads only when query, filters, or NSFW mode change.
 * - Displays filters in a collapsible sidebar.
 *
 * Pagination state:
 * - isLastPage: no more model-name results
 * - isLastCollectionsPage: no more collection-name results
 * - isLastSubPage: no more metadata-field results
 *
 * Infinite scrolling continues while ANY of them is false.
 *
 * @param props
 * @param props.title - Page title.
 *
 * @returns Search page.
 */
const SearchPage = ({ title }: SearchPageProps) => {
  const [initial, setInitial] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = useAppSelector((state) => state.search.searchQuery);
  const searchResult = useAppSelector((state) => state.search.searchResult);
  const searchIsLoading = useAppSelector((state) => state.search.isLoading);
  const isLastPage = useAppSelector((state) => state.search.isLastPage);
  const isLastSubPage = useAppSelector((state) => state.search.isLastSubPage);
  const isLastCollectionsPage = useAppSelector(
    (state) => state.search.isLastCollectionsPage,
  );
  const errorMessage = useAppSelector((state) => state.search.errorMessage);
  const searchSrc = useAppSelector((state) => state.search.src);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
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
  const searchFilter = useMemo(() => {
    const modelType = searchParams.get("modelType");
    const baseModel = searchParams.get("baseModel");
    const hashtag = searchParams.get("hashtag") === "true";
    return {
      modelType: modelType?.split(",").filter(Boolean) || [],
      baseModel: baseModel?.split(",").filter(Boolean) || [],
      hashtag,
      src: searchSrc,
    };
  }, [searchParams, searchSrc]);

  const createCivitaiSearchUrl = (searchFilter: SearchFilterType) => {
    // const baseModels = searchFilter.baseModel?.length
    //   ? `&baseModels=${searchFilter.baseModel}`
    //   : "";
    const baseModels = searchFilter.baseModel?.length
      ? createParamString(searchFilter.baseModel, "baseModels")
      : "";
    const modelType = searchFilter.modelType?.length
      ? createParamString(searchFilter.modelType, "types")
      : "";

    return `${URL_CIV_MODELS}?query=${searchQueryParam}&limit=${SETTINGS_SEARCH_RESULT_PER_PAGE}${baseModels}${modelType}&sort=Newest`;
  };
  const url = createCivitaiSearchUrl(searchFilter);
  const {
    fetchedData: fetchedModels,
    isFetching: modelsIsLoading,
    // setFetchedData: setFetchedModels,
    isLastPage: isLastCivPage,
    errorMessage: civErrorMessage,
    fetchCivitai,
    setErrorMessage: setCivErrorMessage,
  } = useFetchCivitai(url);

  const queryStringIsChanged = searchResult?.query !== searchQueryParam;
  const filterIsChanged =
    searchFilter &&
    searchResult?.filter &&
    !checkObjectsIsEqual(searchFilter, searchResult?.filter);
  const searchParamsIsChanged =
    queryStringIsChanged || filterIsChanged || searchResult.nsfw !== nsfwMode;
  const loadMore = !searchParamsIsChanged && !!searchResult?.result?.length;

  const isNotLastPage = !isLastPage || !isLastSubPage || !isLastCollectionsPage;

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

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (
      searchSrc === "civitai" &&
      !isLastCivPage &&
      (isIntersecting ||
        fetchedModels?.length < SETTINGS_SEARCH_RESULT_PER_PAGE) &&
      isOnline &&
      searchQueryParam &&
      searchQueryParam?.length >= SETTINGS_SEARCH_MIN_QUERY_LENGTH &&
      !modelsIsLoading
    ) {
      fetchCivitai(setIsIntersecting);
    }
  }, [
    isOnline,
    isIntersecting,
    nsfwMode,
    searchQueryParam,
    searchParamsIsChanged,
    isLastCivPage,
    modelsIsLoading,
    searchSrc,
    fetchCivitai,
    fetchedModels,
  ]);

  const retryImageLoadingHandler = () => {
    setCivErrorMessage("");
    fetchCivitai(setIsIntersecting);
  };

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (
      searchSrc === "aitools" &&
      ((isNotLastPage && isIntersecting) || searchParamsIsChanged) &&
      isOnline &&
      searchQueryParam &&
      searchQueryParam?.length >= SETTINGS_SEARCH_MIN_QUERY_LENGTH &&
      !searchIsLoading
    ) {
      if (searchParamsIsChanged) {
        dispatch(searchActions.resetAllLastPageStatus());
      }
      // if (searchSrc === "civitai") {
      //   fetchCivitai(setIsIntersecting);
      // }
      if (searchSrc === "aitools")
        fetchTimeoutRef.current = setTimeout(() => {
          setIsIntersecting(false);

          dispatch(
            liveSearch(
              searchQueryParam,
              nsfwMode,
              SETTINGS_SEARCH_RESULT_PER_PAGE,
              loadMore,
              false,
              searchFilter.hashtag,
              searchFilter,
            ),
          );
        }, 1000);
    }

    document.title = searchQueryParam
      ? `${title} - ${searchQueryParam}`
      : title;
  }, [
    dispatch,
    isOnline,
    isIntersecting,
    isNotLastPage,
    nsfwMode,
    loadMore,
    searchFilter,
    searchQueryParam,
    searchParamsIsChanged,
    searchIsLoading,
    title,
    searchSrc,
  ]);

  const openSidebarHandler = () => {
    setSidebarIsOpen(true);
  };

  const closeidebarHandler = () => {
    setSidebarIsOpen(false);
  };

  const res =
    searchSrc === "aitools"
      ? searchResult.result
      : fetchedModels.flatMap(
          (model) =>
            createModelPreviewData(model, model.modelVersions[0]) || [],
        );

  const searchResultHtml = res?.map((item) => {
    return <PreviewCard key={item.id} item={item} />;
  });

  let notificationMessage;

  if (
    searchResult?.query &&
    !searchResultHtml?.length &&
    !fetchedModels.length
  ) {
    notificationMessage = `No results for "${searchQuery}" found. Try to change your search
              filter`;
  } else if (
    !searchQuery &&
    !searchResult?.query &&
    !searchResultHtml?.length &&
    !fetchedModels.length
  ) {
    notificationMessage =
      "Enter your query in the search field to start searching";
  }

  const errorMessageHtml = errorMessage || civErrorMessage;

  return (
    <div className={classes["container"]}>
      <LeftSidebar
        isOpen={sidebarIsOpen}
        onClose={closeidebarHandler}
        onOpen={openSidebarHandler}
        btnContent={<AdjustmentsHorizontalIcon />}
      >
        <SearchFilter />
      </LeftSidebar>
      <div>
        {!!res?.length && (
          <>
            <div className={classes["text"]}>
              Search result for "{searchResult.query}"
            </div>
            <ul className={classes["result-list"]}>{searchResultHtml}</ul>
          </>
        )}
        {!searchIsLoading && !modelsIsLoading && errorMessageHtml && (
          <ErrorMessage>{errorMessageHtml}</ErrorMessage>
        )}
        <div ref={endPageRef}></div>
        <div className={classes.panel}>
          {notificationMessage && isOnline && !searchIsLoading && (
            <NotificationMessage className={classes["text"]}>
              {notificationMessage}
            </NotificationMessage>
          )}
          {(searchIsLoading || modelsIsLoading) && <Spinner />}
          {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}

          {!modelsIsLoading && !isLastCivPage && !civErrorMessage && (
            <div>
              <Button
                className={classes["btn-more"]}
                onClick={() => {
                  fetchCivitai();
                }}
              >
                Load more
              </Button>
            </div>
          )}
          {!modelsIsLoading && civErrorMessage && (
            <Button
              className={classes["btn-more"]}
              onClick={retryImageLoadingHandler}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
