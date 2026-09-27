// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useQuickSearchController from "./use-quick-search-controller";
import QuickSearch from "../components/search/quick-search/QuickSearch";
import searchSlice, { searchActions } from "../store/search";
import { civitaiSearch, liveSearch } from "../store/searchThunks";
import { ERROR_MESSAGE_OFFLINE, SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE } from "../variables/constants";

const connection = vi.hoisted(() => ({ online: true }));
vi.mock("./use-online-status", () => ({ useOnlineStatus: () => connection.online }));
// Keep Redux, router state and dropdown controls real; stop at the request boundary.
vi.mock("../store/searchThunks", () => ({ liveSearch: vi.fn(), civitaiSearch: vi.fn() }));
vi.mock("../components/search/categories-search/CategoriesSearch", () => ({
  default: () => <div>Matching categories</div>,
}));
vi.mock("../components/search/quick-search-item/QuickSearchItem", () => ({
  default: ({ modelPreveiw }) => <li>{modelPreveiw.name}</li>,
}));
vi.mock("../components/ui/Spinner", () => ({ default: () => <div role="status">Loading</div> }));

const nsfw = { nsfwValue: false, nsfwLevel: 0 };
const makeStore = (source = "aitools", query = "portrait") => {
  const store = configureStore({
    reducer: {
      search: searchSlice.reducer,
      general: (state = { nsfwMode: false, nsfwLevel: 0 }, action) =>
        action.type === "test/nsfw" ? { ...state, ...action.payload } : state,
    },
  });
  store.dispatch(searchActions.setSearchSrc(source));
  store.dispatch(searchActions.setSearchQuery(query));
  return store;
};
const wrapperFor = (store, path = "/") => ({ children }) => (
  <Provider store={store}><MemoryRouter initialEntries={[path]}>{children}</MemoryRouter></Provider>
);
const mountController = (store, path) => renderHook(() => ({
  controller: useQuickSearchController(), navigate: useNavigate(),
}), { wrapper: wrapperFor(store, path) });
const advance = (ms = 1000) => act(() => vi.advanceTimersByTime(ms));
const setQuickResult = (store, result = [], isLastPage = true) => store.dispatch(searchActions.setQuickSearchResult({
  query: "portrait", src: store.getState().search.src, nsfw, result, isLastPage,
}));

