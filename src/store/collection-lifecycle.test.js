import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteDoc, getDoc, setDoc } from "firebase/firestore";

import imagesSlice, { imagesActions } from "./images";
import {
  addNewCollectionCategories,
  deleteCollection,
  updateCollectionCategories,
} from "./imagesThunks";
import { ERROR_MESSAGE_DB_CONNECTION } from "../variables/constants";

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

const categories = [{
  id: "portraits", name: "Portraits", subcategories: [{ id: "face", name: "Face" }],
  collectionNames: [
    { id: 42, name: "Faces", subcategories: ["face"] },
    { id: 43, name: "Other", subcategories: [] },
  ],
}];
const newCollection = {
  collectionData: { id: null, name: "New Collection" },
  categoryData: { id: "portraits", name: "Portraits" },
  subcategoriesData: [{ id: null, name: "Face" }],
  curCollectionSabcategories: ["face", "face"],
};
const makeStore = () => {
  const store = configureStore({ reducer: {
    images: imagesSlice.reducer,
    auth: () => ({ user: { uid: "user-1" } }),
  } });
  store.dispatch(imagesActions.setImageCategories(categories));
  return store;
};
const deferred = () => {
  let resolve;
  const promise = new Promise((finish) => { resolve = finish; });
  return { promise, resolve };
};
beforeEach(() => {
  vi.resetAllMocks();
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ imageCategories: categories }) });
  setDoc.mockResolvedValue(undefined);
  deleteDoc.mockResolvedValue(undefined);
  vi.spyOn(Date, "now").mockReturnValue(123456);
});
afterEach(() => vi.restoreAllMocks());

describe("collection category persistence", () => {
  it("merges categories into the user document before updating Redux", async () => {
    const store = makeStore();
    const pending = deferred();
    setDoc.mockReturnValue(pending.promise);
    const result = store.dispatch(updateCollectionCategories([]));
    expect(setDoc).toHaveBeenCalledExactlyOnceWith("users/user-1", { imageCategories: [] }, { merge: true });
    expect(store.getState().images.categories).toEqual(categories);
    pending.resolve();
    await result;
    expect(store.getState().images.categories).toEqual([]);
  });

  it("handles category-write failure without rejecting or updating Redux", async () => {
    const store = makeStore();
    const error = new Error("Write failed");
    vi.spyOn(console, "error").mockImplementation(() => {});
    setDoc.mockRejectedValue(error);
    await expect(store.dispatch(updateCollectionCategories([]))).resolves.toBeUndefined();
    expect(store.getState().images.categories).toEqual(categories);
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ original: error }));
  });
});

