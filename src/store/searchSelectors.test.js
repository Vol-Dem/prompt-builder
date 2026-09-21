import { configureStore } from "@reduxjs/toolkit";
import { expect, it } from "vitest";

import searchSlice, { searchActions } from "./search";
import {
  selectQuickSearchResult,
  selectSearchNsfw,
  selectSearchQuery,
  selectSearchResult,
} from "./searchSelectors";

const makeStore = () => configureStore({
  reducer: {
    search: searchSlice.reducer,
    general: (state = { nsfwMode: false, nsfwLevel: "None", isMobile: false }, action) =>
      action.type === "test/general" ? { ...state, ...action.payload } : state,
  },
});

it("keeps NSFW request options stable through unrelated search and general updates", () => {
  const store = makeStore();
  const options = selectSearchNsfw(store.getState());
  expect(options).toEqual({ nsfwValue: false, nsfwLevel: "None" });

  store.dispatch(searchActions.setSearchQuery("portrait"));
  store.dispatch(searchActions.setSearchIsLoading(true));
  store.dispatch({ type: "test/general", payload: { isMobile: true } });

  expect(selectSearchNsfw(store.getState())).toBe(options);
  expect(selectSearchQuery(store.getState())).toBe("portrait");
});

it.each([
  [{ nsfwMode: true }, { nsfwValue: true, nsfwLevel: "None" }],
  [{ nsfwLevel: "X" }, { nsfwValue: false, nsfwLevel: "X" }],
  [{ nsfwMode: true, nsfwLevel: "X" }, { nsfwValue: true, nsfwLevel: "X" }],
])("updates request options when NSFW settings change: %j", (payload, expected) => {
  const store = makeStore();
  const previous = selectSearchNsfw(store.getState());
  store.dispatch({ type: "test/general", payload });

  const next = selectSearchNsfw(store.getState());
  expect(next).toEqual(expected);
  expect(next).not.toBe(previous);
  expect(previous).toEqual({ nsfwValue: false, nsfwLevel: "None" });

  store.dispatch({ type: "test/general", payload });
  expect(selectSearchNsfw(store.getState())).toBe(next);
});

it("preserves independent full and quick result references through loading and query updates", () => {
  const store = makeStore();
  store.dispatch(searchActions.setSearchResult({
    ...store.getState().search.searchResult,
    query: "landscape",
    result: [{ id: "full-result" }],
  }));
  store.dispatch(searchActions.setQuickSearchResult({
    ...store.getState().search.quickSearchResult,
    query: "portrait",
    result: [{ id: "quick-result" }],
  }));
  const full = selectSearchResult(store.getState());
  const quick = selectQuickSearchResult(store.getState());
  expect(full.result).toEqual([{ id: "full-result" }]);
  expect(quick.result).toEqual([{ id: "quick-result" }]);

  store.dispatch(searchActions.setSearchQuery("new query"));
  store.dispatch(searchActions.setSearchIsLoading(true));
  expect(selectSearchResult(store.getState())).toBe(full);
  expect(selectQuickSearchResult(store.getState())).toBe(quick);

  store.dispatch(searchActions.resetQuickSearchData());
  expect(selectQuickSearchResult(store.getState()).result).toEqual([]);
  expect(selectSearchResult(store.getState())).toBe(full);
});
