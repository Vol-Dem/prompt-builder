import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import uploadSlice, { savePost, uploadActions } from "./upload";
import { updateImagePostData } from "../utils/fetch/fetchImages";
import { savePostToCollections } from "./imagesThunks";
import { modelActions } from "./model";

vi.mock("../utils/fetch/fetchImages", () => ({ updateImagePostData: vi.fn() }));
vi.mock("./imagesThunks", () => ({ savePostToCollections: vi.fn(() => async () => {}) }));
vi.mock("./model", () => ({ modelActions: {
  updateSavedImages: vi.fn((payload) => ({ type: "model/updateSavedImages", payload })),
} }));
const fetchMock = vi.fn();
const image = (id, createdAt) => ({ id, createdAt, postId: 7, hash: `image-${id}`, nsfwLevel: "None" });
const post = { postId: 7, modelId: 42, versionId: 9, nsfwMode: false, location: "models", ids: [1, 2], collectionData: null };
const makeStore = (item) => {
  const store = configureStore({ reducer: {
    upload: uploadSlice.reducer,
    auth: () => ({ tester: false }),
  } });
  store.dispatch(uploadActions.addToQueue(item));
  return store;
};
beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(updateImagePostData).mockReset().mockResolvedValue({ postId: 7, imagesId: [2, 1] });
});
afterEach(() => vi.unstubAllGlobals());

it("fetches, filters, sorts, and persists images before completing a model upload", async () => {
  fetchMock.mockResolvedValue({ json: async () => ({ items: [image(1, "2024-01-01"), image(2, "2025-01-01"), image(3, "2026-01-01")] }) });
  let finish;
  vi.mocked(updateImagePostData).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  const store = makeStore(post);
  const pending = store.dispatch(savePost(post));
  await vi.waitFor(() => expect(updateImagePostData).toHaveBeenCalledOnce());
  expect(store.getState().upload).toMatchObject({ queue: [post], isUploading: true, curPostId: 7, completed: [] });
  expect(fetchMock).toHaveBeenCalledWith("https://civitai.com/api/v1/images?postId=7&modelId=42&modelVersionId=9&nsfw=None");
  expect(vi.mocked(updateImagePostData).mock.calls[0][1].map(({ id }) => id)).toEqual([2, 1]);
  finish({ postId: 7, imagesId: [2, 1] });
  await pending;
  expect(modelActions.updateSavedImages).toHaveBeenCalledWith({ postInfo: post, data: { postId: 7, imagesId: [2, 1] } });
  expect(store.getState().upload).toMatchObject({ queue: [], rejected: [], completed: [post], completedAmount: 1, isUploading: false, curPostId: null });
});

it("skips fetching when images are supplied and preserves collection orchestration", async () => {
  const items = [image(1, "2024-01-01"), image(1, "2024-01-01"), image(2, "2025-01-01")];
  const item = { ...post, location: "collections", images: items, collectionData: { collectionData: { id: 8, name: "Collection" } } };
  const store = makeStore(item);
  await store.dispatch(savePost(item));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(savePostToCollections).toHaveBeenCalledWith(expect.objectContaining({ postId: 7, imageIds: [1, 2], images: [items[0], items[2]] }));
  expect(modelActions.updateSavedImages).not.toHaveBeenCalled();
  expect(store.getState().upload.completed).toEqual([item]);
});

it.each(["network", "json", "empty", "missing items"])("moves an upload to rejected after %s failure", async (failure) => {
  if (failure === "network") fetchMock.mockRejectedValue(new Error("Offline"));
  else fetchMock.mockResolvedValue({ json: async () => {
    if (failure === "json") throw new SyntaxError("Invalid JSON");
    return failure === "empty" ? { items: [] } : {};
  } });
  const store = makeStore(post);
  await expect(store.dispatch(savePost(post))).rejects.toBeInstanceOf(Error);
  expect(updateImagePostData).not.toHaveBeenCalled();
  expect(store.getState().upload).toMatchObject({ queue: [], rejected: [post], completed: [], isUploading: false, curPostId: null });
});