describe("collection creation", () => {
  it("uses current database categories for IDs and merges collection, preview, then categories sequentially", async () => {
    const store = makeStore();
    const latest = [...categories, { id: "latest", name: "Latest", collectionNames: [{ id: 90, name: "Latest" }] }];
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ imageCategories: latest }) });
    const pending = [deferred(), deferred(), deferred()];
    pending.forEach(({ promise }) => setDoc.mockReturnValueOnce(promise));

    const result = store.dispatch(addNewCollectionCategories(newCollection));
    await vi.waitFor(() => expect(setDoc).toHaveBeenCalledTimes(1));
    expect(getDoc).toHaveBeenCalledExactlyOnceWith("users/user-1");
    const preview = {
      id: 91, name: "New Collection", nameArr: ["new", "collection"],
      category: "portraits", nsfw: false, subcategories: ["face-1", "face"], createdAt: 123456,
    };
    expect(setDoc.mock.calls[0]).toEqual([
      "users/user-1/collections/91", { ...preview, description: "", posts: [] }, { merge: true },
    ]);
    pending[0].resolve();
    await vi.waitFor(() => expect(setDoc).toHaveBeenCalledTimes(2));
    expect(setDoc.mock.calls[1]).toEqual(["users/user-1/collectionPreviews/91", preview, { merge: true }]);
    pending[1].resolve();
    await vi.waitFor(() => expect(setDoc).toHaveBeenCalledTimes(3));
    const updatedCategories = [{
      ...categories[0],
      subcategories: [...categories[0].subcategories, { id: "face-1", name: "Face" }],
      collectionNames: [...categories[0].collectionNames, { id: 91, name: "New Collection", subcategories: ["face-1", "face"] }],
    }, latest[1]];
    expect(setDoc.mock.calls[2]).toEqual(["users/user-1", { imageCategories: updatedCategories }, { merge: true }]);
    expect(store.getState().images.categories).toEqual(categories);
    pending[2].resolve();
    await expect(result).resolves.toEqual({
      collectionData: { id: 91, name: "New Collection" },
      categoryData: newCollection.categoryData,
      subcategoriesData: [{ id: "face-1", name: "Face" }],
      curCollectionSabcategories: ["face", "face"],
    });
    expect(store.getState().images.categories).toEqual(updatedCategories);
  });

  it.each([{}, { imageCategories: [] }])("creates the first category for an existing user with %j", async (user) => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => user });
    const store = makeStore();
    const result = await store.dispatch(addNewCollectionCategories({
      ...newCollection, categoryData: { id: null, name: "Portraits" },
    }));
    expect(result.collectionData.id).toBe(1);
    expect(result.categoryData.id).toBe("portraits");
    expect(setDoc.mock.calls[0][0]).toBe("users/user-1/collections/1");
    expect(store.getState().images.categories).toHaveLength(1);
  });

  it("rejects a missing user document without writes", async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    await expect(makeStore().dispatch(addNewCollectionCategories(newCollection)))
      .rejects.toThrow(ERROR_MESSAGE_DB_CONNECTION);
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("normalizes lookup failures without writes", async () => {
    const error = new Error("Read failed");
    getDoc.mockRejectedValue(error);
    await expect(makeStore().dispatch(addNewCollectionCategories(newCollection)))
      .rejects.toMatchObject({ name: "AppError", original: error });
    expect(setDoc).not.toHaveBeenCalled();
  });

  it.each([1, 2])("stops after creation write %s fails without updating Redux", async (failedWrite) => {
    const store = makeStore();
    const error = new Error("Write failed");
    for (let i = 1; i < failedWrite; i++) setDoc.mockResolvedValueOnce(undefined);
    setDoc.mockRejectedValueOnce(error);

    await expect(store.dispatch(addNewCollectionCategories(newCollection)))
      .rejects.toMatchObject({ name: "AppError", original: error });
    expect(setDoc).toHaveBeenCalledTimes(failedWrite);
    expect(store.getState().images.categories).toEqual(categories);
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it("preserves the outer Redux update when the category write fails after document creation", async () => {
    const store = makeStore();
    vi.spyOn(console, "error").mockImplementation(() => {});
    setDoc.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Category write failed"));

    await expect(store.dispatch(addNewCollectionCategories(newCollection))).resolves.toMatchObject({
      collectionData: { id: 44 },
    });
    expect(store.getState().images.categories[0].collectionNames.at(-1).id).toBe(44);
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it("skips writes when the existing collection and categories already match", async () => {
    const params = {
      collectionData: { id: 42, name: "Faces" }, categoryData: newCollection.categoryData,
      subcategoriesData: [{ id: "face", name: "Face" }], curCollectionSabcategories: ["face"],
    };
    await expect(makeStore().dispatch(addNewCollectionCategories(params))).resolves.toEqual(params);
    expect(getDoc).toHaveBeenCalledOnce();
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("skips all persistence without a category name", async () => {
    const params = { ...newCollection, categoryData: { name: "" } };
    await expect(makeStore().dispatch(addNewCollectionCategories(params))).resolves.toEqual(params);
    expect(getDoc).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
  });
});

describe("collection deletion", () => {
  it("waits for categories, collection deletion, and preview deletion in order without updating Redux", async () => {
    const store = makeStore();
    const pending = [deferred(), deferred(), deferred()];
    setDoc.mockReturnValueOnce(pending[0].promise);
    deleteDoc.mockReturnValueOnce(pending[1].promise).mockReturnValueOnce(pending[2].promise);
    const result = store.dispatch(deleteCollection(42, "portraits"));
    expect(setDoc).toHaveBeenCalledExactlyOnceWith("users/user-1", {
      imageCategories: [{ ...categories[0], collectionNames: [categories[0].collectionNames[1]] }],
    }, { merge: true });
    expect(deleteDoc).not.toHaveBeenCalled();
    pending[0].resolve();
    await vi.waitFor(() => expect(deleteDoc).toHaveBeenCalledTimes(1));
    expect(deleteDoc).toHaveBeenLastCalledWith("users/user-1/collections/42");
    pending[1].resolve();
    await vi.waitFor(() => expect(deleteDoc).toHaveBeenCalledTimes(2));
    expect(deleteDoc).toHaveBeenLastCalledWith("users/user-1/collectionPreviews/42");
    pending[2].resolve();
    await result;
    expect(store.getState().images.categories).toEqual(categories);
  });

  it.each(["categories", "collection", "preview"])("preserves partial completion when %s fails", async (step) => {
    const store = makeStore();
    const error = new Error("Delete failed");
    if (step === "categories") setDoc.mockRejectedValue(error);
    if (step === "collection") deleteDoc.mockRejectedValueOnce(error);
    if (step === "preview") deleteDoc.mockResolvedValueOnce(undefined).mockRejectedValueOnce(error);

    await expect(store.dispatch(deleteCollection(42, "portraits")))
      .rejects.toMatchObject({ name: "AppError", original: error });
    expect(setDoc).toHaveBeenCalledOnce();
    expect(deleteDoc).toHaveBeenCalledTimes(step === "categories" ? 0 : step === "collection" ? 1 : 2);
    expect(store.getState().images.categories).toEqual(categories);
  });

  it("preserves strict category-ID matching while accepting string document IDs", async () => {
    await makeStore().dispatch(deleteCollection("42", "portraits"));
    expect(setDoc).toHaveBeenCalledWith("users/user-1", { imageCategories: categories }, { merge: true });
    expect(deleteDoc.mock.calls).toEqual([
      ["users/user-1/collections/42"], ["users/user-1/collectionPreviews/42"],
    ]);
  });
});
