import { useCallback, useEffect, useState } from "react";
import classes from "./SearchField.module.scss";
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
import firebaseApp from "../../../firebase-config";
import { clearFileExtension } from "../../../utils/generalUtils";
import { useNavigate } from "react-router-dom";
import { ReactComponent as SearchIcon } from "./../../../assets/search.svg";

const firestore = getFirestore(firebaseApp);
let searchTimeout;
const searchTimeoutMs = 1000;

const SearchField = ({ onSubmit, onChange }) => {
  const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);
  const [searchResultIsLoading, setSearchResultIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [categoriesSearchData, setCategoriesSearchData] = useState([]);
  const [subcategoriesSearchResult, setSubcategoriesSearchResult] = useState(
    []
  );
  const uid = useSelector((state) => state.auth.user.uid);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const searchInputHandler = (e) => {
    setSearchInput(e.target.value.trim());
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
    const subcats = categoriesSearchData.flatMap((category) => {
      const subcategory = category?.subcategories?.find((subcategory) => {
        return subcategory.name
          .toLowerCase()
          .includes(`${searchInput.toLowerCase()}`);
      });

      if (subcategory) {
        return {
          type: category.type,
          id: category.id,
          name: category.name,
          subId: subcategory.id,
          subName: subcategory.name,
        };
      }
      return [];
    });

    setSubcategoriesSearchResult(subcats);
  }, [categoriesSearchData, searchInput]);

  const liveSearch = useCallback(async () => {
    const collectionRef = collection(firestore, "users", uid, `preview`);
    const queryByName = query(
      collectionRef,
      or(
        // query as-is:
        and(
          where("name", ">=", searchInput),
          where("name", "<=", searchInput + "\uf8ff")
        ),
        // capitalize first letter:
        and(
          where(
            "name",
            ">=",
            searchInput.charAt(0).toUpperCase() + searchInput.slice(1)
          ),
          where(
            "name",
            "<=",
            searchInput.charAt(0).toUpperCase() +
              searchInput.slice(1) +
              "\uf8ff"
          )
        ),
        // lowercase:
        and(
          where("name", ">=", searchInput.toLowerCase()),
          where("name", "<=", searchInput.toLowerCase() + "\uf8ff")
        )
      ),
      limit(5)
    );
    const queryByOther = query(
      collectionRef,
      or(
        and(
          where("nameArr", "array-contains-any", [
            clearFileExtension(searchInput).toLowerCase(),
          ]),
          where("nsfw", "==", nsfwMode)
        ),
        and(
          where("fileNames", "array-contains-any", [
            clearFileExtension(searchInput).toLowerCase(),
          ]),
          where("nsfw", "==", nsfwMode)
        ),
        and(
          where("customFileNames", "array-contains-any", [
            clearFileExtension(searchInput).toLowerCase(),
          ]),
          where("nsfw", "==", nsfwMode)
        ),
        and(
          where("mainTags", "array-contains-any", [
            clearFileExtension(searchInput).toLowerCase(),
          ]),
          where("nsfw", "==", nsfwMode)
        )
      ),
      limit(3)
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
    const ids = allSearchResults.map(({ id }) => id);
    const filteredResult = allSearchResults.filter(
      ({ id }, index) => !ids.includes(id, index + 1)
    );

    setSearchResult(filteredResult);
  }, [nsfwMode, searchInput, uid]);

  useEffect(() => {
    if (uid && searchInput.length >= 3) {
      setSearchResultIsLoading(true);
      clearTimeout(searchTimeout);
      const getModelsPreview = async () => {
        await liveSearch();
        setSearchResultIsLoading(false);
      };

      searchTimeout = setTimeout(() => {
        getModelsPreview();
      }, searchTimeoutMs);

      subcategoriesSearch();
    } else {
      clearTimeout(searchTimeout);
      setSubcategoriesSearchResult([]);
      setSearchResult([]);
      setSearchResultIsLoading(false);
    }

    return () => {
      clearTimeout(searchTimeout);
    };
  }, [searchInput, nsfwMode, uid, liveSearch, subcategoriesSearch]);

  return (
    <div className={classes["search"]}>
      <form onSubmit={onSubmit} className={classes["search__field"]}>
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
    </div>
  );
};

export default SearchField;
