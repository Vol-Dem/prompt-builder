import { createSlice, type Draft, type PayloadAction } from "@reduxjs/toolkit";
import {
  and,
  collection,
  getDocs,
  getFirestore,
  limit,
  or,
  orderBy,
  query,
  QueryCompositeFilterConstraint,
  QueryDocumentSnapshot,
  QueryFieldFilterConstraint,
  QuerySnapshot,
  startAfter,
  where,
  type DocumentData,
} from "firebase/firestore";

import firebaseApp from "../firebase-config";
import { clearFileExtension } from "../../shared/utils";
import type {
  CivitaiModelDoc,
  CollectionPreviewDoc,
  ModelPreviewDoc,
} from "../../shared/types/firestore";
import type { AppThunk } from "./store";
import { AppError, handleErrors, normalizeError } from "../utils/generalUtils";
import type {
  QuickSearchResult,
  SearchFilter,
  SearchResult,
  SearchResultCollection,
  SearchResultData,
  SearchSrcType,
  SearchState,
} from "../types/search.types";
import { fetchData } from "../utils/fetch/fetchUtils";
import type { CivitaiFetchResult } from "../../shared/types/api";
import { ERROR_MESSAGE_CIV_CONNECTION } from "../variables/constants";
import { createCivitaiSearchUrl } from "../utils/searchUtils";
import { createModelPreviewData } from "../utils/modelUtils";

const firestore = getFirestore(firebaseApp);

let lastVisible: QueryDocumentSnapshot | string = "";
let lastVisibleCollection: QueryDocumentSnapshot | string = "";
let lastVisibleSub: QueryDocumentSnapshot | string = "";
// let currCursor: string | null = "";
let nextCursor: string | null = "";

/**
 * Search state.
 *
 * Controls:
 * - Search
 *
 * State:
 * @property {string} searchQuery - Search query.
 * @property {{query: string, result: Array<Object>, nsfw: boolean, hashtag: boolean, filter: Object}} searchResult - Search result with active filter info.
 * @property {{query: string, result: Array<Object>, nsfw: boolean}} quickSearchResult - Quick search result with active filter info.
 * @property {{ modelType: Array<string>, baseModel: Array<string>, hashtag: boolean }} searchFilter - Search filter.
 * @property {boolean} isLoading - Search loading state.
 * @property {string} errorMessage - Search error message.
 * @property {boolean} isLastPage - Whether the last page of name-based search results is reached.
 * @property {boolean} isLastCollectionsPage - Whether the last page of collection search results is reached.
 * @property {boolean} isLastSubPage - Whether the last page of secondary-field search results is reached.
 */
const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchQuery: "",
    src: "aitools",
    searchResult: {
      query: "",
      src: null,
      result: [],
      nsfw: false,
      hashtag: false,
      filter: null,
    },
    quickSearchResult: { query: "", src: null, result: [], nsfw: false },
    searchFilter: { src: null, modelType: [], baseModel: [], hashtag: false },
    isLoading: false,
    errorMessage: "",
    isLastPage: false,
    isLastCollectionsPage: false,
    isLastSubPage: false,
  } as SearchState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSearchSrc(state, action: PayloadAction<SearchSrcType>) {
      state.src = action.payload;
    },
    setSearchResult(state, action: PayloadAction<SearchResultData>) {
      state.searchResult = action.payload;
    },
    setQuickSearchResult(state, action: PayloadAction<QuickSearchResult>) {
      state.quickSearchResult = action.payload;
    },
    clearSearchResult(state) {
      state.searchResult = {
        query: "",
        src: null,
        result: [],
        nsfw: false,
        hashtag: false,
        filter: null,
      };
    },
    setSearchIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setErrorMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
    },
    setIsLastPage(state, action: PayloadAction<boolean>) {
      state.isLastPage = action.payload;
    },
    setIsLastCollectionsPage(state, action: PayloadAction<boolean>) {
      state.isLastCollectionsPage = action.payload;
    },
    setIsLastSubPage(state, action: PayloadAction<boolean>) {
      state.isLastSubPage = action.payload;
    },
    setSearchFilter<K extends keyof SearchFilter>(
      state: Draft<SearchState>,
      action: PayloadAction<{ type: K; value: SearchFilter[K] }>,
    ) {
      state.searchFilter[action.payload.type] = action.payload.value;
    },
    resetSearchFilter(state) {
      state.searchFilter = {
        src: null,
        modelType: [],
        baseModel: [],
        hashtag: false,
      };
    },
    resetSearchData(state) {
      state.searchResult = {
        query: "",
        src: null,
        result: [],
        nsfw: false,
        hashtag: false,
        filter: null,
      };
      state.errorMessage = "";
      state.isLastPage = false;
      state.isLastCollectionsPage = false;
      state.isLastSubPage = false;
    },
    resetQuickSearchData(state) {
      state.quickSearchResult = {
        query: "",
        src: null,
        result: [],
        nsfw: false,
      };
      state.errorMessage = "";
    },
    resetAllLastPageStatus(state) {
      state.isLastPage = false;
      state.isLastCollectionsPage = false;
      state.isLastSubPage = false;
    },
  },
});

