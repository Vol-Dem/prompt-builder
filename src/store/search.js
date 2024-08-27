import { createSlice } from "@reduxjs/toolkit";
import {
  and,
  collection,
  getDocs,
  getFirestore,
  limit,
  or,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { clearFileExtension } from "../utils/generalUtils";
import firebaseApp from "../firebase-config";

const firestore = getFirestore(firebaseApp);

let lastVisible = "";
let lastVisibleSub = "";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchQuery: "",
    searchResult: { query: "", result: [], nsfw: false },
    quickSerchResult: { query: "", result: [], nsfw: false },
    isLoading: false,
    errorMessage: "",
    isLastPage: false,
    isLastSubPage: false,
  },
  reducers: {
    setSearchQuery(state, actions) {
      state.searchQuery = actions.payload;
    },
    setSearchResult(state, actions) {
      state.searchResult = actions.payload;
    },
    setQuickSearchResult(state, actions) {
      state.quickSerchResult = actions.payload;
    },
    updateSearchResult(state, actions) {
      state.searchResult = [...state.searchResult, ...actions.payload];
    },
    clearSearchResult(state, actions) {
      state.searchResult = [];
    },
    setSearchIsLoading(state, actions) {
      state.isLoading = actions.payload;
    },
    setErrorMessage(state, actions) {
      state.errorMessage = actions.payload;
    },
    setIsLastPage(state, actions) {
      state.isLastPage = actions.payload;
    },
    setIsLastSubPage(state, actions) {
      state.isLastSubPage = actions.payload;
    },
    resetSearchData(state) {
      state.searchResult = { query: "", result: [], nsfw: false };
      state.errorMessage = "";
      state.isLastPage = false;
      state.isLastSubPage = false;
    },
    resetQuickSearchData(state) {
      state.quickSerchResult = { query: "", result: [], nsfw: false };
      state.errorMessage = "";
      state.isLastPage = false;
      state.isLastSubPage = false;
    },
  },
});

export const liveSearch = (
  searchString,
  nsfw,
  limitAmount = 5,
  loadMore = false,
  quickSerch = false
) => {
  return async (dispatch, getState) => {
    try {
      const isLastPage = getState().search.isLastPage;
      const isLastSubPage = getState().search.isLastSubPage;
      const searchResult = getState().search.searchResult;
      if (isLastPage && isLastSubPage) return;

      if (!loadMore) {
        lastVisible = "";
        lastVisibleSub = "";
        dispatch(
          searchActions.setSearchResult({
            query: "",
            nsfw: false,
            result: [],
          })
        );
      }

      dispatch(searchActions.setSearchIsLoading(true));
      const uid = getState().auth.user.uid;
      const collectionRef = collection(firestore, "users", uid, `preview`);
      const nsfwFilter = !nsfw ? [false] : [true, false];

      const queryRule = or(
        // query as-is:
        and(
          where("name", ">=", searchString),
          where("name", "<=", searchString + "\uf8ff"),
          where("nsfw", "in", nsfwFilter)
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
          ),
          where("nsfw", "in", nsfwFilter)
        ),
        // lowercase:
        and(
          where("name", ">=", searchString.toLowerCase()),
          where("name", "<=", searchString.toLowerCase() + "\uf8ff"),
          where("nsfw", "in", nsfwFilter)
        ),
        and(
          where("nameArr", "array-contains-any", [
            clearFileExtension(searchString).toLowerCase(),
          ]),
          where("nsfw", "in", nsfwFilter)
        )
      );

      const queryByName = query(
        collectionRef,
        queryRule,
        orderBy("name", "asc"),
        startAfter(lastVisible),
        limit(limitAmount)
      );

      const queryRuleSub = or(
        and(
          where("fileNames", "array-contains-any", [
            clearFileExtension(searchString).toLowerCase(),
          ]),
          where("nsfw", "in", nsfwFilter)
        ),
        and(
          where("customFileNames", "array-contains-any", [
            clearFileExtension(searchString).toLowerCase(),
          ]),
          where("nsfw", "in", nsfwFilter)
        ),
        and(
          where("mainTags", "array-contains-any", [
            clearFileExtension(searchString).toLowerCase(),
          ]),
          where("nsfw", "in", nsfwFilter)
        ),
        and(
          where("versionIds", "array-contains-any", [+searchString]),
          where("nsfw", "in", nsfwFilter)
        ),
        and(
          where("authorTags", "array-contains-any", [searchString]),
          where("nsfw", "in", nsfwFilter)
        )
      );

      const querySub = query(
        collectionRef,
        queryRuleSub,
        orderBy("name", "asc"),
        startAfter(lastVisibleSub),
        limit(limitAmount)
      );

      let modelsDataName = [];
      let querySnapshot = {};

      if (!isLastPage) {
        querySnapshot = await getDocs(queryByName);
        modelsDataName = querySnapshot.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return doc.data();
        });
      }

      let modelsDataSub = [];
      let querySnapshotSub = {};

      if (
        (isLastPage || querySnapshot.docs.length < limitAmount) &&
        !isLastSubPage
      ) {
        querySnapshotSub = await getDocs(querySub);
        modelsDataSub = querySnapshotSub.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return doc.data();
        });
      }

      const isLast =
        !querySnapshot?.docs?.length || querySnapshot.docs.length < limitAmount;
      const isLastSub =
        isLast &&
        (!querySnapshotSub?.docs?.length ||
          querySnapshotSub?.docs?.length < limitAmount);

      if (!isLast) {
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      }
      if (isLast && !isLastSub) {
        lastVisibleSub =
          querySnapshotSub.docs[querySnapshotSub.docs.length - 1];
      }

      const newSearchResults = [...modelsDataName, ...modelsDataSub];
      const newIds = newSearchResults.map(({ id }) => id);
      const ids = searchResult?.result.map(({ id }) => id);
      const filteredNewResult = newSearchResults.filter(
        ({ id }, index) => !newIds.includes(id, index + 1)
      );
      const filteredResult = filteredNewResult.filter(
        ({ id }) => !ids.includes(id)
      );

      let finalResult = [];
      if (loadMore) {
        finalResult = [...searchResult?.result, ...filteredResult];
      } else {
        finalResult = filteredNewResult;
      }

      if (quickSerch) {
        dispatch(
          searchActions.setQuickSearchResult({
            query: searchString,
            nsfw,
            result: finalResult,
          })
        );
      } else {
        dispatch(
          searchActions.setSearchResult({
            query: searchString,
            nsfw,
            result: finalResult,
          })
        );
        dispatch(searchActions.setIsLastPage(isLast));
        dispatch(searchActions.setIsLastSubPage(isLastSub));
      }
      dispatch(searchActions.setSearchIsLoading(false));
    } catch (err) {
      console.error(err.message);
    }
  };
};

export const searchActions = searchSlice.actions;

export default searchSlice;
