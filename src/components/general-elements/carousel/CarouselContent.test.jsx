// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import CarouselContent from "./CarouselContent";
import { deleteImgPost } from "../../../store/modelThunks";
import { updateCollectionPostsData } from "../../../store/imagesThunks";
import { updateImagePostData } from "../../../utils/fetch/fetchImages";
import { ERROR_MESSAGE_DEFAULT } from "../../../variables/constants";

const { dispatch, state } = vi.hoisted(() => ({ dispatch: vi.fn(), state: {} }));
vi.mock("../../../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector) => selector({ ...state }),
}));
vi.mock("../../../store/upload", () => ({ uploadActions: { addToQueue: vi.fn() } }));
vi.mock("../../../store/modelThunks", () => ({ deleteImgPost: vi.fn() }));
vi.mock("../../../store/imagesThunks", () => ({ updateCollectionPostsData: vi.fn() }));
vi.mock("../../../utils/fetch/fetchImages", () => ({ updateImagePostData: vi.fn() }));
vi.mock("../../../hooks/use-online-status", () => ({ useOnlineStatus: () => true }));
vi.mock("../../../hooks/use-carousel-navigation", () => ({ default: () => ({
  refs: { carouselRef: { current: null }, imagesRef: { current: null } },
  slides: { visibleAmount: 1, currImgNum: 0, visibleImages: [0], showNavigation: false, hasMultipleImages: false },
  actions: {}, gestures: {},
}) }));
vi.mock("./carousel-images/CarouselImages", () => ({
  default: ({ onDelete }) => <button onClick={onDelete}>Delete list</button>,
}));
vi.mock("./carousel-save/CarouselSave", () => ({ default: () => null }));
vi.mock("./carousel-pagination/CarouselPagination", () => ({ default: () => null }));
vi.mock("../../ui/Modal", () => ({ default: ({ children }) => <div role="dialog">{children}</div> }));
vi.mock("../../ui/ImageFullView", () => ({ default: () => null }));
vi.mock("../../ui/Spinner", () => ({ default: () => <span role="status">Deleting</span> }));
vi.mock("../../ui/forms/ImageLabel", () => ({ default: ({ children }) => <label>{children}</label> }));
vi.mock("../../forms/save-to-collection-form/SaveToCollectionForm", () => ({ default: () => null }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal(), AnimatePresence: ({ children }) => children,
}));

const images = [1, 2].map((id) => ({ id, postId: 7, url: `image-${id}.webp`, type: "image", width: 100, height: 100 }));
const modelPost = { postId: 7, imagesId: [1, 2] };
const collectionPost = { postId: 7, imageIds: [1, 2] };
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((finish, fail) => { resolve = finish; reject = fail; });
  return { promise, resolve, reject };
};
let pending;

