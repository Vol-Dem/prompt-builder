import {
  useState,
  type ChangeEvent,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { searchActions } from "../../store/search";
import classes from "./SearchField.module.scss";
import { updateSearchParams } from "../../utils/generalUtils";
import QuickSearch from "./quick-search/QuickSearch";
import {
  SETTINGS_SEARCH_CIVITAI,
  SETTINGS_SEARCH_MIN_QUERY_LENGTH,
} from "../../variables/constants";
import { useAppDispatch, useAppSelector } from "../../store/hooks/hooks";
import Select from "../ui/forms/Select";
import type { SearchSrcType } from "../../types/search.types";
import logo from "../../assets/logo192.png";
import logoCiv from "../../assets/logo-civ-80.png";

type SearchFieldProps = ComponentProps<"div">;

type SearchSrcSelectValue = { name: ReactNode; value: SearchSrcType };

/**
 * Global search input displayed in the app header.
 *
 * Responsibilities:
 * - Owns the global `searchQuery` Redux value.
 * - Opens QuickSearch when typing outside the Search page.
 * - Navigates to /search on submit or mobile search icon click.
 * - Syncs the query into the URL when already on /search.
 * - Clears the query when leaving the Search page.
 *
 * @component
 * @returns Search field.
 */
const SearchField = ({ className }: SearchFieldProps) => {
  const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);
  const searchInput = useAppSelector((state) => state.search.searchQuery);
  const searchSrc = useAppSelector((state) => state.search.src);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const setSearchParams = useSearchParams()[1];

  const searchInputHandler = (e: ChangeEvent<HTMLInputElement>) => {
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

  const submitSearchHandler = (
    e: SubmitEvent | MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    dispatch(searchActions.resetSearchData());
    if (location.pathname !== "/search") {
      navigate(`search?searchQuery=${searchInput}`);
    }

    if (!searchInput.trim()) return;

    if (location.pathname !== "/search") {
      dispatch(searchActions.resetSearchFilter());
    }
  };

  const aiToolsLogo = (
    <span className={classes["select-logo"]}>
      <img src={logo} alt="AITOOLS" />
    </span>
  );
  const civitaiLogo = (
    <span className={classes["select-logo"]}>
      <img src={logoCiv} alt="AITOOLS" />
    </span>
  );

  const searchSrcOptions: SearchSrcSelectValue[] = [
    { name: aiToolsLogo, value: "aitools" },
    { name: civitaiLogo, value: "civitai" },
  ];

  const searchSrcHandler = (value: SearchSrcType | null) => {
    dispatch(searchActions.resetSearchData());
    dispatch(searchActions.resetSearchFilter());

    if (value) dispatch(searchActions.setSearchSrc(value));
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
          {SETTINGS_SEARCH_CIVITAI && (
            <Select
              className={classes["select"]}
              options={searchSrcOptions}
              selected={searchSrc}
              onChange={searchSrcHandler}
            />
          )}
          <input
            type="search"
            name="search"
            onChange={searchInputHandler}
            value={searchInput}
            placeholder="Search"
            className={`${classes["search__input"]} ${SETTINGS_SEARCH_CIVITAI ? classes["search__input--civ"] : ""}`}
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
          {searchInput?.length >= SETTINGS_SEARCH_MIN_QUERY_LENGTH &&
            searchResultIsOpen &&
            searchSrc !== "civitai" &&
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
