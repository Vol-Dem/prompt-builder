import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDoc, setDoc, writeBatch } from "firebase/firestore";

import imagesSlice, { imagesActions } from "./images";
import {
  editCollectionData,
  savePostToCollections,
  updateCollectionPostsData,
} from "./imagesThunks";

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  writeBatch: vi.fn(),
  arrayUnion: (...values) => ({ union: values }),
  arrayRemove: (...values) => ({ remove: values }),
}));

const collectionPath = "users/user-1/collections/42";
const previewPath = "users/user-1/collectionPreviews/42";
const posts = [
  { postId: 7, imageIds: [1, 2], createdAt: "2025-01-01" },
  { postId: 8, imageIds: [3], createdAt: "2025-02-01" },
];
const image = (id, postId = 7) => ({ id, postId, createdAt: `2025-01-0${id}` });
const categories = [{
  id: "portraits", name: "Portraits",
  subcategories: [{ id: "face", name: "Face" }],
  collectionNames: [{ id: 42, name: "Before", subcategories: ["face"] }],
}];
const collection = {
  id: 42, name: "Before", nameArr: ["before"], category: "portraits",
  subcategories: ["face"], nsfw: false, description: "Old description", createdAt: 100, posts,
};
const editParams = {
  collectionData: { id: 42, name: "New Collection" },
  categoryData: { id: "portraits", name: "Portraits" },
  subcategoriesData: [{ id: "face", name: "Face" }],
  description: "New description", nsfw: true,
};
const postParams = () => ({
  collectionData: { id: 42, name: "Before" },
  subcategoriesData: [{ id: "face", name: "Face" }],
  postId: 7, imageIds: [2, 1], images: [image(2), image(1)],
});
const makeStore = () => {
  const store = configureStore({ reducer: {
    images: imagesSlice.reducer,
    auth: () => ({ user: { uid: "user-1" } }),
  } });
  store.dispatch(imagesActions.setImageCategories(categories));
  store.dispatch(imagesActions.setCollectionData(collection));
  store.dispatch(imagesActions.setCollectionImages({
    collectionId: 42, images: [[image(1), image(2)], [image(3, 8)]], isLastPage: false,
  }));
  return store;
};
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};
let batch;

beforeEach(() => {
  vi.resetAllMocks();
  batch = { update: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
  writeBatch.mockReturnValue(batch);
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ imageCategories: categories }) });
  setDoc.mockResolvedValue(undefined);
  vi.spyOn(Date, "now").mockReturnValue(123456);
});
afterEach(() => vi.restoreAllMocks());

describe("saving collection posts", () => {
  it.each([false, true])("batches post and preview changes with replacement=%s", async (replace) => {
    const store = makeStore();
    const previousPost = { postId: 7, imagesId: [1, 2] };
    const params = { ...postParams(), ...(replace ? { postData: previousPost } : {}) };
    const pending = deferred();
    batch.commit.mockReturnValue(pending.promise);
    const before = store.getState().images;

    const result = store.dispatch(savePostToCollections(params));
    const newPost = { postId: 7, imageIds: [2, 1], createdAt: 123456 };
    expect(batch.update.mock.calls).toEqual([
      ...(replace ? [[collectionPath, { posts: { remove: [previousPost] } }]] : []),
      [collectionPath, { subcategories: { union: ["face"] }, posts: { union: [newPost] } }],
      [previewPath, { subcategories: { union: ["face"] } }],
    ]);
    expect(writeBatch).toHaveBeenCalledOnce();
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(store.getState().images).toBe(before);
    pending.resolve();
    await result;

    expect(store.getState().images.collectionData.posts).toEqual([posts[1], newPost]);
    expect(store.getState().images.collectionImages.images).toEqual([
      [image(1), image(2)], [image(3, 8)],
    ]);
  });

  it("preserves empty subcategory unions and marks the first saved post as the last page", async () => {
    const store = makeStore();
    store.dispatch(imagesActions.setCollectionData({ ...collection, posts: [] }));
    store.dispatch(imagesActions.setCollectionImages({ images: [], isLastPage: false }));

    await store.dispatch(savePostToCollections({ ...postParams(), subcategoriesData: [] }));

    expect(batch.update.mock.calls[0][1].subcategories).toEqual({ union: [] });
    expect(store.getState().images.collectionImages).toEqual({
      collectionId: 42, images: [[image(1), image(2)]], isLastPage: true,
    });
  });

  it("does not change displayed data when the current collection has another image collection loaded", async () => {
    const store = makeStore();
    store.dispatch(imagesActions.setCollectionImages({
      collectionId: 99, images: [[image(3, 8)]], isLastPage: false,
    }));
    const before = store.getState().images;
    await store.dispatch(savePostToCollections(postParams()));
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(store.getState().images).toBe(before);
  });

  it("normalizes a failed commit without updating local posts or images", async () => {
    const store = makeStore();
    const before = store.getState().images;
    const error = new Error("Commit failed");
    batch.commit.mockRejectedValue(error);

    await expect(store.dispatch(savePostToCollections(postParams()))).rejects.toMatchObject({
      name: "AppError", original: error,
    });
    expect(store.getState().images).toBe(before);
  });

  it("rejects an invalid post before creating a batch", async () => {
    await expect(makeStore().dispatch(savePostToCollections({ ...postParams(), postId: 0 })))
      .rejects.toThrow("Invalid post ID");
    expect(writeBatch).not.toHaveBeenCalled();
  });
});

