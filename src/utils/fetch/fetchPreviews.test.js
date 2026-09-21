import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDocs } from "firebase/firestore";
import { fetchCollectionPreviewPage, fetchModelPreviewPage } from "./fetchPreviews";
import tabsSlice, { getModelsPreview, tabActions } from "../../store/tabs";
import imagesSlice from "../../store/images";
import { getCollectionPreviews } from "../../store/imagesThunks";
import { ERROR_MESSAGE_DEFAULT } from "../../variables/constants";

vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  collection: (_, ...path) => path.join("/"),
  query: (path, ...constraints) => ({ path, constraints }),
  where: (...args) => ({ where: args }),
  orderBy: (...args) => ({ orderBy: args }),
  startAfter: (cursor) => ({ startAfter: cursor }),
  limit: (amount) => ({ limit: amount }),
  getDocs: vi.fn(),
}));

const snapshot = (length, offset = 0) => ({
  docs: Array.from({ length }, (_, i) => ({
    id: String(offset + i),
    data: () => ({ id: offset + i, name: `Preview ${offset + i}` }),
  })),
});
const makeStore = () => configureStore({
  reducer: {
    tabs: tabsSlice.reducer,
    images: imagesSlice.reducer,
    auth: (state = { user: { uid: "user-1" } }) => state,
  },
});
const requestedQuery = () => vi.mocked(getDocs).mock.calls.at(-1)[0];
const requestedCursor = () => requestedQuery().constraints.find((item) => "startAfter" in item).startAfter;
beforeEach(() => vi.mocked(getDocs).mockReset().mockResolvedValue(snapshot(0)));
afterEach(() => vi.restoreAllMocks());

const modelOptions = {
  uid: "user-1", activeTab: "all", activeCategory: "all", activeSubcategory: "all",
  baseModel: "-", sortBy: "name", nsfwMode: false, cursor: "",
};
const collectionOptions = {
  uid: "user-1", activeCategory: "all", activeSubcategory: "all", nsfwMode: false, cursor: null,
};
const cases = [
  {
    name: "models", fetchPage: fetchModelPreviewPage, options: modelOptions,
    path: "users/user-1/preview", initialCursor: "",
    request: (loadMore = false) => getModelsPreview("lora", "portrait", "face", loadMore, true),
    state: (store) => {
      const state = store.getState().tabs;
      return { items: state.modelsData.previews, loading: state.isLoading, last: state.isLastPage, error: state.errorMessage };
    },
  },
  {
    name: "collections", fetchPage: fetchCollectionPreviewPage, options: collectionOptions,
    path: "users/user-1/collectionPreviews", initialCursor: null,
    request: (loadMore = false) => getCollectionPreviews("portrait", "face", loadMore, true),
    state: (store) => {
      const state = store.getState().images;
      return { items: state.collectionPreviews?.data || [], loading: state.previewsIsLoading, last: state.isLastPreviewsPage, error: state.previewsErrorMessage };
    },
  },
];

it("keeps model filters, sorting direction, and snapshot cursors", async () => {
  const cursor = snapshot(1).docs[0];
  await fetchModelPreviewPage({
    ...modelOptions, activeTab: "lora", activeCategory: "portrait", activeSubcategory: "face",
    baseModel: "SDXL", sortBy: "createdAt", cursor,
  });
  expect(requestedQuery()).toEqual({
    path: "users/user-1/preview",
    constraints: [
      { where: ["modelType", "==", "lora"] },
      { where: ["main", "==", "portrait"] },
      { where: ["sub", "array-contains", "face"] },
      { where: ["baseModel", "==", "SDXL"] },
      { where: ["nsfw", "in", [false]] },
      { orderBy: ["createdAt", "desc"] },
      { startAfter: cursor },
      { limit: 16 },
    ],
  });
});

it("uses collection-specific fields and always sorts by name", async () => {
  await fetchCollectionPreviewPage({ ...collectionOptions, activeCategory: "portrait", activeSubcategory: "face" });
  expect(requestedQuery().constraints).toEqual([
    { where: ["category", "==", "portrait"] },
    { where: ["subcategories", "array-contains", "face"] },
    { where: ["nsfw", "in", [false]] },
    { orderBy: ["name", "asc"] },
    { startAfter: null },
    { limit: 16 },
  ]);
});

it("omits empty and null model filters", async () => {
  await fetchModelPreviewPage({ ...modelOptions, activeTab: "", activeCategory: null, activeSubcategory: null, baseModel: "" });
  expect(requestedQuery().constraints.filter((item) => item.where)).toEqual([
    { where: ["nsfw", "in", [false]] },
  ]);
});

it("omits empty collection filters", async () => {
  await fetchCollectionPreviewPage({ ...collectionOptions, activeCategory: "", activeSubcategory: "" });
  expect(requestedQuery().constraints.filter((item) => item.where)).toEqual([
    { where: ["nsfw", "in", [false]] },
  ]);
});

