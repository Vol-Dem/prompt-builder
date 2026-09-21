import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getDocs, query } from "firebase/firestore";
import searchSlice, { liveSearch, searchActions } from "./search";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("../utils/fetch/fetchUtils", () => ({ fetchData: vi.fn() }));
vi.mock("../utils/modelUtils", () => ({ createModelPreviewData: vi.fn() }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}),
  collection: (_, ...path) => path.join("/"),
  query: vi.fn((path, ...constraints) => ({ path, constraints })),
  where: (...args) => ({ where: args }),
  and: (...rules) => ({ and: rules }),
  or: (...rules) => ({ or: rules }),
  FieldPath: class { constructor(...fields) { this.fields = fields; } },
  orderBy: (...args) => ({ orderBy: args }),
  startAfter: (cursor) => ({ startAfter: cursor }),
  limit: (amount) => ({ limit: amount }),
  getDocs: vi.fn(),
}));

const nsfw = { nsfwValue: false, nsfwLevel: 1 };
const filter = (overrides = {}) => ({ src: null, modelType: [], baseModel: [], hashtag: false, creator: false, ...overrides });
const snap = (...items) => ({ docs: items.map((item) => ({ data: () => typeof item === "number" ? { id: item } : item })) });
const makeStore = () => configureStore({ reducer: {
  search: searchSlice.reducer,
  auth: (state = { user: { uid: "user-1" } }) => state,
} });
const state = (store) => store.getState().search;
const calls = () => vi.mocked(getDocs).mock.calls.map(([q]) => q);
const cursor = (q) => q.constraints.find((constraint) => "startAfter" in constraint).startAfter;
const rules = (rule) => rule.where ? [rule.where] : (rule.and || rule.or || []).flatMap(rules);
beforeEach(() => {
  vi.mocked(getDocs).mockReset().mockResolvedValue(snap());
  vi.mocked(query).mockClear();
});
afterEach(() => vi.restoreAllMocks());

it("preserves all name branches, ID matching, and model-only filters", async () => {
  const store = makeStore();
  await store.dispatch(liveSearch("soft Light.safetensors", nsfw, 2, false, false, false,
    filter({ modelType: ["lora", "collection"], baseModel: ["SDXL"] })));
  const modelQuery = calls()[0];
  expect(modelQuery.path).toBe("users/user-1/preview");
  const branches = modelQuery.constraints[0].or;
  expect(branches).toHaveLength(7);
  for (const branch of branches) {
    expect(rules(branch)).toContainEqual(["modelType", "in", ["lora", "collection"]]);
    expect(rules(branch)).toContainEqual(["baseModel", "in", ["SDXL"]]);
  }
  expect(rules(branches[1])).toEqual([
    ["modelType", "in", ["lora", "collection"]], ["baseModel", "in", ["SDXL"]], ["id", "==", NaN],
  ]);
  expect(branches.flatMap(rules).filter(([field, op]) => field === "name" && op === ">="))
    .toEqual(["soft Light.safetensors", "Soft Light.safetensors", "Soft Light.safetensors", "SOFT LIGHT.SAFETENSORS", "soft light.safetensors"].map((value) => ["name", ">=", value]));
  expect(rules(branches[0])).toContainEqual(["name", "<=", "soft Light.safetensors\uf8ff"]);
  expect(rules(branches[6])).toContainEqual(["nameArr", "array-contains-any", ["soft light"]]);
  expect(modelQuery.constraints.slice(1)).toEqual([{ orderBy: ["name", "asc"] }, { startAfter: "" }, { limit: 2 }]);
  expect(calls()).toHaveLength(2); // Name and secondary fields; base-model filters exclude collections.
});

it("preserves numeric ID and secondary-field rules", async () => {
  await makeStore().dispatch(liveSearch("123", { ...nsfw, nsfwValue: true }, 2));
  expect(rules(calls()[0].constraints[0])).toContainEqual(["id", "==", 123]);
  expect(rules(calls()[2].constraints[0])).toEqual([
    ["fileNames", "array-contains-any", ["123"]], ["nsfw", "in", [true, false]],
    ["customFileNames", "array-contains-any", ["123"]], ["nsfw", "in", [true, false]],
    ["mainTags", "array-contains-any", ["123"]], ["nsfw", "in", [true, false]],
    ["versionIds", "array-contains-any", [123]], ["nsfw", "in", [true, false]],
    ["authorTags", "array-contains-any", ["123", "123", "123"]], ["nsfw", "in", [true, false]],
  ]);
});

it.each([
  { hashtag: true, creator: false },
  { hashtag: false, creator: true },
  { hashtag: true, creator: true },
])("uses the existing hashtag/creator precedence: %j", async (flags) => {
  await makeStore().dispatch(liveSearch("#Portrait", nsfw, 2, false, false, false, filter(flags)));
  expect(calls()).toHaveLength(1);
  expect(rules(calls()[0].constraints[0])).toEqual([
    flags.hashtag
      ? ["authorTags", "array-contains-any", ["#Portrait", "#portrait", "Portrait"]]
      : [{ fields: ["creator", "username"] }, "==", "#Portrait"],
    ["nsfw", "in", [false]],
  ]);
});

it("supports the separate hashtag argument", async () => {
  await makeStore().dispatch(liveSearch("#Portrait", nsfw, 2, false, false, true));
  expect(calls()).toHaveLength(1);
  expect(rules(calls()[0].constraints[0])[0][0]).toBe("authorTags");
});

