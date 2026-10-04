// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import usePostImageImport from "./use-post-image-import";
import SaveImageForm from "../components/forms/save-image-form/SaveImageForm";
import uploadSlice from "../store/upload";
import { fetchCivitaiPostImagesForSelection } from "../utils/fetch/fetchCivitaiImages";
import {
  ERROR_MESSAGE_DEFAULT, ERROR_MESSAGE_EMPTY, ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_INVALID_POST_ID, ERROR_MESSAGE_OFFLINE,
} from "../variables/constants";

vi.mock("../utils/fetch/fetchCivitaiImages", () => ({ fetchCivitaiPostImagesForSelection: vi.fn() }));
vi.mock("../utils/fetch/fetchImages", () => ({ updateImagePostData: vi.fn() }));
vi.mock("../store/imagesThunks", () => ({ savePostToCollections: vi.fn() }));
vi.mock("../components/ui/buttons/ButtonInfo", () => ({ default: () => null }));
vi.mock("../components/ui/Spinner", () => ({ default: () => <span role="status">Loading</span> }));
vi.mock("../components/ui/forms/ImageLabel", () => ({
  default: ({ children }) => <label>{children}</label>,
}));

const images = [
  { id: 1, url: "one.webp", width: 512, height: 512, meta: { prompt: "outer", meta: { prompt: "repaired" } } },
  { id: 2, url: "two.mp4", width: 512, height: 512, type: "video" },
  { id: 3, url: "three.webp", width: 512, height: 512, type: "image" },
];
const repairedImages = [ { ...images[0], meta: { ...images[0].meta, prompt: "repaired" } }, ...images.slice(1) ];
const savedModelPost = { postId: 7, imagesId: [1] };
const collectionPost = { postId: 7, imageIds: [1] };
const model = {
  id: 42, name: "Model", data: { modelVersions: [{ id: 9, name: "First" }, { id: 10, name: "Second" }] },
  savedImages: { 9: [savedModelPost] },
};
const options = { location: "models", modelData: model, curVersion: 9, savedModelPosts: { 9: [savedModelPost] } };
let online;
beforeEach(() => {
  online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  fetchCivitaiPostImagesForSelection.mockReset().mockResolvedValue({ items: images });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const makeStore = () => configureStore({
  reducer: {
    upload: uploadSlice.reducer,
    general: (state = { nsfwMode: false, nsfwLevel: "None" }, action) =>
      action.type === "test/preferences" ? { ...state, ...action.payload } : state,
    auth: (state = { user: { uid: "user-1" } }) => state,
    model: (state = { savedImages: null }) => state,
  },
});
const wrapperFor = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;
const mountHook = (props = options) => {
  const store = makeStore();
  return { store, ...renderHook((props) => usePostImageImport(props), { initialProps: props, wrapper: wrapperFor(store) }) };
};
const changePost = (result, value = "https://civitai.com/posts/7", isValid = true) =>
  act(() => result.current.fields.postId.onChange({ target: { value } }, isValid));
const load = async (result) => act(async () => { await result.current.loadPostImages(); });

it("initializes the version from props or the first model version without rehydrating user edits", () => {
  const { result, rerender } = mountHook({ ...options, curVersion: null });
  expect(result.current.fields.version.value).toBe(9);
  expect(result.current.fields.version.options).toEqual([{ name: "First", value: 9 }, { name: "Second", value: 10 }]);
  act(() => result.current.fields.version.onChange("10"));
  act(() => result.current.fields.version.onChange(null));
  expect(result.current.fields.version.value).toBe(10);
  rerender({ ...options, curVersion: 9 });
  expect(result.current.fields.version.value).toBe(10);
});

it.each([true, false])("loads with model restriction=%s, current NSFW level and repaired metadata", async (restrict) => {
  const { result, store } = mountHook();
  act(() => {
    store.dispatch({ type: "test/preferences", payload: { nsfwLevel: "X" } });
    result.current.fields.modelFilter.onChange({ target: { checked: restrict } });
  });
  changePost(result);
  let finish;
  fetchCivitaiPostImagesForSelection.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  let pending;
  act(() => { pending = result.current.loadPostImages(); });
  expect(result.current.status).toMatchObject({ isLoading: true, showErrorMessage: true, errorMessage: "" });
  expect(result.current.selection.isOpen).toBe(false);
  expect(fetchCivitaiPostImagesForSelection).toHaveBeenCalledExactlyOnceWith({
    postId: 7, modelId: restrict ? 42 : undefined, nsfwLevel: "X",
  });
  await act(async () => { finish({ items: images }); await pending; });
  expect(result.current.selection).toMatchObject({
    isOpen: true, images: repairedImages, postData: savedModelPost, savedImageIds: [1],
  });
  expect(result.current.status.isLoading).toBe(false);
});

it("uses the selected version's saved IDs", async () => {
  const otherPost = { postId: 7, imagesId: [2] };
  const { result } = mountHook({ ...options, savedModelPosts: { 9: [savedModelPost], 10: [otherPost] } });
  act(() => result.current.fields.version.onChange(10));
  changePost(result, "7");
  await load(result);
  expect(result.current.selection).toMatchObject({ postData: otherPost, savedImageIds: [2] });
});

it("uses collection saved IDs and keeps Back limited to closing selection", async () => {
  const { result } = mountHook({ location: "collections", savedPosts: [collectionPost] });
  changePost(result, "7");
  await load(result);
  expect(result.current.fields.version.value).toBeNull();
  expect(result.current.selection).toMatchObject({ postData: collectionPost, savedImageIds: [1] });
  act(() => result.current.selection.onBack());
  expect(result.current.selection).toMatchObject({ isOpen: false, images: repairedImages, savedImageIds: [1] });
  expect(result.current.fields.postId.value).toBe("7");
  expect(result.current.status.showErrorMessage).toBe(true);
});

it("preserves saved-post state when a subsequent lookup has no saved match", async () => {
  const { result } = mountHook();
  changePost(result, "7");
  await load(result);
  act(() => result.current.selection.onBack());
  changePost(result, "8");
  await load(result);
  expect(result.current.selection).toMatchObject({ postData: savedModelPost, savedImageIds: [1], isOpen: true });
});

it("validates before connectivity and parses IDs only after those guards", async () => {
  const { result } = mountHook();
  online.mockReturnValue(false);
  await load(result);
  expect(result.current.status.errorMessage).toBe(ERROR_MESSAGE_INPUT_DEF);
  changePost(result, "invalid");
  await load(result);
  expect(result.current.status.errorMessage).toBe(ERROR_MESSAGE_OFFLINE);
  online.mockReturnValue(true);
  await load(result);
  expect(result.current.status).toMatchObject({ errorMessage: ERROR_MESSAGE_INVALID_POST_ID, isLoading: false });
  expect(fetchCivitaiPostImagesForSelection).not.toHaveBeenCalled();
});

it.each(["empty", "network"])("reports %s lookup failures and allows retry", async (failure) => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  if (failure === "empty") fetchCivitaiPostImagesForSelection.mockResolvedValueOnce({ items: [] });
  else fetchCivitaiPostImagesForSelection.mockRejectedValueOnce(new Error("Failed"));
  const { result } = mountHook();
  changePost(result);
  await load(result);
  expect(result.current.status).toMatchObject({
    isLoading: false, errorMessage: failure === "empty" ? ERROR_MESSAGE_EMPTY : ERROR_MESSAGE_DEFAULT,
  });
  expect(result.current.selection.isOpen).toBe(false);
  await load(result);
  expect(result.current.status.errorMessage).toBe("");
  expect(result.current.selection.isOpen).toBe(true);
});

it("queues the selected images in source order with current preferences and resets the lookup form", async () => {
  const { result, store } = mountHook({ ...options, savedModelPosts: { 9: [{ postId: 7, imagesId: [3] }] } });
  changePost(result);
  await load(result);
  act(() => store.dispatch({ type: "test/preferences", payload: { nsfwMode: true } }));
  await act(async () => { await result.current.selection.onSave("models", [3, 2], null); });
  expect(store.getState().upload.queue).toEqual([{
    postId: 7, modelId: 42, modelName: "Model", versionId: 9, nsfwMode: true,
    postData: savedModelPost, imgUrl: "two.mp4", imgType: "video",
    ids: [3, 2], images: images.slice(1), location: "models", collectionData: null,
  }]);
  expect(result.current.status).toMatchObject({ successMessage: "Added to download queue", showErrorMessage: false });
  expect(result.current.fields.postId).toMatchObject({ value: "", isValid: false });
  expect(result.current.selection.isOpen).toBe(false);
  expect(result.current.fields.version.value).toBe(9);
  await load(result);
  expect(result.current.status).toMatchObject({ successMessage: "", errorMessage: ERROR_MESSAGE_INPUT_DEF });
});

it.each([null, []])("queues all images with collection details when selected IDs are %j", async (ids) => {
  const { result, store } = mountHook({ location: "collections", savedPosts: [collectionPost] });
  const collectionData = { collectionData: { id: 5, name: "Collection" }, subcategoriesData: [] };
  changePost(result);
  await load(result);
  await act(async () => { await result.current.selection.onSave("collections", ids, collectionData); });
  expect(store.getState().upload.queue).toEqual([{
    postId: 7, modelId: null, modelName: null, versionId: null, nsfwMode: false,
    postData: collectionPost, imgUrl: "one.webp", imgType: "image",
    ids: [], images: repairedImages, location: "collections", collectionData,
  }]);
});

it("rejects queueing an invalid post ID without adding a queue item", async () => {
  const { result, store } = mountHook();
  await expect(result.current.selection.onSave("models", null, null)).rejects.toThrow(ERROR_MESSAGE_INVALID_POST_ID);
  expect(store.getState().upload.queue).toEqual([]);
});

const mountForm = (props = options) => {
  const store = makeStore();
  return { store, ...render(<SaveImageForm {...props} />, { wrapper: wrapperFor(store) }) };
};
const loadFromForm = async () => {
  fireEvent.change(screen.getByLabelText("Post ID or URL"), { target: { value: "7" } });
  fireEvent.click(screen.getByRole("button", { name: "Select images" }));
  await screen.findByRole("button", { name: "Save all" });
  await screen.findByTitle("1");
};

it("connects real selection to queueing and keeps saved-image checkboxes read-only", async () => {
  const { store } = mountForm();
  await loadFromForm();
  expect(screen.getByTitle("1").readOnly).toBe(true);
  fireEvent.click(screen.getByTitle("1"));
  expect(screen.getByTitle("1").checked).toBe(true);
  fireEvent.click(screen.getByTitle("2"));
  fireEvent.click(screen.getByRole("button", { name: "Save (1) selected" }));
  await screen.findByText("Added to download queue");
  expect(store.getState().upload.queue[0]).toMatchObject({ ids: [1, 2], images: [repairedImages[0], images[1]] });
  expect(screen.queryByRole("button", { name: "Save all" })).toBeNull();
  expect(screen.getByLabelText("Post ID or URL").value).toBe("");
});

it("returns from the image picker without clearing the post and queues collection details on Save all", async () => {
  const collectionInfo = { collectionData: { id: 5, name: "Collection" }, subcategoriesData: [] };
  const { store } = mountForm({ location: "collections", collectionInfo });
  await loadFromForm();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.queryByRole("button", { name: "Save all" })).toBeNull();
  expect(screen.getByLabelText("Post ID or URL").value).toBe("7");
  await loadFromForm();
  fireEvent.click(screen.getByRole("button", { name: "Save all" }));
  await screen.findByText("Added to download queue");
  expect(store.getState().upload.queue[0]).toMatchObject({ location: "collections", collectionData: collectionInfo, images: repairedImages, ids: [] });
});

it("disables lookup controls until the request finishes", async () => {
  let finish;
  fetchCivitaiPostImagesForSelection.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  mountForm();
  fireEvent.change(screen.getByLabelText("Post ID or URL"), { target: { value: "7" } });
  fireEvent.click(screen.getByRole("button", { name: "Select images" }));
  expect(screen.getByLabelText("Post ID or URL").disabled).toBe(true);
  expect(screen.getByRole("button", { name: "Loading" }).disabled).toBe(true);
  await act(async () => finish({ items: [] }));
  expect(screen.getByText(ERROR_MESSAGE_EMPTY)).toBeTruthy();
  expect(screen.getByLabelText("Post ID or URL").disabled).toBe(false);
});
