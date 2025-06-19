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
let lastVisibleCollection = "";
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
    isLastCollectionsPage: false,
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
    setIsLastCollectionsPage(state, actions) {
      state.isLastCollectionsPage = actions.payload;
    },
    setIsLastSubPage(state, actions) {
      state.isLastSubPage = actions.payload;
    },
    resetSearchData(state) {
      state.searchResult = { query: "", result: [], nsfw: false };
      state.errorMessage = "";
      state.isLastPage = false;
      state.isLastCollectionsPage = false;
      state.isLastSubPage = false;
    },
    resetQuickSearchData(state) {
      state.quickSerchResult = { query: "", result: [], nsfw: false };
      state.errorMessage = "";
      state.isLastPage = false;
      state.isLastCollectionsPage = false;
      state.isLastSubPage = false;
    },
  },
});

export const liveSearch = (
  searchString,
  nsfw,
  limitAmount = 5,
  loadMore = false,
  quickSerch = false,
  hashtag = false
) => {
  return async (dispatch, getState) => {
    try {
      const isLastPage = getState().search.isLastPage;
      const isLastCollectionsPage = getState().search.isLastCollectionsPage;
      const isLastSubPage = getState().search.isLastSubPage;
      const searchResult = getState().search.searchResult;
      if (isLastPage && isLastSubPage && isLastCollectionsPage) return;

      if (!loadMore) {
        lastVisible = "";
        lastVisibleCollection = "";
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
      const modelPreviewRef = collection(firestore, "users", uid, `preview`);
      const collectionPreviewRef = collection(
        firestore,
        "users",
        uid,
        `collectionPreviews`
      );

      const nsfwFilter = !nsfw ? [false] : [true, false];

      const capitalized = searchString
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      // console.log(capitalized);

      const queryByNameRule = or(
        // query as-is:
        and(
          where("name", ">=", searchString),
          where("name", "<=", searchString + "\uf8ff"),
          where("nsfw", "in", nsfwFilter)
        ),
        //by id
        and(where("id", "==", +searchString)),
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
        // capitalize all:
        and(
          where("name", ">=", capitalized),
          where("name", "<=", capitalized + "\uf8ff"),
          where("nsfw", "in", nsfwFilter)
        ),
        // caps:
        and(
          where("name", ">=", searchString.toUpperCase()),
          where("name", "<=", searchString.toUpperCase() + "\uf8ff"),
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

      const queryModelsByName = query(
        modelPreviewRef,
        queryByNameRule,
        orderBy("name", "asc"),
        startAfter(lastVisible),
        limit(limitAmount)
      );

      const queryCollectionsByName = query(
        collectionPreviewRef,
        queryByNameRule,
        orderBy("name", "asc"),
        startAfter(lastVisibleCollection),
        limit(limitAmount)
      );

      let queryRuleSub;

      if (hashtag) {
        queryRuleSub = and(
          where("authorTags", "array-contains-any", [searchString]),
          where("nsfw", "in", nsfwFilter)
        );
      } else {
        queryRuleSub = or(
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
          ),
          and(
            where("authorTags", "array-contains-any", [
              searchString.toLowerCase(),
            ]),
            where("nsfw", "in", nsfwFilter)
          )
        );
      }

      const querySub = query(
        modelPreviewRef,
        queryRuleSub,
        orderBy("name", "asc"),
        startAfter(lastVisibleSub),
        limit(limitAmount)
      );

      let modelsDataName = [];
      let collectionsDataNames = [];
      let querySnapshot = {};
      let queryCollectionsSnapshot = {};

      if (!isLastPage && !hashtag) {
        querySnapshot = await getDocs(queryModelsByName);
        modelsDataName = querySnapshot.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return doc.data();
        });
      }

      if (!isLastCollectionsPage) {
        queryCollectionsSnapshot = await getDocs(queryCollectionsByName);
        collectionsDataNames = queryCollectionsSnapshot.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return { type: "collection", ...doc.data() };
        });
      }

      let modelsDataSub = [];
      let querySnapshotSub = {};

      const isLast =
        !querySnapshot?.docs?.length || querySnapshot.docs.length < limitAmount;
      const isLastCollection =
        !queryCollectionsSnapshot?.docs?.length ||
        queryCollectionsSnapshot.docs.length < limitAmount;

      if ((isLast || hashtag) && !isLastSubPage) {
        querySnapshotSub = await getDocs(querySub);
        modelsDataSub = querySnapshotSub.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return doc.data();
        });
      }

      const isLastSub =
        isLast &&
        (!querySnapshotSub?.docs?.length ||
          querySnapshotSub?.docs?.length < limitAmount);

      if (!isLast) {
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      }
      if (!isLastCollection) {
        lastVisibleCollection =
          queryCollectionsSnapshot.docs[
            queryCollectionsSnapshot.docs.length - 1
          ];
      }
      if (isLast && !isLastSub) {
        lastVisibleSub =
          querySnapshotSub.docs[querySnapshotSub.docs.length - 1];
      }

      const newModelsSearchResults = [...modelsDataName, ...modelsDataSub];
      const newModelsIds = newModelsSearchResults.map(({ id }) => id);
      const ids = searchResult?.result?.map(({ id }) => id);
      const filteredNewResult = newModelsSearchResults.filter(
        ({ id }, index) => !newModelsIds.includes(id, index + 1)
      );
      const filteredResult = filteredNewResult.filter(
        ({ id }) => !ids?.includes(id)
      );

      let finalResult = [];
      if (loadMore) {
        finalResult = [...searchResult?.result, ...filteredResult];
      } else {
        finalResult = filteredNewResult;
      }

      if (collectionsDataNames?.length) {
        finalResult = [...finalResult, ...collectionsDataNames];
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
            hashtag,
          })
        );
        dispatch(searchActions.setIsLastPage(isLast));
        dispatch(searchActions.setIsLastCollectionsPage(isLastCollection));
        dispatch(searchActions.setIsLastSubPage(isLastSub));
      }
    } catch (err) {
      console.error(err);
      console.error(err.message);
    } finally {
      dispatch(searchActions.setSearchIsLoading(false));
    }
  };
};

export const searchActions = searchSlice.actions;

export default searchSlice;