it("runs only collection search when collection is the sole model type", async () => {
  vi.mocked(getDocs).mockResolvedValueOnce(snap(8));
  const store = makeStore();
  await store.dispatch(liveSearch("portrait", nsfw, 2, false, false, false, filter({ modelType: ["collection"] })));
  expect(calls().map((q) => q.path)).toEqual(["users/user-1/collectionPreviews"]);
  expect(rules(calls()[0].constraints[0]).some(([field]) => field === "modelType")).toBe(false);
  expect(state(store).searchResult.result).toEqual([{ type: "collection", id: 8 }]);
});

it("waits for each request and falls back only after the name page is short", async () => {
  const store = makeStore();
  let finishName;
  vi.mocked(getDocs).mockImplementationOnce(() => new Promise((resolve) => { finishName = resolve; }));
  vi.mocked(getDocs).mockResolvedValueOnce(snap(8)).mockResolvedValueOnce(snap({ id: 1, source: "secondary" }, 2));
  const pending = store.dispatch(liveSearch("portrait", nsfw, 2));
  expect(query).toHaveBeenCalledTimes(3); // All queries are prepared before the first request.
  expect(getDocs).toHaveBeenCalledTimes(1);
  expect(state(store).isLoading).toBe(true);
  finishName(snap({ id: 1, source: "name" }));
  await pending;
  expect(calls().map((q) => q.path)).toEqual([
    "users/user-1/preview", "users/user-1/collectionPreviews", "users/user-1/preview",
  ]);
  expect(state(store).searchResult.result).toEqual([
    { id: 1, source: "secondary" }, { id: 2 }, { type: "collection", id: 8 },
  ]);
  expect(state(store)).toMatchObject({ isLastPage: true, isLastCollectionsPage: true, isLastSubPage: false, isLoading: false });
});

it("keeps three independent cursors, appends unique models, and stops when exhausted", async () => {
  const store = makeStore();
  const names = snap(1, 2);
  const collections = snap(10, 11);
  const secondary = snap(3, 4);
  vi.mocked(getDocs).mockResolvedValueOnce(names).mockResolvedValueOnce(collections)
    .mockResolvedValueOnce(snap()).mockResolvedValueOnce(snap(12)).mockResolvedValueOnce(secondary)
    .mockResolvedValueOnce(snap(4));
  await store.dispatch(liveSearch("portrait", nsfw, 2));
  expect(calls()).toHaveLength(2); // A full name page does not trigger the secondary search.
  await store.dispatch(liveSearch("portrait", nsfw, 2, true));
  expect(cursor(calls()[2])).toBe(names.docs[1]);
  expect(cursor(calls()[3])).toBe(collections.docs[1]);
  expect(cursor(calls()[4])).toBe("");
  await store.dispatch(liveSearch("portrait", nsfw, 2, true));
  expect(cursor(calls()[5])).toBe(secondary.docs[1]);
  expect(state(store).searchResult.result.map(({ id }) => id)).toEqual([1, 2, 10, 11, 3, 4, 12]);
  expect(state(store)).toMatchObject({ isLastPage: true, isLastCollectionsPage: true, isLastSubPage: true });
  await store.dispatch(liveSearch("portrait", nsfw, 2, true));
  expect(getDocs).toHaveBeenCalledTimes(6);
  expect(state(store).isLoading).toBe(false);

  store.dispatch(searchActions.resetSearchData());
  await store.dispatch(liveSearch("new search", nsfw, 2));
  expect(calls().slice(6).map(cursor)).toEqual(["", "", ""]);
  expect(state(store).searchResult.result).toEqual([]);
});

it.each([1, 2, 3])("retains existing results and cursors when request %i fails", async (failedRequest) => {
  const store = makeStore();
  const names = snap(1, 2);
  const collections = snap(10, 11);
  vi.mocked(getDocs).mockResolvedValueOnce(names).mockResolvedValueOnce(collections);
  await store.dispatch(liveSearch("portrait", nsfw, 2));
  const before = state(store).searchResult;
  for (let i = 1; i < failedRequest; i++) vi.mocked(getDocs).mockResolvedValueOnce(snap());
  vi.mocked(getDocs).mockRejectedValueOnce(new Error("Request failed"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  await store.dispatch(liveSearch("portrait", nsfw, 2, true));
  expect(state(store).searchResult).toBe(before);
  expect(state(store)).toMatchObject({ isLoading: false, errorMessage: ERROR_MESSAGE_DEFAULT, isLastPage: false, isLastCollectionsPage: false, isLastSubPage: false });
  const retryIndex = calls().length;
  await store.dispatch(liveSearch("portrait", nsfw, 2, true));
  expect(cursor(calls()[retryIndex])).toBe(names.docs[1]);
  expect(cursor(calls()[retryIndex + 1])).toBe(collections.docs[1]);
});

it.each([1, 2, 3])("preserves quick-search completion for %i total results", async (count) => {
  const store = makeStore();
  vi.mocked(getDocs).mockResolvedValueOnce(snap(...Array.from({ length: count }, (_, i) => i)));
  await store.dispatch(liveSearch("portrait", nsfw, 2, false, true));
  expect(state(store).quickSearchResult).toMatchObject({ query: "portrait", src: "aitools", nsfw, isLastPage: count <= 2 });
  expect(state(store).quickSearchResult.result).toHaveLength(count);
  expect(state(store).searchResult.result).toEqual([]);
  expect(state(store)).toMatchObject({ isLastPage: false, isLastCollectionsPage: false, isLastSubPage: false, isLoading: false });
});

it("does not prepare requests for an empty search", async () => {
  const store = makeStore();
  await store.dispatch(liveSearch("", nsfw));
  expect(query).not.toHaveBeenCalled();
  expect(getDocs).not.toHaveBeenCalled();
  expect(state(store).isLoading).toBe(false);
});
