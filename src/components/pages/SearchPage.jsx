import { useEffect, useRef, useState } from "react";
import PreviewCard from "../previewCard/PreviewCard";
import classes from "./SearchPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { liveSearch, searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import useIntersection from "../../hooks/use-intersection";

// let initial = true;
const amountPerPage = 10;

const SearchPage = ({ title }) => {
  const [initial, setInitial] = useState(true);
  const searchQuery = useSelector((state) => state.search.searchQuery);
  const searchResult = useSelector((state) => state.search.searchResult);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const isLastPage = useSelector((state) => state.search.isLastPage);
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const endPage = useRef(null);
  const isIntersecting = useIntersection(endPage, false);

  const searchResultHtml = searchResult.result?.map((item, i) => {
    return <PreviewCard key={item.id} previewData={item} />;
  });

  const dispatch = useDispatch();

  useEffect(() => {
    document.title = searchQuery ? `${title} - ${searchQuery}` : title;
  }, [title, searchQuery]);

  useEffect(() => {
    if (!isLastPage && isIntersecting && !!searchResult?.result?.length) {
      console.log("INERS");
      console.log(isIntersecting);
      dispatch(
        liveSearch(searchResult.query, searchResult.nsfw, amountPerPage, true)
      );
    }
  }, [
    isIntersecting,
    searchResult?.result?.length,
    dispatch,
    isLastPage,
    searchResult,
  ]);

  useEffect(() => {
    return () => {
      if (initial) {
        // initial = false;
        setInitial(false);
      } else {
        dispatch(searchActions.setSearchQuery(""));
        // dispatch(searchActions.setSearchResult([]));
      }
    };
  }, [dispatch, initial]);

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
      {!searchIsLoading && searchResult?.query && !searchResultHtml?.length && (
        <div className={classes["title"]}>No resources found</div>
      )}
      {!!searchResult?.result?.length && (
        <ul className={classes["result-list"]}>{searchResultHtml}</ul>
      )}
      {searchIsLoading && <Spinner />}
      <div ref={endPage}></div>
    </div>
  );
};

export default SearchPage;
