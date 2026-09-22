// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useSearchResultsController from "./use-search-results-controller";
import SearchPage from "../pages/SearchPage";
import searchSlice, { searchActions } from "../store/search";
import { civitaiSearch, liveSearch } from "../store/searchThunks";
import { parseSearchFilterParams } from "../utils/searchUtils";
import { ERROR_MESSAGE_OFFLINE, SETTINGS_SEARCH_RESULT_PER_PAGE } from "../variables/constants";

const signals = vi.hoisted(() => ({ online: true, visible: false, nearby: false }));
vi.mock("./use-online-status", () => ({ useOnlineStatus: () => signals.online }));
vi.mock("./use-intersection", () => ({
  default: (_ref, _once, _margin, scrollMargin) => scrollMargin ? signals.nearby : signals.visible,
}));
// Keep Redux, URL handling and controller effects real; stop at the request boundary.
vi.mock("../store/searchThunks", () => ({ liveSearch: vi.fn(), civitaiSearch: vi.fn() }));
vi.mock("../components/general-elements/preview-card/PreviewCard", () => ({
  default: ({ item }) => <li>{item.name}</li>,
}));
vi.mock("../components/search/search-filter/SearchFilter", () => ({ default: () => <div>Filters</div> }));
vi.mock("../components/layout/left-sidebar/LeftSidebar", () => ({
  default: ({ isOpen, onOpen, onClose, children }) => (
    <aside>
      <button onClick={isOpen ? onClose : onOpen}>{isOpen ? "Close filters" : "Open filters"}</button>
      {isOpen && children}
    </aside>
  ),
}));
vi.mock("../components/ui/Spinner", () => ({ default: () => <div role="status">Loading</div> }));

const nsfw = { nsfwValue: false, nsfwLevel: 0 };
const makeStore = (source = "aitools") => {
  const store = configureStore({
    reducer: {
      search: searchSlice.reducer,
      general: (state = { nsfwMode: false, nsfwLevel: 0 }, action) =>
        action.type === "test/nsfw" ? { ...state, ...action.payload } : state,
    },
  });
  store.dispatch(searchActions.setSearchSrc(source));
  return store;
};
const seedResults = (store, count = SETTINGS_SEARCH_RESULT_PER_PAGE) => {
  store.dispatch(searchActions.setSearchResult({
    query: "portrait", src: store.getState().search.src, nsfw,
    hashtag: false, creator: false,
    filter: { ...parseSearchFilterParams(new URLSearchParams()), src: store.getState().search.src },
    result: Array.from({ length: count }, (_, id) => ({ id, name: `Model ${id}` })),
  }));
  store.dispatch(searchActions.setIsLastPage(true));
  store.dispatch(searchActions.setIsLastSubPage(true));
  store.dispatch(searchActions.setIsLastCollectionsPage(true));
};
const wrapperFor = (store, url = "/search?searchQuery=portrait") => ({ children }) => (
  <Provider store={store}><MemoryRouter initialEntries={[url]}>{children}</MemoryRouter></Provider>
);
const mountController = (store, url) => renderHook(() => ({
  controller: useSearchResultsController(), navigate: useNavigate(),
}), { wrapper: wrapperFor(store, url) });
const advance = (ms = 1000) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(signals, { online: true, visible: false, nearby: false });
  vi.spyOn(window, "scroll").mockImplementation(() => {});
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

it.each(["aitools", "civitai"])("debounces a new %s search and forwards URL filters", (source) => {
  const store = makeStore(source);
  const { result } = mountController(store, "/search?searchQuery=portrait&modelType=LORA&hashtag=true");
  expect(store.getState().search.searchQuery).toBe("portrait");
  advance(999);
  expect(liveSearch).not.toHaveBeenCalled();
  expect(civitaiSearch).not.toHaveBeenCalled();
  advance(1);
  const request = source === "aitools" ? liveSearch : civitaiSearch;
  expect(request).toHaveBeenCalledExactlyOnceWith(
    "portrait", nsfw, SETTINGS_SEARCH_RESULT_PER_PAGE, false, false, true,
    { src: source, modelType: ["LORA"], baseModel: [], hashtag: true, creator: false, sort: null },
  );
  expect(result.current.controller.status.isLoading).toBe(true);
});

it("replaces a pending request when the URL query changes", () => {
  const { result } = mountController(makeStore());
  advance(600);
  act(() => result.current.navigate("/search?searchQuery=landscape"));
  advance(999);
  expect(liveSearch).not.toHaveBeenCalled();
  advance(1);
  expect(liveSearch).toHaveBeenCalledOnce();
  expect(liveSearch.mock.calls[0][0]).toBe("landscape");
});

