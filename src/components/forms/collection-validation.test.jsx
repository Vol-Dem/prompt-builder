// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import CollectionEditForm from "./collection-edit-form/CollectionEditForm";
import SaveToCollectionForm from "./save-to-collection-form/SaveToCollectionForm";
import { addNewCollectionCategories, editCollectionData } from "../../store/imagesThunks";
import { getCollectionData } from "../../utils/fetch/fetchCollection";
import {
  ERROR_MESSAGE_INPUT_DEF, SUCCESS_MESSAGE_SAVED,
  VALIDATION_CATEGORY_NAME_MAX_LENGTH, VALIDATION_DESCRIPTION_MAX_LENGTH,
} from "../../variables/constants";

// Keep inputs, their validation callbacks, and form state real; stop at persistence.
vi.mock("../../store/imagesThunks", () => ({ addNewCollectionCategories: vi.fn(), editCollectionData: vi.fn() }));
vi.mock("../../utils/fetch/fetchCollection", () => ({ getCollectionData: vi.fn() }));
vi.mock("./save-to-collection-form/SuggestedCollections", () => ({ default: () => null }));
vi.mock("./choose-image-form/ChooseImageForm", () => ({ default: () => <div>Image selection</div> }));
vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", () => ({ getFirestore: () => ({}) }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal(), AnimatePresence: ({ children }) => children,
}));

const categories = [{
  id: "people", name: "People", subcategories: [{ id: "face", name: "Face" }],
  collectionNames: [{ id: 5, name: "Portraits", subcategories: ["face"] }],
}];
const collection = {
  id: 5, name: "Portraits", category: "people", subcategories: ["face"], description: "Description",
};
const mount = (element, loadedCategories = categories) => {
  const store = configureStore({ reducer: {
    images: (state = { categories: loadedCategories, collectionDataIsSaving: false }) => state,
  } });
  return render(<Provider store={store}><MemoryRouter>{element}</MemoryRouter></Provider>);
};
const choose = async (user, input, value) => {
  await user.click(input);
  fireEvent.change(input, { target: { value } });
  await user.click(await screen.findByRole("option", {
    name: (name) => name === value || name === `Create "${value}"`,
  }));
};
const submit = (container) => fireEvent.submit(container.querySelector("form"));

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(console, "log").mockImplementation(() => {});
  editCollectionData.mockReset().mockImplementation(() => async () => {});
  addNewCollectionCategories.mockReset().mockImplementation((data) => async () => ({
    ...data, collectionData: { ...data.collectionData, id: 5 },
  }));
  getCollectionData.mockReset().mockResolvedValue({ subcategories: [], posts: [] });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("allows changing the collection name while loaded metadata exceeds current limits", async () => {
  const legacyName = "x".repeat(VALIDATION_CATEGORY_NAME_MAX_LENGTH + 1);
  const legacyDescription = "x".repeat(VALIDATION_DESCRIPTION_MAX_LENGTH + 1);
  const loadedCategories = [{ ...categories[0], name: legacyName,
    subcategories: [{ id: "face", name: legacyName }] }];
  const { container } = mount(<CollectionEditForm collectionData={{ ...collection,
    name: legacyName, description: legacyDescription }} />, loadedCategories);
  fireEvent.change(screen.getByLabelText("Collection"), { target: { value: "New name" } });
  submit(container);
  await screen.findByText(SUCCESS_MESSAGE_SAVED);
  expect(editCollectionData.mock.calls[0][0]).toMatchObject({
    collectionData: { id: 5, name: "New name" },
    categoryData: { id: "people", name: legacyName },
    subcategoriesData: [{ id: "face", name: legacyName }], description: legacyDescription,
  });
  expect(screen.queryByText(/Value cannot be more than/)).toBeNull();
});

it.each([
  ["name", "Collection", VALIDATION_CATEGORY_NAME_MAX_LENGTH],
  ["description", "Description", VALIDATION_DESCRIPTION_MAX_LENGTH],
])("validates edits to loaded %s and accepts reverting to its baseline", async (key, label, limit) => {
  const baseline = "x".repeat(limit + 1);
  const { container } = mount(<CollectionEditForm collectionData={{ ...collection, [key]: baseline }} />);
  const input = screen.getByLabelText(label);
  fireEvent.change(input, { target: { value: baseline + "x" } });
  submit(container);
  await screen.findByText(ERROR_MESSAGE_INPUT_DEF);
  expect(editCollectionData).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: baseline } });
  submit(container);
  await screen.findByText(SUCCESS_MESSAGE_SAVED);
  const saved = editCollectionData.mock.calls[0][0];
  expect(key === "name" ? saved.collectionData.name : saved.description).toBe(baseline);
  expect(screen.queryByText(ERROR_MESSAGE_INPUT_DEF)).toBeNull();
});

it("uses the loaded subcategory baseline when selecting it again after an invalid edit", async () => {
  const baseline = "x".repeat(VALIDATION_CATEGORY_NAME_MAX_LENGTH + 1);
  const { container } = mount(<CollectionEditForm collectionData={collection} />,
    [{ ...categories[0], subcategories: [{ id: "face", name: baseline }] }]);
  const user = userEvent.setup();
  const input = screen.getAllByRole("combobox")[1];
  await choose(user, input, baseline + "x");
  submit(container);
  await screen.findByText(ERROR_MESSAGE_INPUT_DEF);
  expect(editCollectionData).not.toHaveBeenCalled();
  await choose(user, input, baseline);
  submit(container);
  await screen.findByText(SUCCESS_MESSAGE_SAVED);
  expect(editCollectionData.mock.calls[0][0].subcategoriesData).toEqual([{ id: "face", name: baseline }]);
});

it.each([0, 2])("blocks an overlong new destination name in combobox %s", async (fieldIndex) => {
  const { container } = mount(<SaveToCollectionForm />);
  const user = userEvent.setup();
  await choose(user, screen.getAllByRole("combobox")[0], "New category");
  await choose(user, screen.getAllByRole("combobox")[2], "New collection");
  await choose(user, screen.getAllByRole("combobox")[fieldIndex], "x".repeat(VALIDATION_CATEGORY_NAME_MAX_LENGTH + 1));
  submit(container);
  await screen.findByText(ERROR_MESSAGE_INPUT_DEF);
  expect(addNewCollectionCategories).not.toHaveBeenCalled();
});

it("keeps a blank added destination subcategory optional and excludes a cleared selection", async () => {
  const { container } = mount(<SaveToCollectionForm />);
  const user = userEvent.setup();
  await choose(user, screen.getAllByRole("combobox")[0], "People");
  await choose(user, screen.getAllByRole("combobox")[2], "New collection");
  const subcategory = screen.getAllByRole("combobox")[1];
  await choose(user, subcategory, "Face");
  await user.clear(subcategory);
  fireEvent.click(screen.getByRole("button", { name: "+ add subcategory" }));
  submit(container);
  await screen.findByText(SUCCESS_MESSAGE_SAVED);
  expect(addNewCollectionCategories.mock.calls[0][0]).toMatchObject({
    collectionData: { name: "New collection" }, subcategoriesData: [],
  });
});

it("keeps the existing-category requirement when editing a collection", async () => {
  const { container } = mount(<CollectionEditForm collectionData={collection} />);
  const user = userEvent.setup();
  await choose(user, screen.getAllByRole("combobox")[0], "Unlisted category");
  submit(container);
  await screen.findByText(ERROR_MESSAGE_INPUT_DEF);
  expect(editCollectionData).not.toHaveBeenCalled();
});
