import { useEffect, useRef, useState } from "react";
import PreviewCard from "../previewCard/PreviewCard";
import classes from "./SearchPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { liveSearch, searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import useIntersection from "../../hooks/use-intersection";
import usePageEnd from "../../hooks/use-page-end";
import { OFFLINE_ERROR_MESSAGE } from "../../variables/constants";
import { useOnlineStatus } from "../../hooks/use-online-status";

// let initial = true;
const amountPerPage = 10;

const SearchPage = ({ title }) => {
  const [initial, setInitial] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const searchQuery = useSelector((state) => state.search.searchQuery);
  const searchResult = useSelector((state) => state.search.searchResult);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const isLastPage = useSelector((state) => state.search.isLastPage);
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const endPage = useRef(null);
  // const isIntersecting = useIntersection(endPage, false);
  const isPageEnd = usePageEnd(600);
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);

  useEffect(() => {
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);

  const searchResultHtml = searchResult.result?.map((item, i) => {
    return <PreviewCard key={item.id} previewData={item} />;
  });

  const dispatch = useDispatch();

  useEffect(() => {
    document.title = searchQuery ? `${title} - ${searchQuery}` : title;
  }, [title, searchQuery]);

  useEffect(() => {
    if (
      !isLastPage &&
      isIntersecting &&
      !!searchResult?.result?.length &&
      isOnline
    ) {
      console.log("INERS");
      console.log(isIntersecting);
      setIsIntersecting(false);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dispatch(
          liveSearch(searchResult.query, searchResult.nsfw, amountPerPage, true)
        );
      }, 1000);
    }
  }, [
    isIntersecting,
    searchResult?.result?.length,
    dispatch,
    isLastPage,
    searchResult,
    isOnline,
  ]);

  useEffect(() => {
    return () => {
      if (initial && isOnline) {
        // initial = false;
        setInitial(false);
      } else if (!initial && !isOnline) {
        dispatch(searchActions.setSearchQuery(""));
        // dispatch(searchActions.setSearchResult([]));
      }
    };
  }, [dispatch, initial, isOnline]);

  // useEffect(() => {
  //   if (!isLastPage && isIntersecting && !!loraItems.length) {
  //     dispatch(getModelsPreview());
  //     console.log("INT", isIntersecting);
  //   }
  // }, [isIntersecting, dispatch, isLastPage, loraItems.length]);

  return (
    <div className={classes["container"]}>
      {!searchIsLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {!searchIsLoading && !!searchResultHtml?.length && (
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
      {!isOnline && <ErrorMessage>{OFFLINE_ERROR_MESSAGE}</ErrorMessage>}
      <div ref={endPage}></div>
    </div>
  );
};

export default SearchPage;
