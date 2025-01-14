import { useEffect, useRef, useState } from "react";
import PreviewCard from "../previewCard/PreviewCard";
import classes from "./SearchPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { liveSearch, searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import usePageEnd from "../../hooks/use-page-end";
import {
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../../variables/constants";
import { useOnlineStatus } from "../../hooks/use-online-status";
import AddToPanelAnimContainer from "../ui/AddToPanelAnimContainer";

const SearchPage = ({ title }) => {
  const [initial, setInitial] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const searchQuery = useSelector((state) => state.search.searchQuery);
  const searchResult = useSelector((state) => state.search.searchResult);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const isLastPage = useSelector((state) => state.search.isLastPage);
  const isLastSubPage = useSelector((state) => state.search.isLastSubPage);
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const usedModels = useSelector((state) => state.used.models);
  const dispatch = useDispatch();
  const endPage = useRef(null);
  const isPageEnd = usePageEnd(600);
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);
  console.log(searchIsLoading);

  useEffect(() => {
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);

  const searchResultHtml = searchResult.result?.map((item, i) => {
    return (
      <AddToPanelAnimContainer key={item.id} usedModels={usedModels}>
        <PreviewCard
          layout={true}
          previewData={item}
          onClick={() => {
            dispatch(searchActions.setSearchQuery(""));
          }}
        />
        <PreviewCard
          layout={false}
          previewData={item}
          onClick={() => {
            dispatch(searchActions.setSearchQuery(""));
          }}
        />
      </AddToPanelAnimContainer>
    );
  });

  useEffect(() => {
    document.title = searchQuery ? `${title} - ${searchQuery}` : title;
  }, [title, searchQuery]);

  useEffect(() => {
    if (
      (!isLastPage || !isLastSubPage) &&
      isIntersecting &&
      !!searchResult?.result?.length &&
      isOnline
    ) {
      setIsIntersecting(false);
      clearTimeout(timeoutRef.current);
      dispatch(searchActions.setSearchIsLoading(true));
      timeoutRef.current = setTimeout(() => {
        dispatch(
          liveSearch(
            searchResult.query,
            searchResult.nsfw,
            SETTINGS_SEARCH_RESULT_PER_PAGE,
            true,
            false,
            !!searchResult?.hashtag
          )
        );
      }, 1000);
    }
  }, [
    isIntersecting,
    searchResult?.result?.length,
    dispatch,
    isLastPage,
    isLastSubPage,
    searchResult,
    isOnline,
  ]);

  useEffect(() => {
    return () => {
      if (initial) {
        setInitial(false);
      } else if (!initial) {
        dispatch(searchActions.setSearchQuery(""));
      }
    };
  }, [dispatch, initial, isOnline]);

  return (
    <div className={classes["container"]}>
      {!searchIsLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {!!searchResult?.result?.length && (
        <div className={classes["title"]}>
          Search result for "{searchResult.query}"
        </div>
      )}
      {!searchIsLoading &&
        searchResult?.query &&
        !searchResultHtml?.length &&
        isOnline && <div className={classes["title"]}>No resources found</div>}
      {!!searchResult?.result?.length && (
        <ul className={classes["result-list"]}>{searchResultHtml}</ul>
      )}
      {searchIsLoading && <Spinner />}
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <div ref={endPage}></div>
    </div>
  );
};

export default SearchPage;
