import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteDoc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import modelSlice, { modelActions } from "./model";
import {
  deleteImgPost,
  deleteModel,
  setPreviewImg,
  setTagSetPreviewImg,
  updateCategories,
} from "./modelThunks";
import { deleteImagePostDocs } from "../utils/fetch/fetchImages";
import { makeBatchRequest } from "../utils/fetch/fetchUtils";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  arrayRemove: (...values) => ({ remove: values }),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}));
vi.mock("../utils/fetch/fetchImages", () => ({ deleteImagePostDocs: vi.fn() }));
vi.mock("../utils/fetch/fetchUtils", () => ({ makeBatchRequest: vi.fn() }));

const post = { postId: 7, imagesId: [1, 2] };
const postInfo = { postId: 7, modelId: 42, versionId: 9 };
const model = {
  id: 42, name: "Model",
  savedImages: { 9: [post] },
  defaultCustomData: { mainTag: "default", tagSetsData: [] },
  modelVersionsCustomData: { 9: { versionId: 9, mainTag: "version", tagSetsData: [] } },
};
const modelPath = "users/user-1/models/42";
const postPath = "users/user-1/images/7";
const makeStore = (data = model, uid = "user-1") => {
  const store = configureStore({ reducer: {
    model: modelSlice.reducer,
    auth: () => ({ user: { uid } }),
  } });
  store.dispatch(modelActions.setModelData(data));
  return store;
};
const deferred = () => {
  let resolve;
  const promise = new Promise((finish) => { resolve = finish; });
  return { promise, resolve };
};

beforeEach(() => {
  vi.resetAllMocks();
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ versionsId: [9] }) });
  setDoc.mockResolvedValue(undefined);
  updateDoc.mockResolvedValue(undefined);
  deleteDoc.mockResolvedValue(undefined);
  makeBatchRequest.mockResolvedValue([]);
});
afterEach(() => vi.restoreAllMocks());