/**
 * Creates firestore query filter.
 * Generates case-insensitive and ID-aware Firestore search rules.
 *
 * @param {string} searchString - Search query.
 * @param {boolean} nsfwFilter - Whether to include NSFW models and collections.
 * @param {Array} optionalWhere - Optional filters.
 * @returns {QueryCompositeFilterConstraint} Firestore query constraint.
 */
const createNameQuery = (
  searchString: string,
  nsfwFilter: boolean[],
  optionalWhere: QueryFieldFilterConstraint[] = [],
): QueryCompositeFilterConstraint => {
  const capitalized = searchString
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return or(
    // query as-is:
    and(
      ...optionalWhere,
      where("name", ">=", searchString),
      where("name", "<=", searchString + "\uf8ff"),
      where("nsfw", "in", nsfwFilter),
    ),
    //by id
    and(...optionalWhere, where("id", "==", +searchString)),
    // capitalize first letter:
    and(
      ...optionalWhere,
      where(
        "name",
        ">=",
        searchString.charAt(0).toUpperCase() + searchString.slice(1),
      ),
      where(
        "name",
        "<=",
        searchString.charAt(0).toUpperCase() + searchString.slice(1) + "\uf8ff",
      ),
      where("nsfw", "in", nsfwFilter),
    ),
    // capitalize all:
    and(
      ...optionalWhere,
      where("name", ">=", capitalized),
      where("name", "<=", capitalized + "\uf8ff"),
      where("nsfw", "in", nsfwFilter),
    ),
    // caps:
    and(
      ...optionalWhere,
      where("name", ">=", searchString.toUpperCase()),
      where("name", "<=", searchString.toUpperCase() + "\uf8ff"),
      where("nsfw", "in", nsfwFilter),
    ),
    // lowercase:
    and(
      ...optionalWhere,
      where("name", ">=", searchString.toLowerCase()),
      where("name", "<=", searchString.toLowerCase() + "\uf8ff"),
      where("nsfw", "in", nsfwFilter),
    ),
    and(
      ...optionalWhere,
      where("nameArr", "array-contains-any", [
        clearFileExtension(searchString).toLowerCase(),
      ]),
      where("nsfw", "in", nsfwFilter),
    ),
  );
};

/**
 * Searches for model and collection previews.
 *
 * Side effects:
 * - Fetches model previews from Firestore
 * - Optionally merges with already loaded previews
 *
 * @param {string} searchString - Search query.
 * @param {boolean} nsfw - Whether to include NSFW models and collections.
 * @param {number} [limitAmount=5] - Results per request.
 * @param {boolean} [loadMore=false] - Whether to append to existing previews instead of replacing them.
 * @param {boolean} [quickSerch=false] - Whether to perform a quick search (limited result set).
 * @param {boolean} [isHashtag=false] - Whether to search only by hashtags.
 * @param {Object} [filter] - Optional filter data.
 * @returns {Function} Redux thunk.
 */
