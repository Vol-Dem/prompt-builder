import { useEffect, useMemo, useRef, useState } from "react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router-dom";

import classes from "./SearchPage.module.scss";
import { liveSearch, searchActions } from "../store/search";
import { useOnlineStatus } from "../hooks/use-online-status";
import useIntersection from "../hooks/use-intersection";
import { checkObjectsIsEqual } from "../utils/generalUtils";
import {
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
  SETTINGS_SEARCH_MIN_QUERY_LENGTH,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../variables/constants";
import PreviewCard from "../components/general-elements/preview-card/PreviewCard";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import LeftSidebar from "../components/layout/left-sidebar/LeftSidebar";
import NotificationMessage from "../components/ui/NotificationMessage";
import SearchFilter from "../components/search/search-filter/SearchFilter";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";

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
    };
  }, [searchParams]);

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
      ((isNotLastPage && isIntersecting) || searchParamsIsChanged) &&
      isOnline &&
      searchQueryParam &&
      searchQueryParam?.length >= SETTINGS_SEARCH_MIN_QUERY_LENGTH &&
      !searchIsLoading
    ) {
      fetchTimeoutRef.current = setTimeout(() => {
        setIsIntersecting(false);
        if (searchParamsIsChanged) {
          dispatch(searchActions.resetAllLastPageStatus());
        }

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
  ]);

  const openSidebarHandler = () => {
    setSidebarIsOpen(true);
  };

  const closeidebarHandler = () => {
    setSidebarIsOpen(false);
  };

  const searchResultHtml = searchResult.result?.map((item) => {
    return <PreviewCard key={item.id} item={item} />;
  });

  let notificationMessage;

  if (searchResult?.query && !searchResultHtml?.length) {
    notificationMessage = `No results for "${searchQuery}" found. Try to change your search
              filter`;
  } else if (!searchResult?.query && !searchResultHtml?.length) {
    notificationMessage =
      "Enter your query in the search field to start searching";
  }

  return (
    <div className={classes["container"]}>
      {!searchIsLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      <LeftSidebar
        isOpen={sidebarIsOpen}
        onClose={closeidebarHandler}
        onOpen={openSidebarHandler}
        btnContent={<AdjustmentsHorizontalIcon />}
      >
        <SearchFilter />
      </LeftSidebar>
      <div>
        {!!searchResult?.result?.length && (
          <>
            <div className={classes["text"]}>
              Search result for "{searchResult.query}"
            </div>
            <ul className={classes["result-list"]}>{searchResultHtml}</ul>
          </>
        )}
        {notificationMessage && isOnline && !searchIsLoading && (
          <NotificationMessage className={classes["text"]}>
            {notificationMessage}
          </NotificationMessage>
        )}
        {searchIsLoading && <Spinner />}
        {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
        <div ref={endPageRef}></div>
      </div>
    </div>
  );
};

export default SearchPage;
