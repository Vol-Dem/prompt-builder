import { configureStore } from "@reduxjs/toolkit";
import { expect, it } from "vitest";

import modelSlice, { modelActions } from "./model";
import { selectModelSavedImages } from "./modelSelectors";

const post = (postId, imagesId) => ({ postId, imagesId });
const makeStore = () => {
  const store = configureStore({ reducer: { model: modelSlice.reducer } });
  store.dispatch(modelActions.setModelData({
    id: 42, name: "Model", savedImages: { 7: [post(10, [1])] },
  }));
  return store;
};
const update = (store, versionId, data, modelId = 42) => store.dispatch(modelActions.updateSavedImages({
  postInfo: { modelId, versionId, postId: data.postId }, data,
}));

it("keeps uploaded image IDs in the model record used for persistence and its saved-image view", () => {
  const store = makeStore();
  update(store, 7, post(10, [1, 2]));
  update(store, 7, post(11, [3]));
  update(store, 8, post(12, [4]));
  const expected = { 7: [post(10, [1, 2]), post(11, [3])], 8: [post(12, [4])] };
  expect(store.getState().model.model.savedImages).toEqual(expected);
  expect(selectModelSavedImages(store.getState())).toEqual({ modelId: 42, data: expected });
});

it("removes a deleted post from the persistence record while retaining other posts and versions", () => {
  const store = makeStore();
  update(store, 7, post(11, [2]));
  update(store, 8, post(12, [3]));
  store.dispatch(modelActions.deleteSavedImages({
    postInfo: { modelId: 42, versionId: 7, postId: 10 },
  }));
  const expected = { 7: [post(11, [2])], 8: [post(12, [3])] };
  expect(store.getState().model.model.savedImages).toEqual(expected);
  expect(selectModelSavedImages(store.getState()).data).toEqual(expected);
});

it("returns no saved-image view before loading, after reset, or for a model without IDs", () => {
  const store = configureStore({ reducer: { model: modelSlice.reducer } });
  expect(selectModelSavedImages(store.getState())).toBeNull();
  store.dispatch(modelActions.setModelData({ id: 42, savedImages: {} }));
  expect(selectModelSavedImages(store.getState())).toEqual({ modelId: 42, data: {} });
  store.dispatch(modelActions.resetModelData());
  expect(selectModelSavedImages(store.getState())).toBeNull();
  store.dispatch(modelActions.setModelData({ id: 43 }));
  expect(selectModelSavedImages(store.getState())).toBeNull();
});

it("preserves the active model ID on a partial saved-image update and keeps unrelated updates stable", () => {
  const store = makeStore();
  const originalView = selectModelSavedImages(store.getState());
  store.dispatch(modelActions.updateModelDataField({ name: "Updated name" }));
  expect(selectModelSavedImages(store.getState())).toBe(originalView);
  store.dispatch(modelActions.updateModelDataField({ id: 42, name: "Same model" }));
  expect(selectModelSavedImages(store.getState())).toBe(originalView);
  const savedImages = { 7: [post(10, [1, 2])] };
  store.dispatch(modelActions.updateModelDataField({ savedImages }));
  expect(selectModelSavedImages(store.getState())).toEqual({ modelId: 42, data: savedImages });
  expect(store.getState().model.model.savedImages).toEqual(savedImages);
});

it("does not carry saved IDs across a partial update that changes model identity", () => {
  const store = makeStore();
  store.dispatch(modelActions.updateModelDataField({ id: 43 }));
  expect(selectModelSavedImages(store.getState())).toBeNull();
  expect(store.getState().model.model.savedImages).toBeUndefined();
  store.dispatch(modelActions.updateModelDataField({ id: 44, savedImages: { 9: [post(20, [5])] } }));
  expect(selectModelSavedImages(store.getState())).toEqual({ modelId: 44, data: { 9: [post(20, [5])] } });
});

it("rejects updates and deletions for the previous model after a model switch", () => {
  const store = makeStore();
  store.dispatch(modelActions.setModelData({ id: 43, savedImages: { 7: [post(10, [99])] } }));
  const before = store.getState();
  update(store, 7, post(10, [1, 2]));
  store.dispatch(modelActions.deleteSavedImages({ postInfo: { modelId: 42, versionId: 7, postId: 10 } }));
  expect(store.getState()).toBe(before);
  expect(selectModelSavedImages(store.getState())).toEqual({ modelId: 43, data: { 7: [post(10, [99])] } });
});

it("retains the guards for missing model/version IDs and missing posts", () => {
  const store = makeStore();
  const before = store.getState();
  update(store, 0, post(10, [2]));
  update(store, 7, post(10, [2]), 0);
  store.dispatch(modelActions.deleteSavedImages({ postInfo: { modelId: 42, versionId: 7, postId: 999 } }));
  expect(store.getState()).toBe(before);
});

it("replaces saved IDs only for the active model through the existing setter action", () => {
  const store = makeStore();
  const data = { 9: [post(20, [5])] };
  store.dispatch(modelActions.setSavedImages({ modelId: 42, data }));
  expect(store.getState().model.model.savedImages).toEqual(data);
  expect(selectModelSavedImages(store.getState())).toEqual({ modelId: 42, data });
  const before = store.getState();
  store.dispatch(modelActions.setSavedImages({ modelId: 43, data: {} }));
  expect(store.getState()).toBe(before);
  store.dispatch(modelActions.setModelData(null));
  store.dispatch(modelActions.setSavedImages({ modelId: 42, data }));
  expect(selectModelSavedImages(store.getState())).toBeNull();
});
