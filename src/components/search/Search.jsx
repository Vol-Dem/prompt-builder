import { useCallback, useEffect, useState } from "react";
// import Input from "../ui/Input";
import classes from "./Search.module.scss";
import {
  and,
  collection,
  getDocs,
  getFirestore,
  limit,
  or,
  query,
  where,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import firebaseApp from "../../firebase-config";
import { clearFileExtension } from "../../utils/generalUtils";
import Image from "../ui/image/Image";
import {
  Link,
  NavLink,
  // matchRoutes,
  useLocation,
  // useMatches,
  useNavigate,
} from "react-router-dom";
import { getModelsPreview, tabActions } from "../../store/tabs";
import { addModelToPanel } from "../../store/usedModels";
import { ReactComponent as SearchIcon } from "./../../assets/search.svg";
import { searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";
import ButtonAdd from "../ui/ButtonAdd";

const firestore = getFirestore(firebaseApp);
let searchTimeout;
const amountPerPage = 10;
const searchTimeoutMs = 1000;
// const routes = [{ path: "/search" }];

const Search = () => {
  const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [searchResultIsLoading, setSearchResultIsLoading] = useState(false);
  // const [searchInput, setSearchInput] = useState("");
  const searchInput = useSelector((state) => state.search.searchQuery);
  const [searchResult, setSearchResult] = useState([]);
  const [categoriesSearchData, setCategoriesSearchData] = useState([]);
  const [subcategoriesSearchResult, setSubcategoriesSearchResult] = useState(
    []
  );
  const uid = useSelector((state) => state.auth.user.uid);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  //   const matches = useMatches();
  //   const [{ route }] = matchRoutes(routes, location);

  const searchInputHandler = (e) => {
    const searchInputValue = e.target.value;
    // setSearchInput(searchInputValue);
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

  const subcategoriesSearch = useCallback(() => {
    console.log(categoriesSearchData);
    let subcats = [];
    categoriesSearchData.forEach((category) => {
      //   console.log(category);
      const subcategories = category?.subcategories?.filter((subcategory) => {
        return subcategory.name
          .toLowerCase()
          .includes(`${searchInput.toLowerCase().trim()}`);
      });
      // console.log(subcategory);
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
      // return [];
    });
    console.log(subcats);
    setSubcategoriesSearchResult(subcats);
  }, [categoriesSearchData, searchInput]);

  const liveSearch = useCallback(
    async (limitAmount = 3) => {
      const searchString = searchInput.trim();
      const collectionRef = collection(firestore, "users", uid, `preview`);
      const queryByName = query(
        collectionRef,
        or(
          // query as-is:
          and(
            where("name", ">=", searchString),
            where("name", "<=", searchString + "\uf8ff")
          ),
          // capitalize first letter:
          and(
            where(
              "name",
              ">=",
              searchString.charAt(0).toUpperCase() + searchString.slice(1)
            ),
            where(
              "name",
              "<=",
              searchString.charAt(0).toUpperCase() +
                searchString.slice(1) +
                "\uf8ff"
            )
          ),
          // lowercase:
          and(
            where("name", ">=", searchString.toLowerCase()),
            where("name", "<=", searchString.toLowerCase() + "\uf8ff")
          )
          // and(where("fileNames", "array-contains-any", [searchString]))
        ),
        // where("fileNames", "array-contains-any", [searchString])
        //   where("nsfw", "==", nsfwMode),
        limit(limitAmount)
      );
      let queryRule;

      if (!nsfwMode) {
        queryRule = or(
          and(
            where("nameArr", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ]),
            where("nsfw", "==", false)
          ),
          and(
            where("fileNames", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ]),
            where("nsfw", "==", false)
          ),
          and(
            where("customFileNames", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ]),
            where("nsfw", "==", false)
          ),
          and(
            where("mainTags", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ]),
            where("nsfw", "==", false)
          ),
          and(
            where("versionIds", "array-contains-any", [+searchString]),
            where("nsfw", "==", false)
          )
        );
      } else {
        queryRule = or(
          and(
            where("nameArr", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ])
          ),
          and(
            where("fileNames", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ])
          ),
          and(
            where("customFileNames", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ])
          ),
          and(
            where("mainTags", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ])
          ),
          and(where("versionIds", "array-contains-any", [+searchString]))
        );
      }
      const queryByOther = query(
        collectionRef,
        queryRule,
        // where("fileNames", "array-contains-any", [searchString])

        //   where("nsfw", "==", nsfwMode),
        //   where("main", "==", activeCategory),
        //   where("fileNames", "array-contains-any", [searchString]),
        // orderBy("id", "desc")
        limit(limitAmount)
      );
      const querySnapshot = await getDocs(queryByName);
      const querySnapshotOther = await getDocs(queryByOther);
      const modelsDataName = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data();
      });
      const modelsDataOther = querySnapshotOther.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data();
      });

      const allSearchResults = [...modelsDataName, ...modelsDataOther];
      console.log(allSearchResults);

      const ids = allSearchResults.map(({ id }) => id);
      const filteredResult = allSearchResults.filter(
        ({ id }, index) => !ids.includes(id, index + 1)
      );

      // setSearchResult(filteredResult);
      // dispatch(searchActions.setSearchResult(filteredResult));
      return filteredResult;
    },
    [nsfwMode, searchInput, uid]
  );

  useEffect(() => {
    // console.log(location);
    if (uid && searchInput.length >= 3) {
      dispatch(searchActions.setSearchIsLoading(true));
      dispatch(searchActions.setErrorMessage(""));
      clearTimeout(searchTimeout);
      const getModelsPreview = async () => {
        let result = [];
        try {
          if (location.pathname !== "/search") {
            result = await liveSearch();
            setSearchResult(result);
          } else {
            result = await liveSearch(amountPerPage);
            dispatch(searchActions.setSearchResult(result));
          }
          if (!result.length) {
            throw new Error("No resources found");
          }
          dispatch(searchActions.setSearchIsLoading(false));
        } catch (err) {
          // setErrorMessage(err.message);
          dispatch(searchActions.setErrorMessage(err.message));
          dispatch(searchActions.setSearchIsLoading(false));
        }
      };

      searchTimeout = setTimeout(() => {
        getModelsPreview();
      }, searchTimeoutMs);

      subcategoriesSearch();
    } else {
      clearTimeout(searchTimeout);
      setSubcategoriesSearchResult([]);
      setSearchResult([]);
      dispatch(searchActions.setSearchIsLoading(false));
    }

    return () => {
      clearTimeout(searchTimeout);
    };
  }, [
    searchInput,
    nsfwMode,
    uid,
    liveSearch,
    subcategoriesSearch,
    dispatch,
    location.pathname,
  ]);

  const addToSidePanelHandler = (e) => {
    const previewData = searchResult.find(
      (prev) => +prev.id === +e.target.dataset.id
    );
    let curVersionData =
      previewData?.modelVersionsCustomData &&
      Object.values(previewData.modelVersionsCustomData)
        .filter((data) => data.downloadStatus)
        .toSorted((a, b) => b.versionId - a.versionId)[0];

    const sidePanelData = {
      id: previewData?.id,
      src: previewData?.src,
      main: previewData?.main,
      sub: previewData?.sub,
      title: previewData?.name || previewData.title,
      versionName: curVersionData?.name,
      imgUrl: previewData?.imgUrl,
      nsfwPreviewImgUrl: previewData?.nsfwPreviewImgUrl,
      type: previewData?.modelType,
      baseModel: curVersionData?.baseModel || previewData?.baseModel,
      mainTag: curVersionData?.mainTag || previewData?.mainTag,
      weight: curVersionData?.weight || previewData?.weight,
      minWeight: curVersionData?.minWeight || previewData?.minWeight,
      maxWeight: curVersionData?.maxWeight || previewData?.maxWeight,
      size: curVersionData?.size || previewData?.size,
      tags: curVersionData?.trainedWords || curVersionData?.trainedWords,
      helperTags: curVersionData?.helperTags || previewData?.helperTags,
      updatedAt: previewData?.updatedAt,
    };
    dispatch(addModelToPanel(sidePanelData));
  };

  const searchResultHtml = searchResult?.map((modelPreveiw, i) => {
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
          <div
            className={classes["search__name"]}
            // href={`/model/${modelPreveiw.id}`}
            // target="blank"
          >
            {modelPreveiw.name}
          </div>
        </NavLink>
        {/* <span
          className={classes["search__add"]}
          data-id={modelPreveiw.id}
          onClick={addToSidePanelHandler}
        >
          +
        </span> */}
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
              dispatch(getModelsPreview());
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
    dispatch(searchActions.setSearchIsLoading(true));
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      if (location.pathname !== "/search") {
        navigate("search");
      }
      const result = await liveSearch(amountPerPage);
      dispatch(searchActions.setSearchResult(result));
      dispatch(searchActions.setSearchIsLoading(false));
      console.log(searchInput);
    }, searchTimeoutMs);
  };

  return (
    <div className={classes["search"]}>
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
                <div className={classes.error}>{errorMessage}</div>
              )}
              {!searchIsLoading && !!searchResult.length && (
                <ul className={classes["search__models"]}>
                  {searchResultHtml}
                </ul>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default Search;
