// @vitest-environment jsdom
import { StrictMode } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import UploadingPanel from "./UploadingPanel";
import uploadSlice, { uploadActions } from "../../../store/upload";
import { updateImagePostData } from "../../../utils/fetch/fetchImages";
import { savePostToCollections } from "../../../store/imagesThunks";

vi.mock("../../../utils/fetch/fetchImages", () => ({ updateImagePostData: vi.fn() }));
vi.mock("../../../store/imagesThunks", () => ({ savePostToCollections: vi.fn() }));
vi.mock("../../ui/image/Image", () => ({ default: ({ src }) => <img alt="Upload preview" src={src} /> }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal(), AnimatePresence: ({ children }) => children,
}));

const item = (postId, location = "models") => ({
  postId, modelId: 42, modelName: "Model", versionId: 9, nsfwMode: false,
  location, imgUrl: `image-${postId}.webp`, imgType: "image", ids: [postId],
  collectionData: location === "collections" ? { collectionData: { id: 11, name: "Collection" } } : null,
  images: [{ id: postId, postId, hash: `image-${postId}`, createdAt: "2025-01-01", nsfwLevel: "None" }],
});
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((finish, fail) => { resolve = finish; reject = fail; });
  return { promise, resolve, reject };
};
const mount = (items, { strict = false, uid = "user-1" } = {}) => {
  const store = configureStore({ reducer: {
    upload: uploadSlice.reducer,
    auth: (state = { user: { uid }, tester: false }, action) => action.type === "test/signIn"
      ? { ...state, user: { uid: action.payload } } : state,
  } });
  items.forEach((data) => store.dispatch(uploadActions.addToQueue(data)));
  const panel = <Provider store={store}><MemoryRouter><UploadingPanel /></MemoryRouter></Provider>;
  const result = render(strict ? <StrictMode>{panel}</StrictMode> : panel);
  return { ...result, store };
};

beforeEach(() => {
  vi.resetAllMocks();
  savePostToCollections.mockImplementation(() => async () => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("saves once in Strict Mode and keeps the upload active when the panel opens or closes", async () => {
  const first = item(7);
  const write = deferred();
  updateImagePostData.mockReturnValue(write.promise);
  const { store } = mount([first], { strict: true });
  expect(updateImagePostData).toHaveBeenCalledOnce();
  expect(store.getState().upload).toMatchObject({ curPostId: 7, isUploading: true, queue: [first] });
  fireEvent.click(screen.getByTitle("Uploading queue"));
  fireEvent.click(screen.getByTitle("Close"));
  expect(updateImagePostData).toHaveBeenCalledOnce();

  await act(async () => { write.resolve({ postId: 7, imagesId: [7] }); });
  expect(store.getState().upload).toMatchObject({
    queue: [], rejected: [], completed: [first], completedAmount: 1,
    curPostId: null, isUploading: false,
  });
  expect(console.error).not.toHaveBeenCalled();
});

it.each(["models", "collections"])("catches a failed %s save, continues the queue, and retries only when requested", async (location) => {
  const first = item(7, location);
  const second = item(8, location);
  const writes = [deferred(), deferred(), deferred()];
  writes.forEach((write) => updateImagePostData.mockReturnValueOnce(write.promise));
  const { store } = mount([first, second]);
  fireEvent.click(screen.getByTitle("Uploading queue"));
  const original = new Error("Internal write details");
  await act(async () => { writes[0].reject(original); });

  expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  expect(updateImagePostData).toHaveBeenCalledTimes(2);
  expect(updateImagePostData.mock.calls[1][0]).toEqual(second);
  expect(store.getState().upload).toMatchObject({
    queue: [second], rejected: [first], completed: [], completedAmount: 0,
    curPostId: 8, isUploading: true,
  });
  expect(screen.getByText("-Rejected-")).toBeTruthy();
  expect(screen.getByText("ID: 7")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Retry All" })).toBeTruthy();

  await act(async () => { writes[1].resolve({ postId: 8, imagesId: [8] }); });
  expect(store.getState().upload).toMatchObject({ queue: [], rejected: [first], completed: [second], completedAmount: 1 });
  expect(updateImagePostData).toHaveBeenCalledTimes(2);

  fireEvent.click(screen.getByRole("button", { name: "Retry All" }));
  expect(updateImagePostData).toHaveBeenCalledTimes(3);
  expect(updateImagePostData.mock.calls[2][0]).toEqual(first);
  expect(store.getState().upload).toMatchObject({ queue: [first], rejected: [], completed: [second], isUploading: true });
  expect(screen.queryByRole("button", { name: "Retry All" })).toBeNull();

  await act(async () => { writes[2].resolve({ postId: 7, imagesId: [7] }); });
  expect(store.getState().upload).toMatchObject({
    queue: [], rejected: [], completed: [first, second], completedAmount: 2,
    curPostId: null, isUploading: false,
  });
  expect(updateImagePostData).toHaveBeenCalledTimes(3);
});

it("does not start the next item before the active upload finishes, even if its current post ID clears", async () => {
  const first = item(7);
  const second = item(8);
  const writes = [deferred(), deferred()];
  writes.forEach((write) => updateImagePostData.mockReturnValueOnce(write.promise));
  const { store } = mount([first]);
  act(() => {
    store.dispatch(uploadActions.addToQueue(second));
    store.dispatch(uploadActions.setCurPostId(null));
  });
  expect(updateImagePostData).toHaveBeenCalledOnce();
  expect(store.getState().upload.isUploading).toBe(true);

  await act(async () => { writes[0].resolve({ postId: 7, imagesId: [7] }); });
  expect(updateImagePostData).toHaveBeenCalledTimes(2);
  expect(updateImagePostData.mock.calls[1][0]).toEqual(second);
  await act(async () => { writes[1].resolve({ postId: 8, imagesId: [8] }); });
  expect(store.getState().upload.completedAmount).toBe(2);
});

it("waits for sign-in before starting a queued upload", async () => {
  const write = deferred();
  updateImagePostData.mockReturnValue(write.promise);
  const { store } = mount([item(7)], { uid: "" });
  expect(updateImagePostData).not.toHaveBeenCalled();
  act(() => { store.dispatch({ type: "test/signIn", payload: "user-1" }); });
  expect(updateImagePostData).toHaveBeenCalledOnce();
  await act(async () => { write.resolve({ postId: 7, imagesId: [7] }); });
  expect(store.getState().upload.completedAmount).toBe(1);
});

it("handles rejection before persistence starts without marking an invalid post complete or retrying it", async () => {
  const invalid = item(0);
  const { store } = mount([invalid]);
  await act(async () => {});
  expect(updateImagePostData).not.toHaveBeenCalled();
  expect(store.getState().upload).toMatchObject({
    queue: [], rejected: [invalid], completed: [], completedAmount: 0,
    isUploading: false, curPostId: null,
  });
  expect(console.error).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByTitle("Uploading queue"));
  expect(screen.getByText("-Rejected-")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Retry All" })).toBeTruthy();
});
