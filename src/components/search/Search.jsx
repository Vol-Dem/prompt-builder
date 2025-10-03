import { useEffect, useRef, useState } from "react";
import classes from "./Search.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Image from "../ui/image/Image";
import {
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { liveSearch, searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";
import ButtonSquareAdd from "../ui/ButtonSquareAdd";
import ErrorMessage from "../ui/ErrorMessage";
import ButtonTertiary from "../ui/ButtonTertiary";
import { useOnlineStatus } from "../../hooks/use-online-status";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
  ERROR_MESSAGE_DEFAULT,
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
  SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../../variables/constants";
import { AnimatePresence, motion } from "framer-motion";
import { modelActions } from "../../store/model";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { updateSearchParams } from "../../utils/generalUtils";
import CategoriesSearch from "./categories-search/CategoriesSearch";

const searchTimeoutMs = 1000;

const Search = ({ className }) => {
  const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);
  const searchInput = useSelector((state) => state.search.searchQuery);
  const uid = useSelector((state) => state.auth.user.uid);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const searchFilter = useSelector((state) => state.search.searchFilter);
  const quickSerchResult = useSelector(
    (state) => state.search.quickSerchResult
  );
  const searchResultFull = useSelector((state) => state.search.searchResult);
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  let searchResult = quickSerchResult;

  if (quickSerchResult.result.length > SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE) {
    searchResult = {
      ...quickSerchResult,
      result: quickSerchResult.result.toSpliced(-1),
    };
  }

  useEffect(() => {
    if (
      location?.pathname !== "/search" &&
      searchResultFull?.result?.length !== 0
    ) {
      dispatch(searchActions.setSearchQuery(""));
    }
  }, [location?.pathname, searchResultFull?.result, dispatch]);

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

  useEffect(() => {
    let curQuery = searchInput.trim();

    if (uid && searchInput.length >= 3 && isOnline) {
      if (
        location.pathname !== "/search" &&
        searchResult.query === curQuery &&
        searchResult.nsfw === nsfwMode
      )
        return;
      dispatch(searchActions.resetQuickSearchData());
      if (location.pathname === "/search") {
        dispatch(searchActions.resetSearchData());
      }

      dispatch(searchActions.setErrorMessage(""));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const getModelsPreview = async () => {
        try {
          if (location.pathname !== "/search") {
            dispatch(
              liveSearch(
                curQuery,
                nsfwMode,
                SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE + 1,
                false,
                true
              )
            );
          } else {
            dispatch(searchActions.setIsLastPage(false));
            dispatch(searchActions.setIsLastSubPage(false));

            dispatch(
              liveSearch(
                curQuery,
                nsfwMode,
                SETTINGS_SEARCH_RESULT_PER_PAGE,
                false,
                false,
                searchFilter.hashtag,
                searchFilter
              )
            );
          }
        } catch (err) {
          dispatch(searchActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
          dispatch(searchActions.setSearchIsLoading(false));
        }
      };

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        getModelsPreview();
      }, searchTimeoutMs);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      dispatch(searchActions.setSearchIsLoading(false));
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    searchInput,
    nsfwMode,
    uid,
    dispatch,
    location?.pathname,
    searchResult?.query,
    searchResult?.nsfw,
    isOnline,
    searchFilter,
  ]);

  const searchResultHtml = searchResult?.result?.map((modelPreveiw, i) => {
    return (
      <motion.li
        key={modelPreveiw.id}
        initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        animate={ANIMATIONS_FM_SLIDEIN}
        exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
        className={classes["search__item"]}
      >
        <NavLink
          to={
            modelPreveiw.type === "collection"
              ? `images/${modelPreveiw.id}`
              : `models/${modelPreveiw.id}`
          }
          className={classes["search__link"]}
          onClick={() => {
            dispatch(searchActions.setSearchQuery(""));
            dispatch(searchActions.setSearchResult([]));
            dispatch(modelActions.setActiveCarouselData({}));
          }}
        >
          <>
            <Image
              className={classes["img-container"]}
              src={
                nsfwMode
                  ? modelPreveiw.nsfwPreviewImgUrl ||
                    modelPreveiw.customPreviewImgUrl ||
                    modelPreveiw.imgUrl
                  : modelPreveiw.customPreviewImgUrl || modelPreveiw.imgUrl
              }
              imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
            />
          </>
          <div className={classes["card__content"]}>
            <div>
              <span className={classes.type}>
                {modelPreveiw.type === "TextualInversion"
                  ? "Embedding"
                  : modelPreveiw.type}
              </span>
              {modelPreveiw.baseModel && (
                <span className={classes.models}>{modelPreveiw.baseModel}</span>
              )}
            </div>

            <div className={classes["search__name"]}>{modelPreveiw.name}</div>
          </div>
        </NavLink>
        <ButtonSquareAdd
          previewData={modelPreveiw}
          className={classes["search__add"]}
        />
      </motion.li>
    );
  });

  const submitSearchHandler = (e) => {
    e.preventDefault();
    if (location.pathname !== "/search") {
      navigate(`search?searchQuery=${searchInput}`);
    }

    if (!searchInput.trim()) return;

    dispatch(searchActions.resetSearchData());

    if (location.pathname !== "/search") {
      dispatch(searchActions.resetSearchFilter());
    }

    // const isHashtag = searchInput.trim()[0] === "#";

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      timeoutRef.current = null;
      dispatch(
        liveSearch(
          searchInput.trim(),
          nsfwMode,
          SETTINGS_SEARCH_RESULT_PER_PAGE,
          false,
          false,
          searchFilter.hashtag,
          searchFilter
        )
      );
    }, searchTimeoutMs);
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
              <motion.div
                initial={ANIMATIONS_FM_ZOOM_IN_INITIAL}
                animate={ANIMATIONS_FM_ZOOM_IN}
                exit={ANIMATIONS_FM_ZOOM_IN_INITIAL}
                className={classes["search__dropdown"]}
              >
                <div className={classes["search__settings"]}>
                  <button
                    className={classes["search__btn-close"]}
                    onClick={() => {
                      // setSearchResult({});
                      dispatch(searchActions.setSearchQuery(""));
                      setSearchResultIsOpen(false);
                    }}
                  >
                    <span className={classes["search__cross"]}></span>
                  </button>
                </div>
                <div className={classes["search__result"]}>
                  <CategoriesSearch />
                  {searchIsLoading && (
                    <div className={classes["spiner-container"]}>
                      <Spinner size="small" />
                    </div>
                  )}
                  {!searchIsLoading && errorMessage && (
                    <ErrorMessage>{errorMessage}</ErrorMessage>
                  )}
                  {!searchIsLoading &&
                    !errorMessage &&
                    !searchResult?.result?.length &&
                    !!searchResult?.query &&
                    isOnline && (
                      <div className={classes.error}>No resources found</div>
                    )}
                  {!isOnline && (
                    <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>
                  )}
                  {!searchIsLoading && !!searchResult?.result?.length && (
                    <ul className={classes["search__models"]}>
                      {searchResultHtml}
                    </ul>
                  )}
                  {quickSerchResult.result.length >
                    SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE && (
                    <ButtonTertiary
                      type="button"
                      className={classes["btn-more"]}
                      onClick={submitSearchHandler}
                    >
                      Show more
                    </ButtonTertiary>
                  )}
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Search;
