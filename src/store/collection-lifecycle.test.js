import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteDoc, getDoc, setDoc, writeBatch } from "firebase/firestore";

import imagesSlice, { imagesActions } from "./images";
import {
  addNewCollectionCategories,
  deleteCollection,
  updateCollectionCategories,
} from "./imagesThunks";
import { ERROR_MESSAGE_DB_CONNECTION, ERROR_MESSAGE_DEFAULT } from "../variables/constants";

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(),
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
const makeStore = (uid = "user-1") => {
  const store = configureStore({ reducer: {
    images: imagesSlice.reducer,
    auth: () => ({ user: { uid } }),
  } });
  store.dispatch(imagesActions.setImageCategories(categories));
  return store;
};
const deferred = () => {
  let resolve;
  const promise = new Promise((finish) => { resolve = finish; });
  return { promise, resolve };
};
let batch;
beforeEach(() => {
  vi.resetAllMocks();
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ imageCategories: categories }) });
  setDoc.mockResolvedValue(undefined);
  deleteDoc.mockResolvedValue(undefined);
  batch = { set: vi.fn(), delete: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
  writeBatch.mockReturnValue(batch);
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

  it("rejects category-write failure with its original cause without updating Redux", async () => {
    const store = makeStore();
    const error = new Error("Write failed");
    setDoc.mockRejectedValue(error);
    await expect(store.dispatch(updateCollectionCategories([])))
      .rejects.toMatchObject({ name: "AppError", original: error, cause: error });
    expect(store.getState().images.categories).toEqual(categories);
  });

  it("rejects without writing or updating Redux when there is no uid", async () => {
    const store = makeStore("");
    await expect(store.dispatch(updateCollectionCategories([])))
      .rejects.toMatchObject({ name: "AppError", message: ERROR_MESSAGE_DEFAULT });
    expect(setDoc).not.toHaveBeenCalled();
    expect(store.getState().images.categories).toEqual(categories);
  });
});

