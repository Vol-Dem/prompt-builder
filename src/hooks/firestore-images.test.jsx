// @vitest-environment jsdom
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getDoc, getDocs } from "firebase/firestore";
import useFetchFirestoreImages from "./use-fetch-firestore-images";
import ModelDefImages from "../components/model/model-def-images/ModelDefImages";
import imagesSlice, { getColectionImagesByIds, imagesActions } from "../store/images";
import { getVersionImagesFromCiv } from "../utils/fetch/fetchImages";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";

const { state } = vi.hoisted(() => ({ state: {} }));
vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  collection: (_, ...path) => path.join("/"),
  doc: (_, ...path) => path.join("/"),
  query: (path, ...constraints) => ({ path, constraints }),
  where: (...args) => ({ where: args }),
  orderBy: (...args) => ({ orderBy: args }),
  startAfter: (cursor) => ({ startAfter: cursor }),
  limit: (amount) => ({ limit: amount }),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
}));
vi.mock("../store/hooks/hooks", () => ({ useAppSelector: (selector) => selector(state) }));
vi.mock("../utils/fetch/fetchImages", () => ({ getVersionImagesFromCiv: vi.fn() }));
vi.mock("../components/general-elements/carousel/Carousel", () => ({
  default: ({ imagesData }) => <output data-testid="images">{imagesData.map(({ id }) => id).join(",")}</output>,
}));
vi.mock("../components/general-elements/guide/model/CarouselGuide", () => ({ default: () => null }));

