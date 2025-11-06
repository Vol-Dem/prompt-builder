import { useState } from "react";
import classes from "./SearchField.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { liveSearch, searchActions } from "../../store/search";
import { SETTINGS_SEARCH_RESULT_PER_PAGE } from "../../variables/constants";
import { AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { updateSearchParams } from "../../utils/generalUtils";
import QuickSearch from "./quick-search/QuickSearch";

const SearchField = ({ className }) => {
  const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);
  const searchInput = useSelector((state) => state.search.searchQuery);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const setSearchParams = useSearchParams()[1];

  const searchInputHandler = (e) => {
    const searchInputValue = e.target.value;
    setSearchResultIsOpen(true);
    dispatch(searchActions.setSearchQuery(searchInputValue));
    if (location.pathname === "/search") {
      setSearchParams((prevParams) => {
        return updateSearchParams(prevParams, {
          searchQuery: searchInputValue,
        });
      });
    }
  };

  const openMobileSearch = () => {
    if (location.pathname !== "/search") {
      navigate("search");
    }
  };

  const submitSearchHandler = (e) => {
    e.preventDefault();
    dispatch(searchActions.resetSearchData());
    if (location.pathname !== "/search") {
      navigate(`search?searchQuery=${searchInput}`);
    }

    if (!searchInput.trim()) return;

    if (location.pathname !== "/search") {
      dispatch(searchActions.resetSearchFilter());
    }

    dispatch(
      liveSearch(
        searchInput.trim(),
        nsfwMode,
        SETTINGS_SEARCH_RESULT_PER_PAGE,
        false,
        false
      )
    );
  };

  return (
    <>
      <span className={classes["btn-search"]} onClick={openMobileSearch}>
        <MagnifyingGlassIcon />
      </span>
      <div
        className={`${classes["search"]} ${
          location.pathname === "/search" ? "" : classes["search-hidden"]
        } ${className || ""}`}
      >
        <form
          onSubmit={submitSearchHandler}
          className={classes["search__field"]}
        >
          <input
            type="search"
            name="search"
            onChange={searchInputHandler}
            value={searchInput}
            placeholder="Search"
            className={classes["search__input"]}
            onFocus={() => {
              setSearchResultIsOpen(true);
            }}
          />
          <button
            type="submit"
            data-testid="search-submit"
            className={classes["search__btn"]}
            title="Search"
          >
            <MagnifyingGlassIcon />
          </button>
        </form>
        <AnimatePresence>
          {searchInput.length >= 3 &&
            searchResultIsOpen &&
            location.pathname !== "/search" && (
              <QuickSearch
                onSubmit={submitSearchHandler}
                onOpen={setSearchResultIsOpen}
              />
            )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SearchField;