describe("preview mutations", () => {
  it.each([
    ["models", false, "image", "preview", "customPreviewImgUrl", "customPreviewImgType"],
    ["models", true, "video", "preview", "nsfwPreviewImgUrl", "nsfwPreviewImgType"],
    ["collections", false, "video", "collectionPreviews", "customPreviewImgUrl", "customPreviewImgType"],
    ["collections", true, "image", "collectionPreviews", "nsfwPreviewImgUrl", "nsfwPreviewImgType"],
  ])("saves %s preview with nsfw=%s", async (location, nsfw, type, path, urlField, typeField) => {
    const store = makeStore();
    const before = store.getState().model;
    await store.dispatch(setPreviewImg("preview.webp", nsfw, location, 42, type));
    expect(setDoc).toHaveBeenCalledExactlyOnceWith(`users/user-1/${path}/42`, {
      [urlField]: "preview.webp", [typeField]: type,
    }, { merge: true });
    expect(store.getState().model).toBe(before);
  });

  it("rejects a failed preview write with its original cause without changing Redux", async () => {
    const store = makeStore();
    const before = store.getState().model;
    const error = new Error("Write failed");
    setDoc.mockRejectedValue(error);
    await expect(store.dispatch(setPreviewImg("preview.webp", false, "models", 42)))
      .rejects.toMatchObject({ name: "AppError", original: error, cause: error });
    expect(store.getState().model).toBe(before);
  });

  it("skips persistence for an invalid preview URL", async () => {
    await expect(makeStore().dispatch(setPreviewImg("", false, "models", 42)))
      .rejects.toMatchObject({ message: ERROR_MESSAGE_DEFAULT });
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("does not write previews without a signed-in user", async () => {
    const store = makeStore(model, "");
    await expect(store.dispatch(setPreviewImg("preview.webp", false, "models", 42)))
      .rejects.toMatchObject({ message: ERROR_MESSAGE_DEFAULT });
    await expect(store.dispatch(setTagSetPreviewImg("9", [])))
      .rejects.toMatchObject({ message: ERROR_MESSAGE_DEFAULT });
    expect(setDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it.each(["tsv-def", "9"])("updates %s tag-set data only after persistence succeeds", async (version) => {
    const store = makeStore();
    const before = store.getState().model;
    const tagSets = [{ name: "Tags", value: "portrait", imgUrl: "preview.webp" }];
    const pending = deferred();
    updateDoc.mockReturnValue(pending.promise);
    const result = store.dispatch(setTagSetPreviewImg(version, tagSets));
    const field = version === "tsv-def" ? "defaultCustomData" : "modelVersionsCustomData.9";
    expect(updateDoc).toHaveBeenCalledExactlyOnceWith(modelPath, { [`${field}.tagSetsData`]: tagSets });
    expect(store.getState().model).toBe(before);
    pending.resolve();
    await result;
    const data = store.getState().model.model;
    expect(data).toEqual(version === "tsv-def"
      ? { ...model, defaultCustomData: { ...model.defaultCustomData, tagSetsData: tagSets } }
      : { ...model, modelVersionsCustomData: { 9: { ...model.modelVersionsCustomData[9], tagSetsData: tagSets } } });
  });

  it("propagates tag-set write failures without updating Redux", async () => {
    const store = makeStore();
    const before = store.getState().model;
    const error = new Error("Write failed");
    updateDoc.mockRejectedValue(error);
    await expect(store.dispatch(setTagSetPreviewImg("9", [])))
      .rejects.toMatchObject({ name: "AppError", original: error, cause: error });
    expect(store.getState().model).toBe(before);
  });

  it("does not write tag-set previews without a current model", async () => {
    await expect(makeStore(null).dispatch(setTagSetPreviewImg("9", [])))
      .rejects.toMatchObject({ message: ERROR_MESSAGE_DEFAULT });
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it.each([null, { ...model, id: 99 }])("does not apply a completed tag-set write to a different model: %j", async (nextModel) => {
    const store = makeStore();
    const pending = deferred();
    updateDoc.mockReturnValue(pending.promise);
    const result = store.dispatch(setTagSetPreviewImg("9", [{ name: "Tags", imgUrl: "preview.webp" }]));
    store.dispatch(modelActions.setModelData(nextModel));
    const before = store.getState().model;
    pending.resolve();
    await result;
    expect(store.getState().model).toBe(before);
  });

  it.each(["tsv-def", "9"])("preserves other model fields changed during a %s preview write", async (version) => {
    const store = makeStore();
    const pending = deferred();
    const tagSets = [{ name: "Tags", imgUrl: "preview.webp" }];
    updateDoc.mockReturnValue(pending.promise);
    const result = store.dispatch(setTagSetPreviewImg(version, tagSets));
    const nextModel = {
      ...model,
      defaultCustomData: { ...model.defaultCustomData, mainTag: "updated default" },
      modelVersionsCustomData: { 9: { ...model.modelVersionsCustomData[9], mainTag: "updated version" } },
    };
    store.dispatch(modelActions.setModelData(nextModel));
    pending.resolve();
    await result;
    const data = store.getState().model.model;
    expect(data.defaultCustomData.mainTag).toBe("updated default");
    expect(data.modelVersionsCustomData[9].mainTag).toBe("updated version");
    expect(version === "tsv-def" ? data.defaultCustomData.tagSetsData : data.modelVersionsCustomData[9].tagSetsData)
      .toEqual(tagSets);
  });
});

describe("saved-post deletion", () => {
  it.each([
    { name: "last version", exists: true, versionsId: [9], operation: "delete" },
    { name: "shared post", exists: true, versionsId: [9, 10], operation: "update" },
    { name: "missing post", exists: false, versionsId: [], operation: null },
  ])("handles a $name before changing saved-image state", async ({ exists, versionsId, operation }) => {
    const store = makeStore();
    const before = store.getState().model;
    const postWrite = deferred();
    const modelWrite = deferred();
    getDoc.mockResolvedValue({ exists: () => exists, data: () => ({ versionsId }) });
    if (operation === "delete") deleteDoc.mockReturnValueOnce(postWrite.promise);
    if (operation === "update") updateDoc.mockReturnValueOnce(postWrite.promise);
    updateDoc.mockReturnValueOnce(modelWrite.promise);

    const result = store.dispatch(deleteImgPost(postInfo, post));
    expect(getDoc).toHaveBeenCalledExactlyOnceWith(postPath);
    if (operation) {
      await vi.waitFor(() => expect(operation === "delete" ? deleteDoc : updateDoc).toHaveBeenCalledOnce());
      expect(updateDoc).not.toHaveBeenCalledWith(modelPath, expect.anything());
      postWrite.resolve();
    }
    await vi.waitFor(() => expect(updateDoc).toHaveBeenCalledWith(modelPath, {
      "savedImages.9": { remove: [post] },
    }));
    if (operation === "delete") expect(deleteDoc).toHaveBeenCalledExactlyOnceWith(postPath);
    if (operation === "update") expect(updateDoc.mock.calls[0]).toEqual([postPath, { versionsId: { remove: [9] } }]);
    if (!operation) expect(deleteDoc).not.toHaveBeenCalled();
    expect(store.getState().model).toBe(before);
    modelWrite.resolve();
    await result;
    expect(store.getState().model.model.savedImages[9]).toEqual([]);
  });

  it.each(["read", "post write", "model write"])("rejects %s failure and keeps Redux unchanged", async (stage) => {
    const store = makeStore();
    const before = store.getState().model;
    const error = new Error("Deletion failed");
    if (stage === "read") getDoc.mockRejectedValue(error);
    if (stage === "post write") deleteDoc.mockRejectedValue(error);
    if (stage === "model write") updateDoc.mockRejectedValue(error);
    await expect(store.dispatch(deleteImgPost(postInfo, post))).rejects.toMatchObject({ name: "AppError", original: error });
    expect(store.getState().model).toBe(before);
    if (stage !== "model write") expect(updateDoc).not.toHaveBeenCalled();
  });
});

describe("model deletion", () => {
  it("keeps image cleanup independent and deletes the model before its preview", async () => {
    const store = makeStore();
    const before = store.getState().model;
    const cleanup = deferred();
    const deletion = deferred();
    makeBatchRequest.mockReturnValue(cleanup.promise);
    deleteDoc.mockReturnValueOnce(deletion.promise);
    const result = store.dispatch(deleteModel());
    expect(makeBatchRequest).toHaveBeenCalledExactlyOnceWith([
      { ...post, uid: "user-1", modelId: 42, type: "defaultImages" },
    ], deleteImagePostDocs, 5, false);
    expect(deleteDoc).toHaveBeenCalledExactlyOnceWith(modelPath);
    deletion.resolve();
    await result;
    expect(deleteDoc.mock.calls).toEqual([[modelPath], ["users/user-1/preview/42"]]);
    expect(store.getState().model).toBe(before);
    cleanup.resolve([]);
    await cleanup.promise;
  });

  it.each([null, { id: 42 }])("skips deletion without saved-image data: %j", async (data) => {
    await makeStore(data).dispatch(deleteModel());
    expect(makeBatchRequest).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it("propagates model deletion failure before attempting the preview", async () => {
    const error = new Error("Delete failed");
    deleteDoc.mockRejectedValue(error);
    await expect(makeStore().dispatch(deleteModel())).rejects.toBe(error);
    expect(deleteDoc).toHaveBeenCalledExactlyOnceWith(modelPath);
  });
});

describe("model category updates", () => {
  it("waits for the selected model-type field write without changing Redux", async () => {
    const store = makeStore();
    const before = store.getState().model;
    const categories = [{ id: "portrait", name: "Portrait" }];
    const pending = deferred();
    updateDoc.mockReturnValueOnce(pending.promise);
    let completed = false;
    const result = store.dispatch(updateCategories("lora", categories)).then(() => { completed = true; });
    expect(updateDoc).toHaveBeenCalledExactlyOnceWith("users/user-1", { "categoriesById.lora": categories });
    expect(store.getState().model).toBe(before);
    await Promise.resolve();
    expect(completed).toBe(false);
    pending.resolve();
    await result;
    expect(completed).toBe(true);
  });

  it("rejects without writing when there is no uid", async () => {
    await expect(makeStore(model, "").dispatch(updateCategories("lora", [])))
      .rejects.toMatchObject({ name: "AppError", message: ERROR_MESSAGE_DEFAULT });
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("propagates category write failures", async () => {
    const error = new Error("Write failed");
    updateDoc.mockRejectedValue(error);
    await expect(makeStore().dispatch(updateCategories("lora", [])))
      .rejects.toMatchObject({ name: "AppError", original: error, cause: error });
  });
});