describe.each(cases)("$name preview pages", ({ name, fetchPage, options, path, initialCursor, request, state }) => {
  it.each([false, true])("preserves unfiltered queries with NSFW mode %s", async (nsfwMode) => {
    await fetchPage({ ...options, nsfwMode });
    expect(requestedQuery()).toEqual({
      path,
      constraints: [
        { where: ["nsfw", "in", nsfwMode ? [true, false] : [false]] },
        { orderBy: ["name", "asc"] },
        { startAfter: initialCursor },
        { limit: 16 },
      ],
    });
  });

  it.each([0, 1, 15, 16])("maps a %i-item page and advances cursors only for full pages", async (length) => {
    const response = snapshot(length);
    const cursor = snapshot(1, 99).docs[0];
    vi.mocked(getDocs).mockResolvedValueOnce(response);
    const result = await fetchPage({ ...options, cursor });
    expect(result.items).toEqual(response.docs.map((doc) => (
      name === "collections" ? { type: "collection", ...doc.data() } : doc.data()
    )));
    expect(result.isLastPage).toBe(length < 16);
    expect(result.cursor).toBe(length < 16 ? cursor : response.docs.at(-1));
    expect(requestedCursor()).toBe(cursor);
  });

  it("propagates Firestore failures unchanged", async () => {
    const error = new Error("Firestore unavailable");
    vi.mocked(getDocs).mockRejectedValueOnce(error);
    await expect(fetchPage(options)).rejects.toBe(error);
  });

  it("replaces, appends, stops at the last page, and resets on a fresh request", async () => {
    const store = makeStore();
    const first = snapshot(16);
    vi.mocked(getDocs).mockResolvedValueOnce(first).mockResolvedValueOnce(snapshot(1, 16));
    await store.dispatch(request());
    expect(requestedCursor()).toBe(initialCursor);
    expect(state(store).items).toHaveLength(16);
    expect(state(store)).toMatchObject({ loading: false, last: false, error: "" });

    await store.dispatch(request(true));
    expect(requestedCursor()).toBe(first.docs.at(-1));
    expect(state(store).items.map(({ id }) => id)).toEqual(Array.from({ length: 17 }, (_, i) => i));
    expect(state(store)).toMatchObject({ loading: false, last: true });
    await store.dispatch(request(true));
    expect(getDocs).toHaveBeenCalledTimes(2);

    vi.mocked(getDocs).mockResolvedValueOnce(snapshot(1, 100));
    await store.dispatch(request());
    expect(requestedCursor()).toBe(initialCursor);
    expect(state(store).items.map(({ id }) => id)).toEqual([100]);
    expect(state(store)).toMatchObject({ loading: false, last: true });
  });

  it("keeps existing results on failure, clears loading, and can retry the same cursor", async () => {
    const store = makeStore();
    const first = snapshot(16);
    vi.mocked(getDocs).mockResolvedValueOnce(first);
    await store.dispatch(request());
    const existing = state(store).items;
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getDocs).mockRejectedValueOnce(new Error("Firestore unavailable"));
    await store.dispatch(request(true));
    expect(state(store)).toMatchObject({ loading: false, last: false, error: ERROR_MESSAGE_DEFAULT });
    expect(state(store).items).toBe(existing);
    expect(requestedCursor()).toBe(first.docs.at(-1));

    await store.dispatch(request(true));
    expect(requestedCursor()).toBe(first.docs.at(-1));
    expect(state(store)).toMatchObject({ loading: false, last: true, error: "" });
    expect(state(store).items).toEqual(existing);
  });

  it("sets loading while the page is pending", async () => {
    const store = makeStore();
    let finish;
    vi.mocked(getDocs).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const pending = store.dispatch(request());
    expect(state(store).loading).toBe(true);
    finish(snapshot(0));
    await pending;
    expect(state(store)).toMatchObject({ loading: false, last: true, items: [] });
  });
});

it("passes model sorting and base-model state to the query and retains filter metadata", async () => {
  const store = makeStore();
  store.dispatch(tabActions.setSortBy("createdAt"));
  store.dispatch(tabActions.setBaseModel("SDXL"));
  await store.dispatch(getModelsPreview("lora", "portrait", "face", false, true));
  expect(requestedQuery().constraints).toContainEqual({ where: ["baseModel", "==", "SDXL"] });
  expect(requestedQuery().constraints).toContainEqual({ orderBy: ["createdAt", "desc"] });
  expect(store.getState().tabs.modelsData).toMatchObject({ tab: "lora", category: "portrait", subcategory: "face", nsfw: true });
  await store.dispatch(getCollectionPreviews("portrait", "face", false, true));
  expect(store.getState().images.collectionPreviews).toMatchObject({ category: "portrait", subcategory: "face", nsfw: true });
});

it("does not query collections without an active category", async () => {
  await makeStore().dispatch(getCollectionPreviews("", "all", false, false));
  expect(getDocs).not.toHaveBeenCalled();
});
