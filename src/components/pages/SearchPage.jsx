import { useEffect, useState } from "react";
import PreviewCard from "../previewCard/PreviewCard";
import classes from "./SearchPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";

// let initial = true;

const SearchPage = ({ title }) => {
  const [initial, setInitial] = useState(true);
  const searchQuery = useSelector((state) => state.search.searchQuery);
  const searchResult = useSelector((state) => state.search.searchResult);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const searchResultHtml = searchResult.map((item, i) => {
    return <PreviewCard key={item.id} previewData={item} />;
  });

  const dispatch = useDispatch();

  useEffect(() => {
    document.title = searchQuery ? `${title} - ${searchQuery}` : title;
  }, [title, searchQuery]);

  useEffect(() => {
    return () => {
      if (initial) {
        // initial = false;
        setInitial(false);
      } else {
        dispatch(searchActions.setSearchQuery(""));
        dispatch(searchActions.setSearchResult([]));
      }
    };
  }, [dispatch, initial]);

  return (
    <div className={classes["container"]}>
      {searchIsLoading && <Spinner />}
      {!searchIsLoading && errorMessage && <div>{errorMessage}</div>}
      {!searchIsLoading && !!searchResultHtml?.length && (
        <div className={classes["title"]}>
          Search result for "{searchQuery}"
        </div>
      )}
      {!searchIsLoading && searchResult && (
        <ul className={classes["result-list"]}>{searchResultHtml}</ul>
      )}
    </div>
  );
};

export default SearchPage;
