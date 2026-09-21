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

  it("handles a failed preview write without rejecting or changing Redux", async () => {
    const store = makeStore();
    const before = store.getState().model;
    const error = new Error("Write failed");
    vi.spyOn(console, "error").mockImplementation(() => {});
    setDoc.mockRejectedValue(error);
    await expect(store.dispatch(setPreviewImg("preview.webp", false, "models", 42)))
      .resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ original: error }));
    expect(store.getState().model).toBe(before);
  });

  it("skips persistence for an invalid preview URL", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await makeStore().dispatch(setPreviewImg("", false, "models", 42));
    expect(setDoc).not.toHaveBeenCalled();
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
    await expect(store.dispatch(setTagSetPreviewImg("9", []))).rejects.toBe(error);
    expect(store.getState().model).toBe(before);
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
    expect(store.getState().model.savedImages.data[9]).toEqual([]);
  });

  it.each(["read", "post write", "model write"])("handles %s failure and keeps Redux unchanged", async (stage) => {
    const store = makeStore();
    const before = store.getState().model;
    const error = new Error("Deletion failed");
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (stage === "read") getDoc.mockRejectedValue(error);
    if (stage === "post write") deleteDoc.mockRejectedValue(error);
    if (stage === "model write") updateDoc.mockRejectedValue(error);
    await expect(store.dispatch(deleteImgPost(postInfo, post))).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ original: error }));
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
  it("writes the selected model-type field without changing Redux", async () => {
    const store = makeStore();
    const before = store.getState().model;
    const categories = [{ id: "portrait", name: "Portrait" }];
    await store.dispatch(updateCategories("lora", categories));
    expect(updateDoc).toHaveBeenCalledExactlyOnceWith("users/user-1", { "categoriesById.lora": categories });
    expect(store.getState().model).toBe(before);
  });

  it("skips writes without a uid", async () => {
    await makeStore(model, "").dispatch(updateCategories("lora", []));
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("propagates category write failures", async () => {
    const error = new Error("Write failed");
    updateDoc.mockRejectedValue(error);
    await expect(makeStore().dispatch(updateCategories("lora", []))).rejects.toBe(error);
  });
});