it("retains completed results across unmount and return while clearing the input query", () => {
  const store = makeStore();
  seedResults(store);
  const saved = store.getState().search.searchResult.result;
  const first = mountController(store);
  advance();
  expect(first.result.current.controller.results).toBe(saved);
  expect(liveSearch).not.toHaveBeenCalled();
  first.unmount();
  expect(store.getState().search.searchQuery).toBe("");
  const second = mountController(store);
  advance();
  expect(second.result.current.controller.results).toBe(saved);
  expect(liveSearch).not.toHaveBeenCalled();
});

it.each(["setIsLastPage", "setIsLastSubPage", "setIsLastCollectionsPage"])(
  "continues local pagination when %s is false and the end becomes nearby", (action) => {
    const store = makeStore();
    seedResults(store);
    store.dispatch(searchActions[action](false));
    const { rerender } = mountController(store);
    advance();
    expect(liveSearch).not.toHaveBeenCalled();
    signals.nearby = true;
    rerender();
    advance();
    expect(liveSearch).toHaveBeenCalledOnce();
    expect(liveSearch.mock.calls[0].slice(3, 5)).toEqual([true, false]);
  },
);

it("uses only Civitai's main pagination flag once a full page is present", () => {
  const store = makeStore("civitai");
  seedResults(store);
  store.dispatch(searchActions.setIsLastSubPage(false));
  store.dispatch(searchActions.setIsLastCollectionsPage(false));
  signals.visible = true;
  const { result } = mountController(store);
  advance();
  expect(result.current.controller.pagination.hasMore).toBe(false);
  expect(civitaiSearch).not.toHaveBeenCalled();
});

it("fills a short Civitai result page without waiting for intersection", () => {
  const store = makeStore("civitai");
  seedResults(store, 1);
  store.dispatch(searchActions.setIsLastPage(false));
  mountController(store);
  advance();
  expect(civitaiSearch).toHaveBeenCalledOnce();
  expect(civitaiSearch.mock.calls[0][3]).toBe(true);
});

it.each(["filters", "nsfw mode", "nsfw level", "source"])("restarts retained results after changing %s", (change) => {
  const store = makeStore();
  seedResults(store);
  const { result } = mountController(store);
  act(() => {
    if (change === "filters") result.current.navigate("/search?searchQuery=portrait&baseModel=Pony");
    if (change === "nsfw mode") store.dispatch({ type: "test/nsfw", payload: { nsfwMode: true } });
    if (change === "nsfw level") store.dispatch({ type: "test/nsfw", payload: { nsfwLevel: 2 } });
    if (change === "source") store.dispatch(searchActions.setSearchSrc("civitai"));
  });
  expect(store.getState().search).toMatchObject({ isLastPage: false, isLastSubPage: false, isLastCollectionsPage: false });
  advance();
  const request = change === "source" ? civitaiSearch : liveSearch;
  expect(request).toHaveBeenCalledOnce();
  expect(request.mock.calls[0][3]).toBe(false);
  if (change === "filters") expect(window.scroll).toHaveBeenCalledWith(0, 0);
});

it.each(["offline", "loading", "error", "empty query"])("does not start an automatic request with %s", (reason) => {
  const store = makeStore();
  if (reason === "offline") signals.online = false;
  if (reason === "loading") store.dispatch(searchActions.setSearchIsLoading(true));
  if (reason === "error") store.dispatch(searchActions.setErrorMessage("Request failed"));
  mountController(store, reason === "empty query" ? "/search" : undefined);
  advance();
  expect(liveSearch).not.toHaveBeenCalled();
  expect(civitaiSearch).not.toHaveBeenCalled();
});

it("keeps title/sidebar presentation in the page and retries failed Civitai pagination immediately", () => {
  const store = makeStore("civitai");
  seedResults(store, 1);
  store.dispatch(searchActions.setErrorMessage("Request failed"));
  render(<SearchPage title="Search" />, { wrapper: wrapperFor(store) });
  expect(document.title).toBe("Search - portrait");
  expect(screen.getByText("Model 0")).toBeTruthy();
  expect(screen.getByText("Request failed")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
  expect(screen.getByText("Filters")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Close filters" }));
  expect(screen.queryByText("Filters")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(store.getState().search.errorMessage).toBe("");
  expect(civitaiSearch).toHaveBeenCalledOnce();
  expect(civitaiSearch.mock.calls[0].slice(3, 5)).toEqual([true, false]);
  expect(screen.getByRole("status").textContent).toBe("Loading");
});

it("shows the existing empty-query and offline messages", () => {
  signals.online = false;
  const { rerender } = render(<SearchPage title="Search" />, { wrapper: wrapperFor(makeStore(), "/search") });
  expect(document.title).toBe("Search");
  expect(screen.getByText(ERROR_MESSAGE_OFFLINE)).toBeTruthy();
  signals.online = true;
  rerender(<SearchPage title="Search" />);
  expect(screen.getByText("Enter your query in the search field to start searching")).toBeTruthy();
  expect(screen.queryByText(ERROR_MESSAGE_OFFLINE)).toBeNull();
});