describe("collection metadata edits", () => {
  it("persists categories first, updates local metadata, then commits both documents together", async () => {
    const store = makeStore();
    const categorySave = deferred();
    const metadataSave = deferred();
    setDoc.mockReturnValue(categorySave.promise);
    batch.commit.mockReturnValue(metadataSave.promise);

    const result = store.dispatch(editCollectionData(editParams));
    await vi.waitFor(() => expect(setDoc).toHaveBeenCalledOnce());
    expect(batch.commit).not.toHaveBeenCalled();
    expect(store.getState().images.collectionData).toEqual(collection);
    expect(store.getState().images.collectionDataIsSaving).toBe(true);
    expect(setDoc).toHaveBeenCalledWith("users/user-1", {
      imageCategories: [{ ...categories[0], collectionNames: [
        { id: 42, name: "New Collection", subcategories: ["face"] },
      ] }],
    }, { merge: true });

    categorySave.resolve();
    await vi.waitFor(() => expect(batch.commit).toHaveBeenCalledOnce());
    const preview = {
      name: "New Collection", nameArr: ["new", "collection"],
      category: "portraits", subcategories: ["face"], nsfw: true,
    };
    const metadata = { ...preview, description: "New description" };
    expect(batch.update.mock.calls).toEqual([
      [previewPath, preview], [collectionPath, metadata],
    ]);
    expect(writeBatch).toHaveBeenCalledOnce();
    expect(store.getState().images.collectionData).toEqual({ ...collection, ...metadata });
    expect(store.getState().images.collectionDataIsSaving).toBe(true);
    metadataSave.resolve();
    await result;
    expect(store.getState().images.collectionDataIsSaving).toBe(false);
  });

  it("keeps the optimistic edit and clears the saving flag after a failed commit", async () => {
    const store = makeStore();
    const error = new Error("Commit failed");
    batch.commit.mockRejectedValue(error);

    await expect(store.dispatch(editCollectionData(editParams))).rejects.toMatchObject({
      name: "AppError", original: error,
    });
    expect(store.getState().images.collectionData).toMatchObject({
      name: "New Collection", description: "New description", nsfw: true,
    });
    expect(store.getState().images.collectionDataIsSaving).toBe(false);
  });

  it("does not save metadata if the category lookup fails", async () => {
    const store = makeStore();
    getDoc.mockRejectedValue(new Error("Read failed"));

    await expect(store.dispatch(editCollectionData(editParams))).rejects.toThrow("Read failed");
    expect(batch.commit).not.toHaveBeenCalled();
    expect(store.getState().images.collectionData).toEqual(collection);
    expect(store.getState().images.collectionDataIsSaving).toBe(false);
  });

  it.each(["collectionData", "categoryData"])("skips unnamed %s", async (field) => {
    const store = makeStore();
    await store.dispatch(editCollectionData({ ...editParams, [field]: { ...editParams[field], name: "" } }));
    expect(getDoc).not.toHaveBeenCalled();
    expect(writeBatch).not.toHaveBeenCalled();
    expect(store.getState().images.collectionData).toEqual(collection);
    expect(store.getState().images.collectionDataIsSaving).toBe(false);
  });
});

describe("removing collection post images", () => {
  it.each([
    { name: "some images", ids: [1], remaining: [{ ...posts[0], imageIds: [2] }, posts[1]], images: [[image(2)], [image(3, 8)]] },
    { name: "all images", ids: [1, 2], remaining: [posts[1]], images: [[image(3, 8)]] },
    { name: "whole post", ids: null, remaining: [posts[1]], images: [[image(3, 8)]] },
    { name: "empty selection", ids: [], remaining: [posts[1]], images: [[image(3, 8)]] },
  ])("saves $name removal before updating local posts and images", async ({ ids, remaining, images }) => {
    const store = makeStore();
    const before = store.getState().images;
    const pending = deferred();
    batch.commit.mockReturnValue(pending.promise);

    const result = store.dispatch(updateCollectionPostsData(ids, posts[0]));
    expect(batch.update.mock.calls).toEqual([[collectionPath, { posts: remaining }]]);
    expect(writeBatch).toHaveBeenCalledOnce();
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(store.getState().images).toBe(before);
    pending.resolve();
    await result;
    expect(store.getState().images.collectionData.posts).toEqual(remaining);
    expect(store.getState().images.collectionImages.images).toEqual(images);
  });

  it("handles commit failure without rejecting or changing local state", async () => {
    const store = makeStore();
    const before = store.getState().images;
    const error = new Error("Commit failed");
    vi.spyOn(console, "error").mockImplementation(() => {});
    batch.commit.mockRejectedValue(error);

    await expect(store.dispatch(updateCollectionPostsData([1], posts[0]))).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ name: "AppError", original: error }));
    expect(store.getState().images).toBe(before);
  });

  it("skips persistence when no collection is loaded", async () => {
    const store = makeStore();
    store.dispatch(imagesActions.setCollectionData(null));

    await expect(store.dispatch(updateCollectionPostsData([1], posts[0]))).resolves.toBeUndefined();
    expect(writeBatch).not.toHaveBeenCalled();
  });
});
