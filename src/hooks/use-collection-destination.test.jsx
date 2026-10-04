// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useCollectionDestination from "./use-collection-destination";
import SaveToCollectionForm from "../components/forms/save-to-collection-form/SaveToCollectionForm";
import imagesSlice, { imagesActions } from "../store/images";
import { addNewCollectionCategories } from "../store/imagesThunks";
import { getCollectionData } from "../utils/fetch/fetchCollection";
import { AppError } from "../utils/generalUtils";
import { ERROR_MESSAGE_DEFAULT, ERROR_MESSAGE_INPUT_DEF, SUCCESS_MESSAGE_SAVED } from "../variables/constants";

const { picker } = vi.hoisted(() => ({ picker: { current: null } }));
vi.mock("../store/imagesThunks", () => ({ addNewCollectionCategories: vi.fn() }));
vi.mock("../utils/fetch/fetchCollection", () => ({ getCollectionData: vi.fn() }));
vi.mock("../components/ui/Spinner", () => ({ default: () => <span role="status">Preparing</span> }));
// Keep the form's filtering and selection handlers, replacing only combobox UI.
vi.mock("../components/ui/forms/ComboSelect", () => ({
  default: ({ label, placeholder, query, setQuery, optionsData, selected, setSelected, id }) => {
    const name = label || placeholder;
    return <div>
      <input aria-label={name} value={selected?.name || ""} onChange={(e) => {
        const value = optionsData.find((option) => option.name === e.target.value) || { id: null, name: e.target.value };
        setSelected(value, !!value.name, "", id);
      }} />
      <input aria-label={name + " query"} value={query} onChange={(e) => setQuery(e.target.value)} />
      <output data-testid={name + " options"}>{optionsData.map((option) => option.name).join(",")}</output>
    </div>;
  },
}));
vi.mock("../components/forms/save-to-collection-form/SuggestedCollections", () => ({
  default: ({ onSelect }) => <button onClick={() => onSelect({
    categoryId: "people", categoryName: "People", collectionId: 5, collectionName: "Portraits",
  })}>Use suggested collection</button>,
}));
vi.mock("../components/forms/choose-image-form/ChooseImageForm", () => ({
  default: (props) => {
    picker.current = props;
    return <button onClick={() => props.onSave(props.location, [2], props.collectionInfo, props.postData)}>Save chosen images</button>;
  },
}));

