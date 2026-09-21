import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "./store";

export const selectSearchQuery = (state: RootState) => state.search.searchQuery;
export const selectSearchSrc = (state: RootState) => state.search.src;
export const selectSearchResult = (state: RootState) => state.search.searchResult;
export const selectQuickSearchResult = (state: RootState) =>
  state.search.quickSearchResult;
export const selectSearchIsLoading = (state: RootState) => state.search.isLoading;
export const selectSearchErrorMessage = (state: RootState) =>
  state.search.errorMessage;
export const selectSearchIsLastPage = (state: RootState) => state.search.isLastPage;
export const selectSearchIsLastSubPage = (state: RootState) =>
  state.search.isLastSubPage;
export const selectSearchIsLastCollectionsPage = (state: RootState) =>
  state.search.isLastCollectionsPage;
export const selectSearchHashtag = (state: RootState) =>
  state.search.searchFilter.hashtag;
export const selectSearchCreator = (state: RootState) =>
  state.search.searchFilter.creator;

// Keep request options stable when unrelated search or general state changes.
export const selectSearchNsfw = createSelector(
  [
    (state: RootState) => state.general.nsfwMode,
    (state: RootState) => state.general.nsfwLevel,
  ],
  (nsfwValue, nsfwLevel) => ({ nsfwValue, nsfwLevel }),
);
