// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useLocation } from "react-router-dom";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import searchSlice, { searchActions } from "../../store/search";
import { civitaiSearch } from "../../store/searchThunks";
import SearchField from "./SearchField";
import SearchFilter from "./search-filter/SearchFilter";
import { fetchData } from "../../utils/fetch/fetchUtils";

// Keep the real search reducer, thunks, URL builder, and form controls.
// Replace external services and the dropdown's separately tested request flow.
vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
}));
vi.mock("../../utils/fetch/fetchUtils", () => ({ fetchData: vi.fn() }));
vi.mock("../../utils/modelUtils", () => ({
  createModelPreviewData: (model) => ({ id: model.id, name: model.name }),
}));
vi.mock("./quick-search/QuickSearch", () => ({
  default: () => <div>Quick search results</div>,
}));

const makeStore = () => configureStore({
  reducer: {
    search: searchSlice.reducer,
    general: (state = { nsfwMode: false, nsfwLevel: 1 }) => state,
    tabs: (state = { baseModels: ["SD 1.5"], categoriesData: { checkpoint: [] } }) => state,
    auth: (state = { tester: false }) => state,
  },
});
const Location = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname + location.search}</output>;
};
const mount = (store, element, url = "/") => render(
  <Provider store={store}>
    <MemoryRouter initialEntries={[url]}>{element}<Location /></MemoryRouter>
  </Provider>,
);
const params = () => new URL(screen.getByTestId("location").textContent, "https://example.test").searchParams;
beforeEach(() => vi.mocked(fetchData).mockReset());
afterEach(cleanup);

it("opens quick search and submits the typed query to the search route", () => {
  const store = makeStore();
  store.dispatch(searchActions.setSearchFilter({ type: "hashtag", value: true }));
  mount(store, <SearchField />);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "landscape" } });
  expect(store.getState().search.searchQuery).toBe("landscape");
  expect(screen.getByText("Quick search results")).toBeTruthy();

  fireEvent.click(screen.getByTestId("search-submit"));
  expect(screen.getByTestId("location").textContent).toBe("/search?searchQuery=landscape");
  expect(store.getState().search.searchFilter.hashtag).toBe(false);
  expect(screen.queryByText("Quick search results")).toBeNull();
});

it("keeps search filters synchronized with Redux and URL parameters", () => {
  const store = makeStore();
  store.dispatch(searchActions.setSearchQuery("landscape"));
  mount(store, <SearchFilter />, "/search?searchSrc=aitools&searchQuery=landscape");
  fireEvent.click(screen.getByRole("checkbox", { name: "Checkpoint" }));
  expect(store.getState().search.searchFilter.modelType).toEqual(["checkpoint"]);
  expect(params().get("modelType")).toBe("checkpoint");

  fireEvent.click(screen.getByRole("checkbox", { name: "#hashtag" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Creator" }));
  expect(store.getState().search.searchFilter).toMatchObject({ creator: true, hashtag: false });
  expect(params().get("creator")).toBe("true");
  expect(params().get("hashtag")).toBe("false");

  fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));
  expect(store.getState().search.searchFilter).toMatchObject({ modelType: [], creator: false });
  expect(params().get("searchQuery")).toBe("landscape");
  expect(params().get("modelType")).toBeNull();
});

const nsfw = { nsfwValue: false, nsfwLevel: 1 };
const model = (id) => ({ id, name: "Model " + id, modelVersions: [{}] });

it("applies Civitai filters and appends the next page using its cursor", async () => {
  const store = makeStore();
  const filter = { src: "civitai", modelType: ["LORA"], baseModel: ["SD 1.5"], hashtag: true, creator: false };
  vi.mocked(fetchData)
    .mockResolvedValueOnce({ items: [model(1)], metadata: { nextCursor: "page2" } })
    .mockResolvedValueOnce({ items: [model(2)], metadata: {} });
  await store.dispatch(civitaiSearch("landscape", nsfw, 10, false, false, true, filter));
  const url = new URL(vi.mocked(fetchData).mock.calls[0][0]);
  expect(url.searchParams.get("tag")).toBe("landscape");
  expect(url.searchParams.get("types")).toBe("LORA");
  expect(url.searchParams.get("baseModels")).toBe("SD 1.5");
  expect(store.getState().search.isLastPage).toBe(false);

  await store.dispatch(civitaiSearch("landscape", nsfw, 10, true, false, true, filter));
  expect(new URL(vi.mocked(fetchData).mock.calls[1][0]).searchParams.get("cursor")).toBe("page2");
  expect(store.getState().search.searchResult.result.map(item => item.id)).toEqual([1, 2]);
  expect(store.getState().search.searchResult.filter).toEqual(filter);
  expect(store.getState().search.isLastPage).toBe(true);
  expect(store.getState().search.isLoading).toBe(false);
});

it("stores quick search results and its remaining-page status", async () => {
  const store = makeStore();
  vi.mocked(fetchData).mockResolvedValueOnce({ items: [model(3)], metadata: { nextCursor: "more" } });
  await store.dispatch(civitaiSearch("portrait", nsfw, 5, false, true));
  expect(store.getState().search.quickSearchResult).toMatchObject({
    query: "portrait", src: "civitai", result: [{ id: 3 }], isLastPage: false,
  });
  expect(store.getState().search.searchResult.result).toEqual([]);
  expect(store.getState().search.isLoading).toBe(false);
});
