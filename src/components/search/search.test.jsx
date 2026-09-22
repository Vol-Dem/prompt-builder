// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useLocation } from "react-router-dom";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import searchSlice, { searchActions } from "../../store/search";
import { civitaiSearch } from "../../store/searchThunks";
import SearchField from "./SearchField";
import SearchFilter from "./search-filter/SearchFilter";
import useSearchFilterController from "../../hooks/use-search-filter-controller";
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

const makeStore = ({
  baseModels = ["SD 1.5"],
  categoriesData = { checkpoint: [] },
  tester = false,
} = {}) => configureStore({
  reducer: {
    search: searchSlice.reducer,
    general: (state = { nsfwMode: false, nsfwLevel: 1 }) => state,
    tabs: (state = { baseModels, categoriesData }) => state,
    auth: (state = { tester }) => state,
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

const filterOptions = {
  baseModels: ["SD 1.5", "SDXL 1.0", "Pony", "Flux.1 D"],
  categoriesData: { checkpoint: [], lora: [], embedding: [] },
};
const checkbox = (name) => screen.getByLabelText(name, { selector: 'input[type="checkbox"]' });

it("hydrates filter controls from the current URL", () => {
  const store = makeStore(filterOptions);
  mount(store, <SearchFilter />, "/search?searchSrc=aitools&modelType=checkpoint,lora&baseModel=SD+1.5&hashtag=true");
  expect(checkbox("Checkpoint").checked).toBe(true);
  expect(checkbox("LoRa/LoCon/DoRa").checked).toBe(true);
  expect(checkbox("SD 1.5").checked).toBe(true);
  expect(checkbox("#hashtag").checked).toBe(true);
  expect(checkbox("Creator").checked).toBe(false);
  expect(checkbox("SDXL 1.0").disabled).toBe(true);
});

it("applies and releases cross-group selection limits while synchronizing base models", () => {
  const store = makeStore(filterOptions);
  mount(store, <SearchFilter />, "/search?searchSrc=aitools");
  fireEvent.click(checkbox("Checkpoint"));
  fireEvent.click(checkbox("LoRa/LoCon/DoRa"));
  fireEvent.click(checkbox("SD 1.5"));
  expect(checkbox("SDXL 1.0").disabled).toBe(true);
  expect(checkbox("SD 1.5").disabled).toBe(false);
  expect(store.getState().search.searchFilter.baseModel).toEqual(["SD 1.5"]);
  expect(params().get("baseModel")).toBe("SD 1.5");

  fireEvent.click(checkbox("LoRa/LoCon/DoRa"));
  expect(checkbox("SDXL 1.0").disabled).toBe(false);
  fireEvent.click(checkbox("SDXL 1.0"));
  expect(checkbox("LoRa/LoCon/DoRa").disabled).toBe(true);
  expect(checkbox("Checkpoint").disabled).toBe(false);
  expect(store.getState().search.searchFilter.baseModel).toEqual(["SD 1.5", "SDXL 1.0"]);
  expect(params().get("baseModel")).toBe("SD 1.5,SDXL 1.0");
  fireEvent.click(checkbox("SDXL 1.0"));
  expect(checkbox("LoRa/LoCon/DoRa").disabled).toBe(false);
});

it.each([
  ["types", ["Image collection", "LoRa/LoCon/DoRa", "Checkpoint"], "Embedding"],
  ["base models", ["SD 1.5", "SDXL 1.0", "Pony"], "Flux.1 D"],
])("caps %s at three selections and clears limits on reset", (_, selected, remaining) => {
  const store = makeStore(filterOptions);
  store.dispatch(searchActions.setSearchQuery("landscape"));
  mount(store, <SearchFilter />, "/search?searchSrc=aitools&searchQuery=landscape");
  selected.forEach((name) => fireEvent.click(checkbox(name)));
  expect(checkbox(remaining).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));
  expect(screen.getAllByRole("checkbox").every((input) => !input.checked && !input.disabled)).toBe(true);
  expect(params().get("searchQuery")).toBe("landscape");
  expect(store.getState().search.searchFilter).toMatchObject({ modelType: [], baseModel: [] });
});

it("switches source options and URL defaults while preserving the query and search mode", () => {
  const store = makeStore(filterOptions);
  store.dispatch(searchActions.setSearchQuery("landscape"));
  mount(store, <SearchFilter />, "/search?searchSrc=aitools&searchQuery=landscape");
  fireEvent.click(checkbox("Checkpoint"));
  fireEvent.click(checkbox("#hashtag"));
  act(() => store.dispatch(searchActions.setSearchSrc("civitai")));
  expect(params().get("searchSrc")).toBe("civitai");
  expect(params().get("searchQuery")).toBe("landscape");
  expect(params().get("hashtag")).toBe("true");
  expect(params().get("modelType")).toBeNull();
  expect(params().get("sort")).toBe("Highest Rated");
  expect(screen.queryByLabelText("Image collection")).toBeNull();
  expect(checkbox("LORA").checked).toBe(false);

  act(() => store.dispatch(searchActions.setSearchSrc("aitools")));
  expect(params().get("sort")).toBeNull();
  expect(checkbox("Image collection").checked).toBe(false);
  expect(screen.queryByLabelText("LORA")).toBeNull();
});

it("does not apply local selection limits to Civitai", () => {
  const store = makeStore();
  store.dispatch(searchActions.setSearchSrc("civitai"));
  const { result } = renderHook(useSearchFilterController, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={["/search?searchSrc=civitai&modelType=Checkpoint,LORA,LoCon"]}>
          {children}<Location />
        </MemoryRouter>
      </Provider>
    ),
  });
  expect(result.current.modelTypes.options.find(({ id }) => id === "DoRA").disabled).toBe(false);
  act(() => result.current.modelTypes.onChange({ target: { id: "DoRA", checked: true } }));
  expect(store.getState().search.searchFilter.modelType).toEqual(["Checkpoint", "LORA", "LoCon", "DoRA"]);
  expect(params().get("modelType")).toBe("Checkpoint,LORA,LoCon,DoRA");
  expect(result.current.modelTypes.checkedCount).toBe(4);
  expect(result.current.modelTypes.options.every(({ disabled }) => !disabled)).toBe(true);
});

it.each([false, true])("keeps Civitai sorting gated by tester=%s", (tester) => {
  const store = makeStore({ tester });
  store.dispatch(searchActions.setSearchSrc("civitai"));
  mount(store, <SearchFilter />, "/search?searchSrc=civitai&sort=Newest");
  fireEvent.click(screen.getByText("Newest"));
  if (!tester) {
    expect(screen.queryByRole("radio", { name: "Most Liked" })).toBeNull();
    expect(params().get("sort")).toBe("Newest");
    return;
  }
  fireEvent.click(screen.getByRole("radio", { name: "Most Liked" }));
  expect(store.getState().search.searchFilter.sort).toBe("Most Liked");
  expect(params().get("sort")).toBe("Most Liked");
  fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));
  expect(screen.getAllByText("Highest Rated").length).toBeGreaterThan(0);
  expect(store.getState().search.searchFilter.sort).toBeUndefined();
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