beforeEach(() => {
  vi.clearAllMocks();
  pending = deferred();
  state.auth = { user: { uid: "user-1" } };
  state.general = { nsfwMode: false };
  state.model = { model: { id: 42, name: "Model", savedImages: { 9: [modelPost] } } };
  deleteImgPost.mockReturnValue({ type: "test/deleteModelPost" });
  updateCollectionPostsData.mockReturnValue({ type: "test/updateCollectionPost" });
  updateImagePostData.mockImplementation(() => pending.promise);
  dispatch.mockImplementation((action) => action.type.startsWith("test/") ? pending.promise : action);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const mount = (props = {}) => {
  const onDelete = vi.fn();
  render(<CarouselContent imagesData={images} postId={7} modelId={42} versionId={9}
    location="models" locationId={42} saved={true} curPostData={modelPost} onDelete={onDelete} {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Delete list" }));
  return { onDelete };
};

it.each(["all", "all selected"])("waits for the whole-model-post delete before notifying or closing: %s", async (selection) => {
  const { onDelete } = mount();
  if (selection === "all selected") fireEvent.click(screen.getByTitle("2"));
  const button = screen.getByRole("button", { name: selection === "all" ? "Delete all" : "Delete selected" });
  fireEvent.click(button);

  expect(deleteImgPost).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    postId: 7, modelId: 42, versionId: 9, location: "models", delete: true,
  }), modelPost);
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Delete all" }).disabled).toBe(true);
  expect(onDelete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Delete all" }));
  expect(deleteImgPost).toHaveBeenCalledOnce();

  await act(async () => { pending.resolve(); });

  expect(onDelete).toHaveBeenCalledExactlyOnceWith(selection === "all" ? null : [1, 2], 7);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("persists partial model-image removal before updating saved images and invoking onDelete", async () => {
  const { onDelete } = mount();
  fireEvent.click(screen.getByRole("button", { name: "Delete selected" }));

  expect(updateImagePostData).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    postId: 7, ids: [1], delete: true, postData: modelPost,
  }), [images[1]]);
  expect(deleteImgPost).not.toHaveBeenCalled();
  expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "model/updateSavedImages" }));
  expect(onDelete).not.toHaveBeenCalled();

  const updatedPost = { postId: 7, imagesId: [2] };
  await act(async () => { pending.resolve(updatedPost); });

  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "model/updateSavedImages", payload: expect.objectContaining({ data: updatedPost }) }));
  expect(onDelete).toHaveBeenCalledExactlyOnceWith([1], 7);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it.each(["all", "selected"])("waits for collection persistence before closing: %s", async (selection) => {
  const { onDelete } = mount({ location: "collections", versionId: null, curPostData: collectionPost });
  fireEvent.click(screen.getByRole("button", { name: selection === "all" ? "Delete all" : "Delete selected" }));

  expect(updateCollectionPostsData).toHaveBeenCalledExactlyOnceWith(selection === "all" ? null : [1], collectionPost);
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Delete all" }).disabled).toBe(true);

  await act(async () => { pending.resolve(); });

  expect(screen.queryByRole("dialog")).toBeNull();
  expect(onDelete).not.toHaveBeenCalled();
});

it.each(["whole model post", "partial model post", "collection post"])("keeps selection and shows a safe error after failed %s deletion, then allows retry", async (path) => {
  const { onDelete } = mount(path === "collection post" ? { location: "collections", versionId: null, curPostData: collectionPost } : {});
  const buttonName = path === "partial model post" ? "Delete selected" : "Delete all";
  fireEvent.click(screen.getByRole("button", { name: buttonName }));
  const original = new Error("Internal persistence details");

  await act(async () => { pending.reject(original); });

  expect(screen.getByTestId("error-message").textContent).toBe(ERROR_MESSAGE_DEFAULT);
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.getByTitle("1").checked).toBe(true);
  expect(screen.getByTitle("2").checked).toBe(false);
  expect(screen.getByRole("button", { name: "Delete all" }).disabled).toBe(false);
  expect(screen.queryByRole("status")).toBeNull();
  expect(onDelete).not.toHaveBeenCalled();
  expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "model/updateSavedImages" }));
  expect(console.error).toHaveBeenCalledExactlyOnceWith(original);

  pending = deferred();
  fireEvent.click(screen.getByRole("button", { name: buttonName }));
  expect(screen.queryByTestId("error-message")).toBeNull();
  expect(screen.getByRole("button", { name: "Delete all" }).disabled).toBe(true);
  await act(async () => { pending.resolve({ postId: 7, imagesId: [2] }); });

  expect(screen.queryByRole("dialog")).toBeNull();
  if (path !== "collection post") expect(onDelete).toHaveBeenCalledOnce();
});

it("uses saved model metadata when the opened carousel has no post-data prop", async () => {
  const { onDelete } = mount({ curPostData: undefined });
  fireEvent.click(screen.getByRole("button", { name: "Delete all" }));

  expect(deleteImgPost).toHaveBeenCalledWith(expect.anything(), modelPost);
  await act(async () => { pending.resolve(); });
  expect(onDelete).toHaveBeenCalledExactlyOnceWith(null, 7);
});

it.each(["models", "collections"])("does not report success without saved %s post metadata", async (location) => {
  if (location === "models") state.model.model.savedImages = {};
  const { onDelete } = mount({ location, curPostData: undefined });
  fireEvent.click(screen.getByRole("button", { name: "Delete all" }));
  await screen.findByTestId("error-message");

  expect(deleteImgPost).not.toHaveBeenCalled();
  expect(updateCollectionPostsData).not.toHaveBeenCalled();
  expect(updateImagePostData).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog")).toBeTruthy();
});
