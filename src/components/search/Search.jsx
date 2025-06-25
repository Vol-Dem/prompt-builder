import { useCallback, useEffect, useRef, useState } from "react";
import classes from "./Search.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Image from "../ui/image/Image";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { tabActions } from "../../store/tabs";
import { ReactComponent as SearchIcon } from "./../../assets/search.svg";
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
import { imagesActions } from "../../store/images";
import { modelActions } from "../../store/model";

const searchTimeoutMs = 1000;

const Search = ({ className }) => {
  const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const searchInput = useSelector((state) => state.search.searchQuery);
  const [searchResult, setSearchResult] = useState({});
  const [categoriesSearchData, setCategoriesSearchData] = useState([]);
  const [subcategoriesSearchResult, setSubcategoriesSearchResult] = useState(
    []
  );
  const uid = useSelector((state) => state.auth.user.uid);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const collectionCategories = useSelector((state) => state.images.categories);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
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
    setShowMore(false);
    dispatch(searchActions.setSearchQuery(searchInputValue));
  };

  useEffect(() => {
    const categoriesArr = Object.keys(categories)?.flatMap((type) => {
      return categories[type]?.map((category) => {
        return {
          type: type,
          ...category,
        };
      });
    });

    const catCollArr = collectionCategories.map((category) => {
      return {
        type: "collection",
        ...category,
      };
    });

    setCategoriesSearchData([...categoriesArr, ...catCollArr]);
  }, [categories, collectionCategories]);

  useEffect(() => {
    if (
      quickSerchResult.result.length > SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE
    ) {
      const newResult = quickSerchResult.result.toSpliced(-1);
      setSearchResult({ ...quickSerchResult, result: newResult });
      setShowMore(true);
    } else {
      setSearchResult(quickSerchResult);
    }
  }, [quickSerchResult]);

  const subcategoriesSearch = useCallback(() => {
    let subcats = [];
    categoriesSearchData.forEach((category) => {
      const subcategories = category?.subcategories?.filter((subcategory) => {
        return subcategory.name
          .toLowerCase()
          .includes(`${searchInput.toLowerCase().trim()}`);
      });

      const subcategoriesData = subcategories.map((subcategory) => {
        return {
          type: category.type,
          id: category.id,
          name: category.name,
          subId: subcategory.id,
          subName: subcategory.name,
        };
      });
      subcats = [...subcats, ...subcategoriesData];
    });

    setSubcategoriesSearchResult(subcats);
  }, [categoriesSearchData, searchInput]);

  useEffect(() => {
    if (uid && searchInput.length >= 3 && isOnline) {
      if (
        location.pathname !== "/search" &&
        searchResult.query === searchInput.trim() &&
        searchResult.nsfw === nsfwMode
      )
        return;
      dispatch(searchActions.resetQuickSearchData());
      if (location.pathname === "/search") {
        dispatch(searchActions.resetSearchData());
      } else {
      }

      // setShowMore(false);
      dispatch(searchActions.setErrorMessage(""));
      clearTimeout(timeoutRef.current);
      const getModelsPreview = async () => {
        try {
          if (location.pathname !== "/search") {
            dispatch(
              liveSearch(
                searchInput.trim(),
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
                searchInput.trim(),
                nsfwMode,
                SETTINGS_SEARCH_RESULT_PER_PAGE
              )
            );
          }
        } catch (err) {
          dispatch(searchActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
          dispatch(searchActions.setSearchIsLoading(false));
        }
      };

      timeoutRef.current = setTimeout(() => {
        getModelsPreview();
      }, searchTimeoutMs);

      subcategoriesSearch();
    } else {
      clearTimeout(timeoutRef.current);
      setSubcategoriesSearchResult([]);
      dispatch(searchActions.setSearchIsLoading(false));
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [
    searchInput,
    nsfwMode,
    uid,
    subcategoriesSearch,
    dispatch,
    location?.pathname,
    searchResult?.query,
    searchResult?.nsfw,
    isOnline,
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

  const categoriesSearchResultHtml = subcategoriesSearchResult.map(
    (result, i) => {
      return (
        <motion.li
          key={i}
          initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          animate={ANIMATIONS_FM_SLIDEIN}
          exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
          className={classes["search__categories-item"]}
        >
          <span className={classes["search__type"]}>{result.type}</span>{" "}
          <Link
            to={result.type === "collection" ? "/images" : "/"}
            className={classes["search__text-link"]}
            onClick={() => {
              if (result.type === "collection") {
                dispatch(imagesActions.setActiveCategory(result.id));
                dispatch(imagesActions.setActiveSubcategory(""));
              } else {
                dispatch(tabActions.setCurrentTab(result.type));
                dispatch(tabActions.setCurrentCategory(result.id));
              }
              dispatch(searchActions.setSearchQuery(""));
              dispatch(searchActions.setSearchResult([]));
            }}
          >
            {result.name}
          </Link>{" "}
          -{" "}
          <Link
            to={result.type === "collection" ? "/images" : "/"}
            className={classes["search__text-link"]}
            onClick={() => {
              if (result.type === "collection") {
                dispatch(imagesActions.setActiveCategory(result.id));
                dispatch(imagesActions.setActiveSubcategory(result.subId));
              } else {
                dispatch(tabActions.setCurrentTab(result.type));
                dispatch(tabActions.setCurrentCategory(result.id));
                dispatch(tabActions.setCurrentSubcategory(result.subId));
              }
              dispatch(searchActions.setSearchQuery(""));
              dispatch(searchActions.setSearchResult([]));
              dispatch(modelActions.setActiveCarouselData({}));
            }}
          >
            {result.subName}
          </Link>
        </motion.li>
      );
    }
  );

  const submitSearchHandler = (e) => {
    e.preventDefault();
    dispatch(searchActions.resetSearchData());

    if (location.pathname !== "/search") {
      navigate("search");
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      dispatch(
        liveSearch(
          searchInput.trim(),
          nsfwMode,
          SETTINGS_SEARCH_RESULT_PER_PAGE
        )
      );
    }, searchTimeoutMs);
  };

  return (
    <div className={`${classes["search"]} ${className || ""}`}>
      <form onSubmit={submitSearchHandler} className={classes["search__field"]}>
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
          <SearchIcon />
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
                    setSearchResult({});
                    dispatch(searchActions.setSearchQuery(""));
                    setSearchResultIsOpen(false);
                  }}
                >
                  <span className={classes["search__cross"]}></span>
                </button>
              </div>
              <div className={classes["search__result"]}>
                {!!subcategoriesSearchResult.length && (
                  <ul className={classes["search__categories"]}>
                    {categoriesSearchResultHtml}
                  </ul>
                )}
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
                {showMore && (
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
  );
};

export default Search;
