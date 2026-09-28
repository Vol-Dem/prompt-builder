// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, fireEvent, render, renderHook, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useCollectionPreviewsController from "./use-collection-previews-controller";
import Collections from "../pages/Collections";
import imagesSlice, { imagesActions } from "../store/images";
import { getCollectionPreviews } from "../store/imagesThunks";
import { DEFAULT_PAGE_TITLE, ERROR_MESSAGE_OFFLINE } from "../variables/constants";

const connection = vi.hoisted(() => ({ online: true }));
vi.mock("./use-online-status", () => ({ useOnlineStatus: () => connection.online }));
vi.mock("../store/imagesThunks", () => ({ getCollectionPreviews: vi.fn() }));
vi.mock("../components/collection/collection-list/CollectionList", () => ({ default: () => <div>Collection previews</div> }));
vi.mock("../components/ui/lists/CategoryList", () => ({
  default: ({ children, onEdit }) => <div><ul data-testid="categories">{children}</ul><button onClick={onEdit}>Edit categories</button></div>,
}));
vi.mock("../components/ui/lists/SubcategoryList", () => ({
  default: ({ children, onEdit }) => <div><ul data-testid="subcategories">{children}</ul><button onClick={onEdit}>Edit subcategories</button></div>,
}));
vi.mock("../components/ui/Modal", () => ({
  default: ({ title, children, onClose }) => <div role="dialog" aria-label={title}>{children}<button onClick={onClose}>Close editor</button></div>,
}));
vi.mock("../components/forms/categories-form/CategoriesForm", () => ({
  default: ({ activeCategory, modelType, categories }) => <div data-testid="category-form" data-category={activeCategory ?? "none"} data-type={modelType}>{categories.length} categories</div>,
}));
vi.mock("../components/ui/Spinner", () => ({ default: () => <div role="status">Loading</div> }));

