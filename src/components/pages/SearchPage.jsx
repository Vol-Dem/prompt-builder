import { useEffect, useMemo, useRef, useState } from "react";
import PreviewCard from "../preview-card/PreviewCard";
import classes from "./SearchPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { liveSearch, searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import {
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../../variables/constants";
import { useOnlineStatus } from "../../hooks/use-online-status";
import LeftSidebar from "../layout/left-sidebar/LeftSidebar";
import NotificationMessage from "../ui/NotificationMessage";
import { checkObjectsIsEqual } from "../../utils/generalUtils";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router-dom";
import useIntersection from "../../hooks/use-intersection";
import SearchFilter from "../search/search-filter/SearchFilter";

const SearchPage = ({ title }) => {
  const [initial, setInitial] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = useSelector((state) => state.search.searchQuery);
  const searchResult = useSelector((state) => state.search.searchResult);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const isLastPage = useSelector((state) => state.search.isLastPage);
  const isLastSubPage = useSelector((state) => state.search.isLastSubPage);
  const isLastCollectionsPage = useSelector(
    (state) => state.search.isLastCollectionsPage
  );
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch();
  const fetchTimeoutRef = useRef(null);
  const endPageRef = useRef(null);
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`
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
    document.title = searchQueryParam
      ? `${title} - ${searchQueryParam}`
      : title;
  }, [title, searchQueryParam]);

  useEffect(() => {
    return () => {
      dispatch(searchActions.setSearchQuery(""));
    };
  }, [dispatch]);

  useEffect(() => {
    if (initial) {
      setInitial(false);
      dispatch(searchActions.setSearchQuery(searchQueryParam));
    }
  }, [dispatch, initial, searchQueryParam]);

  useEffect(() => {
    clearTimeout(fetchTimeoutRef.current);

    if (
      ((isNotLastPage && isIntersecting) || searchParamsIsChanged) &&
      isOnline &&
      searchQueryParam?.length > 3 &&
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
            searchFilter
          )
        );
      }, 1000);
    }
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
  ]);

  const openSidebarHandler = () => {
    setSidebarIsOpen(true);
  };

  const closeidebarHandler = () => {
    setSidebarIsOpen(false);
  };

  const searchResultHtml = searchResult.result?.map((item, i) => {
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
