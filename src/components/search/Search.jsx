import { useCallback, useEffect, useRef, useState } from "react";
import classes from "./Search.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Image from "../ui/image/Image";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { tabActions } from "../../store/tabs";
import { ReactComponent as SearchIcon } from "./../../assets/search.svg";
import { liveSearch, searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";
import ButtonAdd from "../ui/ButtonAdd";
import ErrorMessage from "../ui/ErrorMessage";
import ButtonTertiary from "../ui/ButtonTertiary";
import { useOnlineStatus } from "../../hooks/use-online-status";
import { OFFLINE_ERROR_MESSAGE } from "../../variables/constants";

const amountPerPage = 10;
const amountPerPageQuick = 4;
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

    setCategoriesSearchData(categoriesArr);
  }, [categories]);

  useEffect(() => {
    if (quickSerchResult.result.length > amountPerPageQuick) {
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
                amountPerPageQuick + 1,
                false,
                true
              )
            );
          } else {
            dispatch(searchActions.setIsLastPage(false));
            dispatch(searchActions.setIsLastSubPage(false));
            dispatch(liveSearch(searchInput.trim(), nsfwMode, amountPerPage));
          }
        } catch (err) {
          dispatch(searchActions.setErrorMessage(err.message));
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
      <li key={i} className={classes["search__item"]}>
        <NavLink
          to={`model/${modelPreveiw.id}`}
          className={classes["search__link"]}
          onClick={() => {
            dispatch(searchActions.setSearchQuery(""));
            dispatch(searchActions.setSearchResult([]));
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
            />
          </>
          <div className={classes["card__content"]}>
            <div>
              <span className={classes.type}>
                {modelPreveiw.type === "TextualInversion"
                  ? "Embedding"
                  : modelPreveiw.type}
              </span>
              <span className={classes.models}>{modelPreveiw.baseModel}</span>
            </div>

            <div className={classes["search__name"]}>{modelPreveiw.name}</div>
          </div>
        </NavLink>
        <ButtonAdd
          previewData={modelPreveiw}
          className={classes["search__add"]}
        />
      </li>
    );
  });

  const categoriesSearchResultHtml = subcategoriesSearchResult.map(
    (result, i) => {
      return (
        <li key={i} className={classes["search__categories-item"]}>
          <span className={classes["search__type"]}>{result.type}</span>{" "}
          <Link
            to="/"
            className={classes["search__text-link"]}
            onClick={() => {
              dispatch(tabActions.setCurrentTab(result.type));
              dispatch(tabActions.setCurrentCategory(result.id));
              dispatch(searchActions.setSearchQuery(""));
              dispatch(searchActions.setSearchResult([]));
            }}
          >
            {result.name}
          </Link>{" "}
          -{" "}
          <Link
            to="/"
            className={classes["search__text-link"]}
            onClick={() => {
              dispatch(tabActions.setCurrentTab(result.type));
              dispatch(tabActions.setCurrentCategory(result.id));
              dispatch(tabActions.setCurrentSubcategory(result.subId));
              dispatch(searchActions.setSearchQuery(""));
              dispatch(searchActions.setSearchResult([]));
            }}
          >
            {result.subName}
          </Link>
        </li>
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
      dispatch(liveSearch(searchInput.trim(), nsfwMode, amountPerPage));
    }, searchTimeoutMs);
  };

  return (
    <div className={`${classes["search"]} ${className || ""}`}>
      <form onSubmit={submitSearchHandler} className={classes["search__field"]}>
        <input
          type="search"
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
      {searchInput.length >= 3 &&
        searchResultIsOpen &&
        location.pathname !== "/search" && (
          <div className={classes["search__dropdown"]}>
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
                <ErrorMessage>{OFFLINE_ERROR_MESSAGE}</ErrorMessage>
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
          </div>
        )}
    </div>
  );
};

export default Search;