const categories = [
  { id: "animals", name: "Zoology", subcategories: [{ id: "dogs", name: "Dogs" }, { id: "cats", name: "Cats" }] },
  { id: "landscape", name: "Landscape", subcategories: [] },
];
let observers;
beforeEach(() => {
  connection.online = true;
  observers = [];
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) {
      this.callback = callback;
      this.observe = vi.fn();
      this.disconnect = vi.fn();
      observers.push(this);
    }
  });
  getCollectionPreviews.mockReset().mockImplementation(() => (dispatch) => {
    dispatch(imagesActions.setPreviewsIsLoading(true));
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const makeStore = (category = "animals", subcategory = "cats") => {
  const store = configureStore({
    reducer: {
      images: imagesSlice.reducer,
      general: (state = { nsfwMode: false }, action) => action.type === "general/setNsfwMode" ? { nsfwMode: action.payload } : state,
    },
  });
  store.dispatch(imagesActions.setImageCategories(categories));
  store.dispatch(imagesActions.setActiveCategory(category));
  store.dispatch(imagesActions.setActiveSubcategory(subcategory));
  return store;
};
const wrapperFor = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;
const mountHook = (store) => renderHook(useCollectionPreviewsController, { wrapper: wrapperFor(store) });
const intersect = (index, visible = true) => act(() => observers[index].callback([{ isIntersecting: visible }]));
const selectionEvent = (id) => {
  const target = document.createElement("li");
  target.dataset.value = id;
  return { target };
};
const seedPreviews = (store) => store.dispatch(imagesActions.setCollectionPreviews({
  category: store.getState().images.activeCategory, subcategory: store.getState().images.activeSubcategory,
  nsfw: false, data: [{ id: "saved", name: "Saved collection" }],
}));

it.each([0, 1])("loads previews through observer %s", (index) => {
  const { result } = mountHook(makeStore());
  expect(getCollectionPreviews).not.toHaveBeenCalled();
  intersect(index);
  expect(getCollectionPreviews).toHaveBeenCalledExactlyOnceWith("animals", "cats", false, false);
  expect(result.current.status.isLoading).toBe(true);
  intersect(index);
  expect(getCollectionPreviews).toHaveBeenCalledOnce();
});

it.each([["all", ""], ["landscape", ""], ["animals", "all"]])("allows selection %s/%s without a specific subcategory", (category, subcategory) => {
  mountHook(makeStore(category, subcategory));
  intersect(0);
  expect(getCollectionPreviews).toHaveBeenCalledExactlyOnceWith(category, subcategory, false, false);
});

it.each(["no category", "subcategory required", "last page", "loading", "offline"])("blocks loading for %s", (reason) => {
  const store = makeStore(reason === "no category" ? "" : "animals", reason === "subcategory required" ? "" : "cats");
  if (reason === "last page") store.dispatch(imagesActions.setIsLastPreviewsPage(true));
  if (reason === "loading") store.dispatch(imagesActions.setPreviewsIsLoading(true));
  if (reason === "offline") connection.online = false;
  mountHook(store);
  intersect(0);
  expect(getCollectionPreviews).not.toHaveBeenCalled();
});

it.each(["categories", "subcategories"])("resets previews and pagination when changing %s", (group) => {
  const store = makeStore();
  seedPreviews(store);
  store.dispatch(imagesActions.setIsLastPreviewsPage(true));
  store.dispatch(imagesActions.setPreviewsErrorMessage("Old failure"));
  const { result } = mountHook(store);
  const target = group === "categories" ? "landscape" : "dogs";
  act(() => result.current[group].onSelect(selectionEvent(target)));
  expect(store.getState().images).toMatchObject({
    activeCategory: group === "categories" ? "landscape" : "animals",
    activeSubcategory: group === "categories" ? "" : "dogs",
    collectionPreviews: null, isLastPreviewsPage: false, previewsErrorMessage: "",
  });
  intersect(0);
  expect(getCollectionPreviews.mock.calls[0][2]).toBe(false);
});

it("ignores repeated selections and targets that are not HTML elements", () => {
  const store = makeStore();
  seedPreviews(store);
  const saved = store.getState().images.collectionPreviews;
  const { result } = mountHook(store);
  act(() => {
    result.current.categories.onSelect(selectionEvent("animals"));
    result.current.subcategories.onSelect(selectionEvent("cats"));
    result.current.categories.onSelect({ target: document.createTextNode("ignored") });
    result.current.subcategories.onSelect({ target: null });
  });
  expect(store.getState().images.collectionPreviews).toBe(saved);
  expect(getCollectionPreviews).not.toHaveBeenCalled();
});

it("appends retained previews with current NSFW mode and resets a visible list for another category", () => {
  const store = makeStore();
  seedPreviews(store);
  const { result } = mountHook(store);
  act(() => store.dispatch({ type: "general/setNsfwMode", payload: true }));
  intersect(1);
  expect(getCollectionPreviews).toHaveBeenCalledExactlyOnceWith("animals", "cats", true, true);
  act(() => store.dispatch(imagesActions.setPreviewsIsLoading(false)));
  expect(getCollectionPreviews).toHaveBeenCalledOnce();
  act(() => result.current.categories.onSelect(selectionEvent("landscape")));
  expect(getCollectionPreviews).toHaveBeenCalledTimes(2);
  expect(getCollectionPreviews).toHaveBeenLastCalledWith("landscape", "", false, true);
});

it("resumes a pending intersection when loading finishes or connectivity returns", () => {
  const store = makeStore();
  store.dispatch(imagesActions.setPreviewsIsLoading(true));
  const { rerender } = mountHook(store);
  intersect(0);
  expect(getCollectionPreviews).not.toHaveBeenCalled();
  connection.online = false;
  rerender();
  act(() => store.dispatch(imagesActions.setPreviewsIsLoading(false)));
  expect(getCollectionPreviews).not.toHaveBeenCalled();
  connection.online = true;
  rerender();
  expect(getCollectionPreviews).toHaveBeenCalledOnce();
});

it("keeps sorted categories, selection, editing and the title lifecycle in the page", () => {
  const store = makeStore("animals", "");
  const { unmount } = render(<Collections title="Collections" />, { wrapper: wrapperFor(store) });
  expect(document.title).toBe("Collections");
  expect(within(screen.getByTestId("categories")).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["All", "Landscape", "Zoology"]);
  expect(within(screen.getByTestId("subcategories")).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["All", "Cats", "Dogs"]);
  expect(screen.queryByText("Collection previews")).toBeNull();
  fireEvent.click(screen.getByText("Cats"));
  expect(store.getState().images.activeSubcategory).toBe("cats");
  expect(screen.getByText("Collection previews")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Edit subcategories" }));
  expect(screen.getByTestId("category-form").getAttribute("data-category")).toBe("animals");
  expect(screen.getByTestId("category-form").getAttribute("data-type")).toBe("collections");
  fireEvent.click(screen.getByRole("button", { name: "Close editor" }));
  fireEvent.click(screen.getByRole("button", { name: "Edit categories" }));
  expect(screen.getByTestId("category-form").getAttribute("data-category")).toBe("none");
  expect(observers).toHaveLength(2);
  const end = observers[0].observe.mock.calls[0][0];
  expect(end.isConnected).toBe(true);
  expect(observers[1].observe).toHaveBeenCalledWith(end);
  unmount();
  expect(document.title).toBe(DEFAULT_PAGE_TITLE);
  expect(observers.every(({ disconnect }) => disconnect.mock.calls.length === 1)).toBe(true);
});

it("preserves the empty-collection instructions, loading and error messages", () => {
  const store = makeStore("", "");
  store.dispatch(imagesActions.setImageCategories([]));
  const { rerender } = render(<Collections title="Collections" />, { wrapper: wrapperFor(store) });
  expect(screen.getByText("You don't have any collections!")).toBeTruthy();
  act(() => {
    store.dispatch(imagesActions.setPreviewsIsLoading(true));
    store.dispatch(imagesActions.setPreviewsErrorMessage("Preview failed"));
  });
  expect(screen.getByRole("status").textContent).toBe("Loading");
  expect(screen.getByText("Preview failed")).toBeTruthy();
  connection.online = false;
  rerender(<Collections title="Collections" />);
  expect(screen.getByText(ERROR_MESSAGE_OFFLINE)).toBeTruthy();
});