export const liveSearch = (
  searchString: string,
  nsfw: boolean,
  limitAmount: number = 5,
  loadMore: boolean = false,
  quickSerch: boolean = false,
  isHashtag: boolean = false,
  filter?: SearchFilter,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(searchActions.setSearchIsLoading(true));
      const hashtag = isHashtag || !!filter?.hashtag;
      const isLastPage = getState().search.isLastPage;
      const isLastCollectionsPage = getState().search.isLastCollectionsPage;
      const isLastSubPage = getState().search.isLastSubPage;
      const searchResult = getState().search.searchResult;

      if (isLastPage && isLastSubPage && isLastCollectionsPage) return;
      if (!searchString) return;

      if (!loadMore) {
        lastVisible = "";
        lastVisibleCollection = "";
        lastVisibleSub = "";
        dispatch(searchActions.clearSearchResult());
      }

      dispatch(searchActions.setSearchIsLoading(true));
      const uid = getState().auth.user.uid;
      const modelPreviewRef = collection(firestore, "users", uid, `preview`);
      const collectionPreviewRef = collection(
        firestore,
        "users",
        uid,
        `collectionPreviews`,
      );

      const nsfwFilter = !nsfw ? [false] : [true, false];

      const onlyCollections =
        filter?.modelType.length === 1 &&
        filter?.modelType.includes("collection");

      const optionalWhere = [];

      if (filter?.modelType?.length && !onlyCollections) {
        optionalWhere.push(where("modelType", "in", filter.modelType));
      }
      if (filter?.baseModel?.length && !onlyCollections) {
        optionalWhere.push(where("baseModel", "in", filter.baseModel));
      }

      const modelQueryByNameRule = createNameQuery(
        searchString,
        nsfwFilter,
        optionalWhere,
      );
      const collectionQueryByNameRule = createNameQuery(
        searchString,
        nsfwFilter,
      );

      const queryModelsByName = query(
        modelPreviewRef,
        modelQueryByNameRule,
        orderBy("name", "asc"),
        startAfter(lastVisible),
        limit(limitAmount),
      );

      const queryCollectionsByName = query(
        collectionPreviewRef,
        collectionQueryByNameRule,
        orderBy("name", "asc"),
        startAfter(lastVisibleCollection),
        limit(limitAmount),
      );

      let queryRuleSub: QueryCompositeFilterConstraint;

      const hashlessSearchString =
        searchString.trim()[0] === "#" ? searchString.slice(1) : searchString;

      if (hashtag) {
        queryRuleSub = and(
          ...optionalWhere,
          where("authorTags", "array-contains-any", [
            searchString,
            searchString.toLowerCase(),
            hashlessSearchString,
          ]),
          where("nsfw", "in", nsfwFilter),
        );
      } else {
        queryRuleSub = or(
          and(
            ...optionalWhere,
            where("fileNames", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ]),
            where("nsfw", "in", nsfwFilter),
          ),
          and(
            ...optionalWhere,
            where("customFileNames", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ]),
            where("nsfw", "in", nsfwFilter),
          ),
          and(
            ...optionalWhere,
            where("mainTags", "array-contains-any", [
              clearFileExtension(searchString).toLowerCase(),
            ]),
            where("nsfw", "in", nsfwFilter),
          ),
          and(
            ...optionalWhere,
            where("versionIds", "array-contains-any", [+searchString]),
            where("nsfw", "in", nsfwFilter),
          ),
          and(
            ...optionalWhere,
            where("authorTags", "array-contains-any", [
              searchString,
              searchString.toLowerCase(),
              hashlessSearchString,
            ]),
            where("nsfw", "in", nsfwFilter),
          ),
        );
      }

      const querySub = query(
        modelPreviewRef,
        queryRuleSub,
        orderBy("name", "asc"),
        startAfter(lastVisibleSub),
        limit(limitAmount),
      );

      let modelsDataName: ModelPreviewDoc[] = [];
      let collectionsDataNames: SearchResultCollection[] = [];
      let querySnapshot: QuerySnapshot<DocumentData, DocumentData> | null =
        null;
      let queryCollectionsSnapshot: QuerySnapshot<
        DocumentData,
        DocumentData
      > | null = null;

      if (!isLastPage && !hashtag && !onlyCollections) {
        querySnapshot = await getDocs(queryModelsByName);
        modelsDataName = querySnapshot.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return doc.data() as ModelPreviewDoc;
        });
      }

      const includeColections =
        !hashtag &&
        !filter?.baseModel?.length &&
        (!filter?.modelType?.length ||
          filter?.modelType?.includes("collection"));
      if (!isLastCollectionsPage && includeColections) {
        queryCollectionsSnapshot = await getDocs(queryCollectionsByName);
        collectionsDataNames = queryCollectionsSnapshot.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return {
            type: "collection",
            ...(doc.data() as CollectionPreviewDoc),
          };
        });
      }

      let modelsDataSub: ModelPreviewDoc[] = [];
      let querySnapshotSub: QuerySnapshot<DocumentData, DocumentData> | null =
        null;

      const isLast =
        !querySnapshot?.docs?.length ||
        querySnapshot?.docs?.length < limitAmount;
      const isLastCollection =
        !queryCollectionsSnapshot?.docs?.length ||
        (queryCollectionsSnapshot?.docs?.length < limitAmount &&
          includeColections);

      if ((isLast || hashtag) && !isLastSubPage && !onlyCollections) {
        querySnapshotSub = await getDocs(querySub);
        modelsDataSub = querySnapshotSub.docs.map((doc) => {
          // doc.data() is never undefined for query doc snapshots
          return doc.data() as ModelPreviewDoc;
        });
      }

      const isLastSub =
        isLast &&
        (!querySnapshotSub?.docs?.length ||
          querySnapshotSub?.docs?.length < limitAmount);

      if (!isLast && querySnapshot) {
        lastVisible = querySnapshot?.docs[querySnapshot.docs.length - 1];
      }
      if (!isLastCollection && includeColections && queryCollectionsSnapshot) {
        lastVisibleCollection =
          queryCollectionsSnapshot.docs[
            queryCollectionsSnapshot.docs.length - 1
          ];
      }
      if (isLast && !isLastSub && querySnapshotSub) {
        lastVisibleSub =
          querySnapshotSub.docs[querySnapshotSub.docs.length - 1];
      }

      const newModelsSearchResults = [...modelsDataName, ...modelsDataSub];
      const newModelsIds = newModelsSearchResults.map(({ id }) => id);
      const ids = searchResult?.result?.map(({ id }) => id);
      const filteredNewResult = newModelsSearchResults.filter(
        ({ id }, index) => !newModelsIds.includes(id, index + 1),
      );
      const filteredResult = filteredNewResult.filter(
        ({ id }) => !ids?.includes(id),
      );

      let finalResult: SearchResult = [];

      if (loadMore) {
        finalResult = [...searchResult.result, ...filteredResult];
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
            src: "aitools",
          }),
        );
      } else {
        dispatch(
          searchActions.setSearchResult({
            query: searchString,
            src: "aitools",
            nsfw,
            result: finalResult,
            hashtag,
            filter: filter || {
              modelType: [],
              baseModel: [],
              hashtag: hashtag,
              src: null,
            },
          }),
        );
        dispatch(searchActions.setIsLastPage(isLast));
        dispatch(searchActions.setIsLastCollectionsPage(isLastCollection));
        dispatch(searchActions.setIsLastSubPage(isLastSub));
      }
    } catch (error) {
      const errorMessage = handleErrors(normalizeError(error));
      dispatch(searchActions.setErrorMessage(errorMessage));
    } finally {
      dispatch(searchActions.setSearchIsLoading(false));
    }
  };
};