const categories = [{
  id: "people", name: "People", subcategories: [{ id: "face", name: "Face" }, { id: "pose", name: "Pose" }],
  collectionNames: [{ id: 5, name: "Portraits", subcategories: ["face"] }, { id: 6, name: "Poses", subcategories: ["pose"] }],
}];
const savedPost = { postId: 7, imageIds: [1], createdAt: 100 };
const prepared = {
  collectionData: { id: 5, name: "Portraits" }, categoryData: { id: "people", name: "People" },
  subcategoriesData: [{ id: "face", name: "Face" }], curCollectionSabcategories: ["existing"],
};
const selection = (overrides = {}) => ({
  mainCategorySelected: { id: "people", name: " People ", isValid: true },
  collectionNameSelected: { id: 5, name: " Portraits ", isValid: true },
  subcategoryInputs: [{ selected: { id: "face", name: " Face " }, isValid: true }],
  ...overrides,
});
const makeStore = () => {
  const store = configureStore({ reducer: { images: imagesSlice.reducer } });
  store.dispatch(imagesActions.setImageCategories(categories));
  return store;
};
const wrapperFor = (store) => ({ children }) => <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>;
const mountHook = (options = { postId: 7, hasImages: true }) => {
  const store = makeStore();
  return { store, ...renderHook((props) => useCollectionDestination(props), { initialProps: options, wrapper: wrapperFor(store) }) };
};
const prepare = async (result, fields = selection()) => act(async () => { await result.current.prepare(fields); });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
beforeEach(() => {
  picker.current = null;
  getCollectionData.mockReset().mockResolvedValue({ subcategories: ["existing"], posts: [savedPost] });
  addNewCollectionCategories.mockReset().mockImplementation(() => async () => prepared);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("loads existing data before preparing categories and exposes the destination only after both complete", async () => {
  const read = deferred();
  const create = deferred();
  getCollectionData.mockReturnValue(read.promise);
  addNewCollectionCategories.mockImplementation(() => async () => create.promise);
  const { result } = mountHook();
  let pending;
  act(() => { pending = result.current.prepare(selection()); });
  expect(getCollectionData).toHaveBeenCalledExactlyOnceWith(5);
  expect(addNewCollectionCategories).not.toHaveBeenCalled();
  expect(result.current).toMatchObject({
    stage: "destination", destination: { collectionInfo: null, savedPostData: null },
    status: { collectionInfoIsLoading: true, errorMessage: "", successMessage: "", showErrorMessage: false },
  });
  await act(async () => read.resolve({ posts: [savedPost], subcategories: ["existing"] }));
  expect(addNewCollectionCategories).toHaveBeenCalledExactlyOnceWith(prepared);
  expect(result.current.stage).toBe("destination");
  expect(result.current.destination.collectionInfo).toBeNull();
  await act(async () => { create.resolve(prepared); await pending; });
  expect(result.current).toMatchObject({
    stage: "images", destination: { collectionInfo: prepared, savedPostData: savedPost },
    status: { collectionInfoIsLoading: false, successMessage: SUCCESS_MESSAGE_SAVED },
  });
});

it.each([
  { mainCategorySelected: { id: null, name: "New category", isValid: true } },
  { collectionNameSelected: { id: null, name: "New collection", isValid: true } },
])("skips existing collection lookup when an ID is absent: %j", async (overrides) => {
  const { result } = mountHook();
  await prepare(result, selection(overrides));
  expect(getCollectionData).not.toHaveBeenCalled();
  expect(addNewCollectionCategories.mock.calls[0][0].curCollectionSabcategories).toEqual([]);
  expect(result.current.stage).toBe("images");
  expect(result.current.destination.savedPostData).toBeNull();
});

it("keeps duplicate filtering before trimming and permits blank optional subcategories", async () => {
  const { result } = mountHook();
  await prepare(result, selection({ subcategoryInputs: [
    { selected: null, isValid: true },
    { selected: { id: null, name: "" }, isValid: true },
    { selected: { id: "first", name: "Face" }, isValid: true },
    { selected: { id: "second", name: "Face" }, isValid: true },
    { selected: { id: "spaced", name: " Face " }, isValid: true },
  ] }));
  expect(addNewCollectionCategories.mock.calls[0][0].subcategoriesData).toEqual([
    { id: "second", name: "Face" }, { id: "spaced", name: "Face" },
  ]);
});

it.each([
  { mainCategorySelected: { name: "", id: null, isValid: false } },
  { collectionNameSelected: { name: "", id: null, isValid: false } },
  { subcategoryInputs: [{ selected: null, isValid: false }] },
])("rejects invalid selections before any request: %j", async (overrides) => {
  const { result } = mountHook();
  await prepare(result, selection(overrides));
  expect(result.current).toMatchObject({
    stage: "destination",
    status: { errorMessage: ERROR_MESSAGE_INPUT_DEF, showErrorMessage: true, collectionInfoIsLoading: false, successMessage: "" },
  });
  expect(getCollectionData).not.toHaveBeenCalled();
  expect(addNewCollectionCategories).not.toHaveBeenCalled();
});

it.each(["lookup", "creation"])("keeps the destination stage after %s failure and clears errors on retry", async (boundary) => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  if (boundary === "lookup") getCollectionData.mockRejectedValueOnce(new Error("Read failed"));
  else addNewCollectionCategories.mockImplementationOnce(() => async () => { throw new AppError("Create failed"); });
  const { result } = mountHook();
  await prepare(result);
  expect(result.current).toMatchObject({
    stage: "destination", destination: { collectionInfo: null, savedPostData: null },
    status: { collectionInfoIsLoading: false, showErrorMessage: true, successMessage: "",
      errorMessage: boundary === "lookup" ? ERROR_MESSAGE_DEFAULT : "Create failed" },
  });
  if (boundary === "lookup") expect(addNewCollectionCategories).not.toHaveBeenCalled();
  await prepare(result);
  expect(result.current).toMatchObject({
    stage: "images", status: { errorMessage: "", successMessage: SUCCESS_MESSAGE_SAVED, showErrorMessage: true },
  });
});

it("reports successful preparation without opening image selection when there are no images", async () => {
  const { result } = mountHook({ postId: 7, hasImages: false });
  await prepare(result);
  expect(result.current).toMatchObject({
    stage: "destination", destination: { collectionInfo: prepared, savedPostData: null },
    status: { collectionInfoIsLoading: false, successMessage: SUCCESS_MESSAGE_SAVED },
  });
  await prepare(result, selection({ subcategoryInputs: [{ isValid: false }] }));
  expect(result.current.status).toMatchObject({ successMessage: "", errorMessage: ERROR_MESSAGE_INPUT_DEF });
});

it.each([
  { posts: [{ postId: 8, imageIds: [1] }], subcategories: [] },
  { posts: [{ postId: 7, imageIds: [] }], subcategories: [] },
])("does not expose a saved post without matching saved image IDs: %j", async (collection) => {
  getCollectionData.mockResolvedValue(collection);
  const { result } = mountHook();
  await prepare(result);
  expect(result.current.stage).toBe("images");
  expect(result.current.destination.savedPostData).toBeNull();
});

const images = [{ id: 1 }, { id: 2 }];
const mountForm = (props = {}) => render(<SaveToCollectionForm {...props} />, { wrapper: wrapperFor(makeStore()) });
const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

it("keeps category changes, subcategory filtering and query filtering in the form", () => {
  mountForm({ images });
  change("Category", "People");
  expect(screen.getByTestId("Collection options").textContent).toBe("Portraits,Poses");
  change("Subcategory", "Face");
  expect(screen.getByTestId("Collection options").textContent).toBe("Portraits");
  change("Collection", "Portraits");
  change("Collection query", "missing");
  expect(screen.getByTestId("Collection options").textContent).toBe("");
  change("Category", "New");
  expect(screen.getByLabelText("Collection").value).toBe("");
  expect(screen.getByLabelText("Subcategory").value).toBe("");
});

it("prepares a suggested collection then forwards images, saved IDs and onSave to the picker", async () => {
  const onSave = vi.fn();
  const { container } = mountForm({ postId: 7, images, activeImageIndex: 1, onSave });
  fireEvent.click(screen.getByRole("button", { name: "Use suggested collection" }));
  expect(screen.getByLabelText("Category").value).toBe("People");
  expect(screen.getByLabelText("Collection").value).toBe("Portraits");
  fireEvent.submit(container.querySelector("form"));
  const save = await screen.findByRole("button", { name: "Save chosen images" });
  expect(screen.queryByLabelText("Category")).toBeNull();
  expect(picker.current).toMatchObject({
    type: "save", location: "collections", collectionInfo: prepared,
    postData: savedPost, savedImageIds: [1], images, activeImageIndex: 1, onSave,
  });
  fireEvent.click(save);
  expect(onSave).toHaveBeenCalledExactlyOnceWith("collections", [2], prepared, savedPost);
});

it("keeps creation fields after success and links to the resolved collection", async () => {
  const { container } = mountForm();
  change("Category", "New category");
  change("Collection", "New collection");
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText(SUCCESS_MESSAGE_SAVED);
  expect(screen.getByRole("link", { name: "Show collection" }).getAttribute("href")).toBe("/images/5");
  expect(screen.getByLabelText("Collection").value).toBe("New collection");
  expect(getCollectionData).not.toHaveBeenCalled();
  expect(picker.current).toBeNull();
});

it("shows loading through destination preparation and retains selections after failure", async () => {
  const pending = deferred();
  addNewCollectionCategories.mockImplementation(() => async () => pending.promise);
  const { container } = mountForm();
  change("Category", "New category");
  change("Collection", "New collection");
  fireEvent.submit(container.querySelector("form"));
  expect(screen.getByRole("button", { name: "Preparing" }).disabled).toBe(false);
  await act(async () => pending.reject(new AppError("Try again")));
  expect(screen.getByText("Try again")).toBeTruthy();
  expect(screen.getByLabelText("Collection").value).toBe("New collection");
  expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
});