const image = (id, extra = {}) => ({ id, postId: 10, hash: `hash-${id}`, nsfwLevel: "None", createdAt: "2025-01-01", ...extra });
const snap = (posts) => ({ docs: posts.map((post) => ({ data: () => post })) });
const cursor = () => vi.mocked(getDocs).mock.calls.at(-1)[0].constraints.find((item) => "startAfter" in item).startAfter;
beforeEach(() => {
  vi.mocked(getDocs).mockReset().mockResolvedValue(snap([]));
  vi.mocked(getDoc).mockReset();
  vi.mocked(getVersionImagesFromCiv).mockReset().mockResolvedValue([]);
  Object.assign(state, {
    auth: { user: { uid: "user" } },
    general: { nsfwMode: false, nsfwLevel: "None" },
    model: {
      savedImages: { data: { 7: [{ postId: 10, imagesId: [1, 2, 3] }] } },
      curVersion: { id: 7 },
      model: { id: 42, data: { creator: { username: "creator" }, modelVersions: [{ id: 7, images: [image(1), image(2)] }] } },
    },
    guide: { active: false, model: { active: false } },
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("keeps saved-image filtering, deduplication, sorting, pagination, and version resets in the hook", async () => {
  const posts = Array.from({ length: 16 }, (_, id) => ({ id, items: [] }));
  posts[0].items = [image(1), image(1), image(2, { createdAt: "2024-01-01" }), image(3, { nsfwLevel: "X" }), image(4)];
  const response = snap(posts);
  vi.mocked(getDocs).mockResolvedValueOnce(response);
  const { result, rerender } = renderHook(({ version }) => useFetchFirestoreImages(version), { initialProps: { version: 7 } });
  await act(async () => result.current.fetchFirestoreData());
  expect(cursor()).toEqual({});
  expect(result.current.fetchedData.map((post) => post.map(({ id }) => id))).toEqual([[2, 1]]);
  expect(result.current.isLastPage).toBe(false); // Based on fetched posts, including filtered-out ones.
  await act(async () => result.current.fetchFirestoreData());
  expect(cursor()).toBe(response.docs.at(-1));
  expect(result.current.isLastPage).toBe(true);
  await act(async () => result.current.fetchFirestoreData());
  expect(getDocs).toHaveBeenCalledTimes(2);
  rerender({ version: 8 });
  expect(result.current.fetchedData).toEqual([]);
  expect(result.current.isLastPage).toBe(false);
  await act(async () => result.current.fetchFirestoreData());
  expect(cursor()).toEqual({});
});

it("shows the existing hook error, clears loading, and permits a retry", async () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.mocked(getDocs).mockRejectedValueOnce(new Error("Read failed"));
  const { result } = renderHook(() => useFetchFirestoreImages(7));
  await act(async () => result.current.fetchFirestoreData());
  expect(result.current).toMatchObject({ errorMessage: ERROR_MESSAGE_DEFAULT, isFetching: false, isLastPage: false });
  await act(async () => result.current.fetchFirestoreData());
  expect(result.current).toMatchObject({ errorMessage: "", isFetching: false, isLastPage: true });
});

it.each([
  { name: "enriched document", exists: true, data: { items: [image(101, { hash: "hash-1" })] }, civ: [], expected: "101,2", calls: 0 },
  { name: "empty document", exists: true, data: { items: [] }, civ: [], expected: "1,2", calls: 0 },
  { name: "document without items", exists: true, data: {}, civ: [], expected: "1,2", calls: 0 },
  { name: "missing document", exists: false, civ: [image(3)], expected: "3", calls: 1 },
  { name: "missing document and empty Civitai results", exists: false, civ: [], expected: "1,2", calls: 1 },
])("keeps the default-image fallback for $name", async ({ exists, data, civ, expected, calls }) => {
  vi.mocked(getDoc).mockResolvedValue({ exists: () => exists, data: () => data });
  vi.mocked(getVersionImagesFromCiv).mockResolvedValue(civ);
  render(<ModelDefImages />);
  expect((await screen.findByTestId("images")).textContent).toBe(expected);
  expect(getDoc).toHaveBeenCalledWith("models/42/defaultImages/7");
  // The existing mount/reset effects can request the fallback more than once.
  if (calls) {
    expect(getVersionImagesFromCiv).toHaveBeenCalledWith(42, "creator", state.model.curVersion);
  } else {
    expect(getVersionImagesFromCiv).not.toHaveBeenCalled();
  }
});

it("keeps the default-image placeholder after a read error without starting a Civitai fallback", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(getDoc).mockRejectedValueOnce(new Error("Read failed"));
  render(<ModelDefImages />);
  await screen.findByText("Images not found");
  expect(getVersionImagesFromCiv).not.toHaveBeenCalled();
});

const makeCollectionStore = (posts) => {
  const store = configureStore({ reducer: {
    images: imagesSlice.reducer,
    auth: () => state.auth,
    general: () => state.general,
  } });
  store.dispatch(imagesActions.setCollectionData({ id: 42, posts }));
  return store;
};

it("keeps collection lookahead, ordering, selected images, and append behavior", async () => {
  const posts = Array.from({ length: 14 }, (_, i) => ({ postId: i + 1, imageIds: [i + 1], createdAt: 1000 - i }));
  const docs = posts.map(({ postId }) => ({ id: postId, items: [image(postId, { postId }), image(99, { postId })] }));
  vi.mocked(getDocs).mockResolvedValueOnce(snap(docs.slice(0, 13).reverse())).mockResolvedValueOnce(snap(docs.slice(12).reverse()));
  const store = makeCollectionStore(posts);
  await store.dispatch(getColectionImagesByIds(posts, 42));
  const first = store.getState().images.collectionImages;
  expect(first.images.flat().map(({ id }) => id)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
  expect(first).toMatchObject({ lastVisibleId: 13, isLastPage: false });
  expect(vi.mocked(getDocs).mock.calls[0][0].constraints[0]).toEqual({ where: ["id", "in", posts.slice(0, 13).map(({ postId }) => postId)] });
  await store.dispatch(getColectionImagesByIds(posts, 42));
  expect(store.getState().images.collectionImages.images.flat().map(({ id }) => id)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
  expect(store.getState().images.collectionImages).toMatchObject({ lastVisibleId: 14, isLastPage: true });
  await store.dispatch(getColectionImagesByIds(posts, 42));
  expect(getDocs).toHaveBeenCalledTimes(2);
});

it("bases collection completion on requested IDs even when no documents match", async () => {
  const posts = Array.from({ length: 13 }, (_, i) => ({ postId: i + 1 }));
  const store = makeCollectionStore(posts);
  await store.dispatch(getColectionImagesByIds(posts, 42));
  expect(store.getState().images.collectionImages).toMatchObject({ images: [], lastVisibleId: 13, isLastPage: false });
});

it("preserves collection state and normalized rejection on read failure", async () => {
  const store = makeCollectionStore([{ postId: 1 }]);
  const before = store.getState().images;
  const error = new Error("Read failed");
  vi.mocked(getDocs).mockRejectedValueOnce(error);
  await expect(store.dispatch(getColectionImagesByIds([{ postId: 1 }], 42))).rejects.toMatchObject({ original: error });
  expect(store.getState().images).toBe(before);
});