beforeEach(() => {
  vi.useFakeTimers();
  connection.online = true;
  for (const request of [liveSearch, civitaiSearch]) {
    request.mockReset().mockImplementation(() => (dispatch) => {
      dispatch(searchActions.setSearchIsLoading(true));
    });
  }
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it.each(["aitools", "civitai"])("debounces and trims %s queries with the existing quick-search limit", (source) => {
  const store = makeStore(source, "  portrait  ");
  const { result } = mountController(store);
  advance(999);
  expect(liveSearch).not.toHaveBeenCalled();
  expect(civitaiSearch).not.toHaveBeenCalled();
  advance(1);
  const request = source === "aitools" ? liveSearch : civitaiSearch;
  const limit = SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE + (source === "aitools" ? 1 : 0);
  expect(request).toHaveBeenCalledExactlyOnceWith("portrait", nsfw, limit, false, true);
  expect(result.current.controller.status.isLoading).toBe(true);
});

it("replaces pending queries and clears stale quick results without clearing full results", () => {
  const store = makeStore();
  store.dispatch(searchActions.setSearchResult({
    ...store.getState().search.searchResult, result: [{ id: 1, name: "Full result" }],
  }));
  const savedFullResult = store.getState().search.searchResult;
  setQuickResult(store, [{ id: 2, name: "Old quick result" }]);
  store.dispatch(searchActions.setErrorMessage("Old error"));
  store.dispatch(searchActions.setIsLastPage(true));
  store.dispatch(searchActions.setIsLastSubPage(true));
  store.dispatch(searchActions.setIsLastCollectionsPage(true));
  mountController(store);
  expect(store.getState().search.quickSearchResult.result).toEqual([]);
  expect(store.getState().search.errorMessage).toBe("");
  expect(store.getState().search.isLastPage).toBe(true);
  advance(600);
  act(() => store.dispatch(searchActions.setSearchQuery("landscape")));
  advance(999);
  expect(liveSearch).not.toHaveBeenCalled();
  advance(1);
  expect(liveSearch).toHaveBeenCalledOnce();
  expect(liveSearch.mock.calls[0][0]).toBe("landscape");
  expect(store.getState().search).toMatchObject({ isLastPage: false, isLastSubPage: false, isLastCollectionsPage: false });
  expect(store.getState().search.searchResult).toBe(savedFullResult);
});

it.each(["route", "blank query", "offline", "unmount"])("cancels a pending request on %s", (change) => {
  const store = makeStore();
  const { result, rerender, unmount } = mountController(store);
  advance(500);
  if (change === "route") act(() => result.current.navigate("/search?searchQuery=portrait"));
  if (change === "blank query") act(() => store.dispatch(searchActions.setSearchQuery("   ")));
  if (change === "offline") { connection.online = false; rerender(); }
  if (change === "unmount") unmount();
  advance();
  expect(liveSearch).not.toHaveBeenCalled();
  expect(civitaiSearch).not.toHaveBeenCalled();
});

it.each(["route", "blank query", "offline"])("does not schedule an initial request for %s", (reason) => {
  connection.online = reason !== "offline";
  mountController(makeStore("aitools", reason === "blank query" ? "   " : "portrait"), reason === "route" ? "/search" : "/");
  advance();
  expect(liveSearch).not.toHaveBeenCalled();
  expect(civitaiSearch).not.toHaveBeenCalled();
});

it("starts a fresh debounce when the connection returns", () => {
  connection.online = false;
  const { result, rerender } = mountController(makeStore());
  expect(result.current.controller.status.isOnline).toBe(false);
  connection.online = true;
  rerender();
  advance(999);
  expect(liveSearch).not.toHaveBeenCalled();
  advance(1);
  expect(liveSearch).toHaveBeenCalledOnce();
});

it("replaces a pending local request when switching to Civitai", () => {
  const store = makeStore();
  mountController(store);
  advance(500);
  act(() => store.dispatch(searchActions.setSearchSrc("civitai")));
  advance(999);
  expect(liveSearch).not.toHaveBeenCalled();
  expect(civitaiSearch).not.toHaveBeenCalled();
  advance(1);
  expect(civitaiSearch).toHaveBeenCalledExactlyOnceWith("portrait", nsfw, SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE, false, true);
});

it("preserves mode-only NSFW dependencies, including options captured by a pending request", () => {
  const store = makeStore();
  mountController(store);
  advance(500);
  act(() => store.dispatch({ type: "test/nsfw", payload: { nsfwLevel: 2 } }));
  advance(500);
  expect(liveSearch).toHaveBeenCalledOnce();
  expect(liveSearch.mock.calls[0][1]).toEqual(nsfw);
  advance();
  expect(liveSearch).toHaveBeenCalledOnce();

  act(() => store.dispatch({ type: "test/nsfw", payload: { nsfwMode: true } }));
  advance(999);
  expect(liveSearch).toHaveBeenCalledOnce();
  advance(1);
  expect(liveSearch).toHaveBeenCalledTimes(2);
  expect(liveSearch.mock.calls[1][1]).toEqual({ nsfwValue: true, nsfwLevel: 2 });
});

it("clears the query and closes the dropdown without starting the pending request", () => {
  const store = makeStore();
  const onOpen = vi.fn();
  render(<QuickSearch onSubmit={vi.fn()} onOpen={onOpen} />, { wrapper: wrapperFor(store) });
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(store.getState().search.searchQuery).toBe("");
  expect(onOpen).toHaveBeenCalledExactlyOnceWith(false);
  advance();
  expect(liveSearch).not.toHaveBeenCalled();
});

it("keeps the preview limit and delegates Show more navigation to the parent", () => {
  const store = makeStore();
  const onSubmit = vi.fn();
  render(<QuickSearch onSubmit={onSubmit} onOpen={vi.fn()} />, { wrapper: wrapperFor(store) });
  act(() => setQuickResult(store, Array.from({ length: SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE + 1 }, (_, id) => ({ id, name: `Model ${id}` })), false));
  expect(screen.getAllByRole("listitem")).toHaveLength(SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE);
  expect(screen.queryByText(`Model ${SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE}`)).toBeNull();
  expect(screen.getByText("Matching categories")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Show more" }));
  expect(onSubmit).toHaveBeenCalledOnce();
});

it("preserves loading, error, empty and offline states for Civitai", () => {
  const store = makeStore("civitai", "");
  const { rerender } = render(<QuickSearch onSubmit={vi.fn()} onOpen={vi.fn()} />, { wrapper: wrapperFor(store) });
  expect(screen.queryByText("Matching categories")).toBeNull();
  act(() => {
    setQuickResult(store);
    store.dispatch(searchActions.setSearchIsLoading(true));
    store.dispatch(searchActions.setErrorMessage("Request failed"));
  });
  expect(screen.getByRole("status").textContent).toBe("Loading");
  expect(screen.queryByText("Request failed")).toBeNull();
  act(() => store.dispatch(searchActions.setSearchIsLoading(false)));
  expect(screen.getByText("Request failed")).toBeTruthy();
  expect(screen.queryByText("No resources found")).toBeNull();
  act(() => store.dispatch(searchActions.setErrorMessage("")));
  expect(screen.getByText("No resources found")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
  connection.online = false;
  rerender(<QuickSearch onSubmit={vi.fn()} onOpen={vi.fn()} />);
  expect(screen.getByText(ERROR_MESSAGE_OFFLINE)).toBeTruthy();
  expect(screen.queryByText("No resources found")).toBeNull();
});
