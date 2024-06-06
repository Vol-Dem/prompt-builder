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

let lastVisible = {};
let lastVisibleSub = {};

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
      console.log("SEATCH RESET FUNC");
      state.searchResult = { query: "", result: [], nsfw: false };
      // state.quickSerchResult = { query: "", result: [], nsfw: false };
      state.errorMessage = "";
      state.isLastPage = false;
      state.isLastSubPage = false;
    },
    resetQuickSearchData(state) {
      console.log("SEATCH RESET FUNC");
      // state.searchResult = { query: "", result: [], nsfw: false };
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
  limitAmount = 3,
  loadMore = false,
  quickSerch = false
) => {
  return async (dispatch, getState) => {
    try {
      if (!loadMore) {
        lastVisible = {};
        lastVisibleSub = {};
        dispatch(
          searchActions.setSearchResult({
            query: "",
            nsfw: false,
            result: [],
          })
        );
      }
      console.log("FETCH");
      const isLastPage = getState().search.isLastPage;
      const isLastSubPage = getState().search.isLastSubPage;
      const searchResult = getState().search.searchResult;
      if (isLastPage && isLastSubPage) return;

      dispatch(searchActions.setSearchIsLoading(true));
      // const searchString = searchInput.trim();
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
        )
        // and(where("fileNames", "array-contains-any", [searchString]))
      );

      const queryByName = query(
        collectionRef,
        queryRule,
        // where("fileNames", "array-contains-any", [searchString])
        //   where("nsfw", "==", nsfwMode),
        orderBy("name", "desc"),
        startAfter(lastVisible),
        limit(limitAmount)
      );

      const queryRuleSub = or(
        and(
          where("nameArr", "array-contains-any", [
            clearFileExtension(searchString).toLowerCase(),
          ]),
          where("nsfw", "in", nsfwFilter)
        ),
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
        )
      );

      const querySub = query(
        collectionRef,
        queryRuleSub,
        // where("fileNames", "array-contains-any", [searchString])

        //   where("nsfw", "==", nsfwMode),
        //   where("main", "==", activeCategory),
        //   where("fileNames", "array-contains-any", [searchString]),
        // orderBy("name", "desc")
        orderBy("name", "desc"),
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

      if (!isLastSubPage) {
        querySnapshotSub = await getDocs(querySub);
        modelsDataSub = querySnapshotSub.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return doc.data();
        });
      }

      console.log(modelsDataName);
      console.log(modelsDataSub);

      const isLast =
        !querySnapshot?.docs?.length || querySnapshot.docs.length < limitAmount;
      const isLastSub =
        !querySnapshotSub?.docs?.length ||
        querySnapshotSub.docs.length < limitAmount;
      // console.log(isLast);

      if (!isLast) {
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      }
      if (!isLastSub) {
        lastVisibleSub =
          querySnapshotSub.docs[querySnapshotSub.docs.length - 1];
      }

      const newSearchResults = [...modelsDataName, ...modelsDataSub];

      // console.log(newSearchResults);

      // let ids = [];

      // if (!loadMore) {
      //   ids = newSearchResults.map(({ id }) => id);
      // } else {
      //   ids = searchResult?.result.map(({ id }) => id);
      // }

      // const filteredNewResult = newSearchResults.filter(
      //   ({ id }, index) => !ids.includes(id, index + 1)
      // );

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

      // setSearchResult(filteredResult);
      // dispatch(searchActions.setSearchResult(filteredResult));
      // return { query: searchString, nsfw, result: filteredResult };
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
      console.log(err);
    }
  };
};

export const searchActions = searchSlice.actions;

export default searchSlice;