/**
 * Searches for Civitai model previews.
 *
 * Side effects:
 * - Fetches model previews from Civitai
 * - Optionally merges with already loaded previews
 *
 * @param searchString - Search query.
 * @param nsfw - Whether to include NSFW models.
 * @param loadMore - Whether to append to existing previews instead of replacing them.
 * @param isHashtag - Whether to search only by hashtags.
 * @param filter - Optional filter data.
 * @returns Redux thunk.
 */
export const civitaiSearch = (
  searchString: string | null,
  nsfw: boolean,
  loadMore: boolean = false,
  isHashtag: boolean = false,
  filter?: SearchFilter,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(searchActions.setSearchIsLoading(true));
      const hashtag = isHashtag || !!filter?.hashtag;
      const isLastPage = getState().search.isLastPage;
      const searchResult = getState().search.searchResult;

      if (isLastPage) return;
      if (!searchString) return;
      if (!loadMore) {
        nextCursor = "";
        // currCursor = "";
        dispatch(searchActions.clearSearchResult());
      }

      const url = createCivitaiSearchUrl(searchString, nsfw, filter);

      const curUrl = `${url}${nextCursor ? `&cursor=${nextCursor}` : ""}`;

      const data = await fetchData<CivitaiFetchResult<CivitaiModelDoc>>(curUrl);

      if (!data?.items) {
        throw new AppError(ERROR_MESSAGE_CIV_CONNECTION);
      }

      let modelPreviews = data.items.flatMap(
        (model) => createModelPreviewData(model, model.modelVersions[0]) || [],
      );

      let finalResult: SearchResult = [];

      if (loadMore) {
        finalResult = [...searchResult.result, ...modelPreviews];
      } else {
        finalResult = modelPreviews;
      }

      // currCursor = nextCursor;

      if (data.metadata?.nextCursor) {
        nextCursor = data.metadata.nextCursor;
      } else {
        dispatch(searchActions.setIsLastPage(true));
      }
      dispatch(
        searchActions.setSearchResult({
          query: searchString,
          src: "civitai",
          nsfw,
          result: finalResult,
          hashtag,
          filter: filter || {
            modelType: [],
            baseModel: [],
            hashtag: hashtag,
            src: "civitai",
          },
        }),
      );
    } catch (error) {
      const errorMessage = handleErrors(normalizeError(error));

      dispatch(searchActions.setErrorMessage(errorMessage));
    } finally {
      dispatch(searchActions.setSearchIsLoading(false));
    }
  };
};

export const searchActions = searchSlice.actions;

export default searchSlice;
