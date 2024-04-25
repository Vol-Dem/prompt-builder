import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchQuery: "",
    searchResult: [],
    isLoading: false,
    errorMessage: "",
  },
  reducers: {
    setSearchQuery(state, actions) {
      state.searchQuery = actions.payload;
    },
    setSearchResult(state, actions) {
      state.searchResult = actions.payload;
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
  },
});

export const searchActions = searchSlice.actions;

export default searchSlice;