describe("collection creation", () => {
  it("uses current database categories for IDs and commits the collection, preview, and registration together", async () => {
    const store = makeStore();
    const latest = [...categories, { id: "latest", name: "Latest", collectionNames: [{ id: 90, name: "Latest" }] }];
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ imageCategories: latest }) });
    const pending = deferred();
    batch.commit.mockReturnValue(pending.promise);

    let completed = false;
    const result = store.dispatch(addNewCollectionCategories(newCollection)).then((value) => {
      completed = true;
      return value;
    });
    await vi.waitFor(() => expect(batch.commit).toHaveBeenCalledOnce());
    expect(getDoc).toHaveBeenCalledExactlyOnceWith("users/user-1");
    const preview = {
      id: 91, name: "New Collection", nameArr: ["new", "collection"],
      category: "portraits", nsfw: false, subcategories: ["face-1", "face"], createdAt: 123456,
    };
    const updatedCategories = [{
      ...categories[0],
      subcategories: [...categories[0].subcategories, { id: "face-1", name: "Face" }],
      collectionNames: [...categories[0].collectionNames, { id: 91, name: "New Collection", subcategories: ["face-1", "face"] }],
    }, latest[1]];
    expect(batch.set.mock.calls).toEqual([
      ["users/user-1/collections/91", { ...preview, description: "", posts: [] }, { merge: true }],
      ["users/user-1/collectionPreviews/91", preview, { merge: true }],
      ["users/user-1", { imageCategories: updatedCategories }, { merge: true }],
    ]);
    expect(writeBatch).toHaveBeenCalledOnce();
    expect(setDoc).not.toHaveBeenCalled();
    expect(batch.delete).not.toHaveBeenCalled();
    expect(store.getState().images.categories).toEqual(categories);
    expect(completed).toBe(false);
    pending.resolve();
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
    expect(batch.set.mock.calls[0][0]).toBe("users/user-1/collections/1");
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(store.getState().images.categories).toHaveLength(1);
  });

  it("rejects a missing user document without writes", async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    await expect(makeStore().dispatch(addNewCollectionCategories(newCollection)))
      .rejects.toThrow(ERROR_MESSAGE_DB_CONNECTION);
    expect(setDoc).not.toHaveBeenCalled();
    expect(writeBatch).not.toHaveBeenCalled();
  });

  it("normalizes lookup failures without writes", async () => {
    const error = new Error("Read failed");
    getDoc.mockRejectedValue(error);
    await expect(makeStore().dispatch(addNewCollectionCategories(newCollection)))
      .rejects.toMatchObject({ name: "AppError", original: error });
    expect(setDoc).not.toHaveBeenCalled();
    expect(writeBatch).not.toHaveBeenCalled();
  });

  it("rejects a failed creation commit without updating Redux and can retry", async () => {
    const store = makeStore();
    const error = new Error("Write failed");
    batch.commit.mockRejectedValueOnce(error);

    await expect(store.dispatch(addNewCollectionCategories(newCollection)))
      .rejects.toMatchObject({ name: "AppError", original: error });
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(batch.set).toHaveBeenCalledTimes(3);
    expect(setDoc).not.toHaveBeenCalled();
    expect(store.getState().images.categories).toEqual(categories);
    expect(deleteDoc).not.toHaveBeenCalled();
    const result = await store.dispatch(addNewCollectionCategories(newCollection));
    expect(result.collectionData.id).toBe(44);
    expect(batch.commit).toHaveBeenCalledTimes(2);
    expect(store.getState().images.categories[0].collectionNames.at(-1)).toMatchObject({
      id: 44, name: "New Collection",
    });
  });

  it("does not commit collection documents if category registration cannot be queued", async () => {
    const store = makeStore();
    const error = new Error("Category write failed");
    batch.set.mockImplementation((path) => { if (path === "users/user-1") throw error; });

    await expect(store.dispatch(addNewCollectionCategories(newCollection)))
      .rejects.toMatchObject({ name: "AppError", original: error });
    expect(store.getState().images.categories).toEqual(categories);
    expect(batch.set).toHaveBeenCalledTimes(3);
    expect(batch.commit).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it("rejects a missing uid before reads or writes", async () => {
    await expect(makeStore("").dispatch(addNewCollectionCategories(newCollection)))
      .rejects.toMatchObject({ name: "AppError", message: ERROR_MESSAGE_DEFAULT });
    expect(getDoc).not.toHaveBeenCalled();
    expect(writeBatch).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("saves category changes for an existing collection without recreating its documents", async () => {
    const store = makeStore();
    const pending = deferred();
    setDoc.mockReturnValueOnce(pending.promise);
    const result = store.dispatch(addNewCollectionCategories({
      ...newCollection, collectionData: { id: 42, name: "Renamed" },
      subcategoriesData: [{ id: "face", name: "Face" }], curCollectionSabcategories: ["face"],
    }));
    await vi.waitFor(() => expect(setDoc).toHaveBeenCalledOnce());
    const updatedCategories = [{ ...categories[0], collectionNames: [
      { ...categories[0].collectionNames[0], name: "Renamed" }, categories[0].collectionNames[1],
    ] }];
    expect(setDoc).toHaveBeenCalledExactlyOnceWith("users/user-1", {
      imageCategories: updatedCategories,
    }, { merge: true });
    expect(writeBatch).not.toHaveBeenCalled();
    expect(store.getState().images.categories).toEqual(categories);
    pending.resolve();
    await result;
    expect(store.getState().images.categories).toEqual(updatedCategories);
  });

  it("skips writes when the existing collection and categories already match", async () => {
    const params = {
      collectionData: { id: 42, name: "Faces" }, categoryData: newCollection.categoryData,
      subcategoriesData: [{ id: "face", name: "Face" }], curCollectionSabcategories: ["face"],
    };
    await expect(makeStore().dispatch(addNewCollectionCategories(params))).resolves.toEqual(params);
    expect(getDoc).toHaveBeenCalledOnce();
    expect(setDoc).not.toHaveBeenCalled();
    expect(writeBatch).not.toHaveBeenCalled();
  });

  it("skips all persistence without a category name", async () => {
    const params = { ...newCollection, categoryData: { name: "" } };
    await expect(makeStore().dispatch(addNewCollectionCategories(params))).resolves.toEqual(params);
    expect(getDoc).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
    expect(writeBatch).not.toHaveBeenCalled();
  });
});

describe("collection deletion", () => {
  it("waits for a shared category and document deletion commit without updating Redux", async () => {
    const store = makeStore();
    const pending = deferred();
    batch.commit.mockReturnValueOnce(pending.promise);
    let completed = false;
    const result = store.dispatch(deleteCollection(42, "portraits")).then(() => { completed = true; });
    expect(batch.set).toHaveBeenCalledExactlyOnceWith("users/user-1", {
      imageCategories: [{ ...categories[0], collectionNames: [categories[0].collectionNames[1]] }],
    }, { merge: true });
    expect(batch.delete.mock.calls).toEqual([
      ["users/user-1/collections/42"], ["users/user-1/collectionPreviews/42"],
    ]);
    expect(writeBatch).toHaveBeenCalledOnce();
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(setDoc).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(store.getState().images.categories).toEqual(categories);
    await Promise.resolve();
    expect(completed).toBe(false);
    pending.resolve();
    await result;
    expect(completed).toBe(true);
    expect(store.getState().images.categories).toEqual(categories);
  });

  it("propagates a failed deletion commit without independent writes or changing Redux", async () => {
    const store = makeStore();
    const error = new Error("Delete failed");
    batch.commit.mockRejectedValueOnce(error);

    await expect(store.dispatch(deleteCollection(42, "portraits")))
      .rejects.toMatchObject({ name: "AppError", original: error });
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(setDoc).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(store.getState().images.categories).toEqual(categories);
  });

  it("does not commit the category change if a deletion cannot be queued", async () => {
    const error = new Error("Invalid preview reference");
    batch.delete.mockImplementation((path) => { if (path.includes("collectionPreviews")) throw error; });

    await expect(makeStore().dispatch(deleteCollection(42, "portraits")))
      .rejects.toMatchObject({ name: "AppError", original: error });
    expect(batch.commit).not.toHaveBeenCalled();
    expect(setDoc).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it("preserves strict category-ID matching while accepting string document IDs", async () => {
    await makeStore().dispatch(deleteCollection("42", "portraits"));
    expect(batch.set).toHaveBeenCalledWith("users/user-1", { imageCategories: categories }, { merge: true });
    expect(batch.delete.mock.calls).toEqual([
      ["users/user-1/collections/42"], ["users/user-1/collectionPreviews/42"],
    ]);
    expect(batch.commit).toHaveBeenCalledOnce();
  });
});
