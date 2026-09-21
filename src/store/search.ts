import { createSlice, type Draft, type PayloadAction } from "@reduxjs/toolkit";
import type {
  QuickSearchResult,
  SearchFilter,
  SearchResultData,
  SearchSrcType,
  SearchState,
} from "../types/search.types";

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
      nsfw: { nsfwValue: false, nsfwLevel: 0 },
      hashtag: false,
      creator: false,
      filter: null,
    },
    quickSearchResult: {
      query: "",
      src: null,
      result: [],
      nsfw: { nsfwValue: false, nsfwLevel: 0 },
      isLastPage: true,
    },
    searchFilter: {
      src: null,
      modelType: [],
      baseModel: [],
      hashtag: false,
      creator: false,
    },
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
        nsfw: { nsfwValue: false, nsfwLevel: 0 },
        hashtag: false,
        creator: false,
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
        creator: false,
      };
    },
    resetSearchData(state) {
      state.searchResult = {
        query: "",
        src: null,
        result: [],
        nsfw: { nsfwValue: false, nsfwLevel: 0 },
        hashtag: false,
        creator: false,
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
        nsfw: { nsfwValue: false, nsfwLevel: 0 },
        isLastPage: true,
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

export const searchActions = searchSlice.actions;

export default searchSlice;
