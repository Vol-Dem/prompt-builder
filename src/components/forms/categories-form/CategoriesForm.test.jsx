// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CategoriesForm from "./CategoriesForm";
import { updateCategories } from "../../../store/modelThunks";
import { updateCollectionCategories } from "../../../store/imagesThunks";
import {
  ERROR_MESSAGE_CATEGORY_DELETE,
  ERROR_MESSAGE_CATEGORY_RENAME,
  ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_OFFLINE,
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
} from "../../../variables/constants";

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));
vi.mock("../../../store/hooks/hooks", () => ({ useAppDispatch: () => dispatch }));
vi.mock("../../../store/modelThunks", () => ({ updateCategories: vi.fn() }));
vi.mock("../../../store/imagesThunks", () => ({ updateCollectionCategories: vi.fn() }));
vi.mock("../../ui/Modal", () => ({ default: ({ children, onClose }) => (
  <div role="dialog">{children}<button onClick={onClose}>Close</button></div>
) }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal(), AnimatePresence: ({ children }) => children,
}));

const categories = [{
  id: "portraits", name: "Portraits",
  subcategories: [{ id: "face", name: "Face" }, { id: "pose", name: "Pose" }],
  collectionNames: [{ id: 42, name: "Faces", subcategories: ["face"] }],
}, { id: "places", name: "Places", subcategories: [] }];
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((finish, fail) => { resolve = finish; reject = fail; });
  return { promise, resolve, reject };
};
let pending;

beforeEach(() => {
  vi.resetAllMocks();
  pending = deferred();
  dispatch.mockImplementation(() => pending.promise);
  updateCategories.mockReturnValue({ type: "test/modelCategories" });
  updateCollectionCategories.mockReturnValue({ type: "test/collectionCategories" });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const mount = (modelType = "lora", activeCategory) => {
  const props = { modelType, activeCategory, categories };
  const result = render(<CategoriesForm {...props} />);
  return { ...result, props };
};
const rename = (name = "Portraits", value = "New name") => {
  fireEvent.click(screen.getByRole("button", { name: `Rename ${name}` }));
  const input = screen.getByRole("textbox", { name: "Category name" });
  fireEvent.change(input, { target: { value } });
  return input;
};

describe.each([
  ["model categories", "lora", undefined],
  ["model subcategories", "lora", "portraits"],
  ["collection categories", "collections", undefined],
  ["collection subcategories", "collections", "portraits"],
])("%s", (_, modelType, activeCategory) => {
  const targetName = activeCategory ? "Face" : "Portraits";
  const update = (operation) => categories.flatMap((category) => {
    if (category.id !== "portraits") return [category];
    if (activeCategory) return [{
      ...category,
      subcategories: category.subcategories.flatMap((subcategory) => subcategory.id !== "face"
        ? [subcategory] : operation === "delete" ? [] : [{ ...subcategory, name: "New name" }]),
    }];
    return operation === "delete" ? [] : [{ ...category, name: "New name" }];
  });
  const expectWrite = (data, calls = 1) => {
    if (modelType === "collections") {
      expect(updateCollectionCategories).toHaveBeenCalledTimes(calls);
      expect(updateCollectionCategories).toHaveBeenLastCalledWith(data);
      expect(updateCategories).not.toHaveBeenCalled();
    } else {
      expect(updateCategories).toHaveBeenCalledTimes(calls);
      expect(updateCategories).toHaveBeenLastCalledWith(modelType, data);
      expect(updateCollectionCategories).not.toHaveBeenCalled();
    }
  };

  it("waits for rename persistence, retains the input during subscription updates, and prevents duplicate writes", async () => {
    const { rerender, props } = mount(modelType, activeCategory);
    const input = rename(targetName);
    const save = screen.getByRole("button", { name: "Save category name" });
    fireEvent.click(save);
    expectWrite(update("rename"));
    expect(input.disabled).toBe(true);
    expect(save.contains(screen.getByRole("status", { name: "Saving category name" }))).toBe(true);
    for (const button of screen.getAllByRole("button")) expect(button.disabled).toBe(true);
    fireEvent.submit(input.closest("form"));
    expect(dispatch).toHaveBeenCalledOnce();

    rerender(<CategoriesForm {...props} categories={update("rename")} />);
    expect(screen.getByDisplayValue("New name")).toBeTruthy();
    await act(async () => { pending.resolve(); });
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("button", { name: "Rename New name" }).disabled).toBe(false);
  });

  it("keeps the rename draft and shows a safe error after failure, then permits retry", async () => {
    const { rerender, props } = mount(modelType, activeCategory);
    rename(targetName);
    fireEvent.click(screen.getByRole("button", { name: "Save category name" }));
    rerender(<CategoriesForm {...props} categories={update("rename")} />);
    const original = new Error("Internal category write details");
    await act(async () => { pending.reject(original); });
    // Firestore can roll back its local snapshot after rejecting the write.
    rerender(<CategoriesForm {...props} />);
    expect(screen.getByDisplayValue("New name").disabled).toBe(false);
    expect(screen.getByText(ERROR_MESSAGE_CATEGORY_RENAME)).toBeTruthy();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
    expect(screen.queryByRole("status")).toBeNull();

    pending = deferred();
    fireEvent.click(screen.getByRole("button", { name: "Save category name" }));
    expectWrite(update("rename"), 2);
    expect(screen.queryByText(ERROR_MESSAGE_CATEGORY_RENAME)).toBeNull();
    expect(screen.getByDisplayValue("New name").disabled).toBe(true);
    await act(async () => { pending.resolve(); });
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("preserves the confirmation and prevents closing or submitting again during deletion", async () => {
    mount(modelType, activeCategory);
    fireEvent.click(screen.getByRole("button", { name: `Delete ${targetName}` }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain(`Are you sure you want to delete "${targetName}" category?`);
    expect(dispatch).not.toHaveBeenCalled();
    const confirm = within(dialog).getByRole("button", { name: "Delete" });
    fireEvent.click(confirm);
    expectWrite(update("delete"));
    expect(screen.getByText("Don't close this window until the deletion is complete")).toBeTruthy();
    expect(within(dialog).queryByRole("button", { name: "Delete" })).toBeNull();
    fireEvent.click(confirm);
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(dispatch).toHaveBeenCalledOnce();
    await act(async () => { pending.resolve(); });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps a failed deletion in its confirmation with a specific error and retry controls", async () => {
    mount(modelType, activeCategory);
    fireEvent.click(screen.getByRole("button", { name: `Delete ${targetName}` }));
    let dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    const original = new Error("Internal deletion details");
    await act(async () => { pending.reject(original); });
    dialog = screen.getByRole("dialog");
    expect(within(dialog).getByTestId("error-message").textContent).toBe(ERROR_MESSAGE_CATEGORY_DELETE);
    expect(dialog.textContent).toContain(`Are you sure you want to delete "${targetName}" category?`);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeTruthy();

    pending = deferred();
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    expectWrite(update("delete"), 2);
    expect(screen.queryByTestId("error-message")).toBeNull();
    await act(async () => { pending.resolve(); });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

it.each(["", "x".repeat(VALIDATION_CATEGORY_NAME_MAX_LENGTH + 1), "Places"])("preserves rename validation for %j", async (value) => {
  mount();
  rename("Portraits", value);
  fireEvent.click(screen.getByRole("button", { name: "Save category name" }));
  expect(dispatch).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox").value).toBe(value);
  expect(screen.getByText(value === "Places" ? 'The category "Places" already exists' : ERROR_MESSAGE_INPUT_DEF)).toBeTruthy();
});

it.each(["rename", "delete"])("shows the existing offline message without starting a %s write", (operation) => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
  mount();
  if (operation === "rename") {
    rename();
    fireEvent.click(screen.getByRole("button", { name: "Save category name" }));
  } else {
    fireEvent.click(screen.getByRole("button", { name: "Delete Portraits" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
  }
  expect(dispatch).not.toHaveBeenCalled();
  expect(screen.getByText(ERROR_MESSAGE_OFFLINE)).toBeTruthy();
});

it("closes an unchanged rename without writing or showing a duplicate-name error", () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Rename Portraits" }));
  fireEvent.click(screen.getByRole("button", { name: "Save category name" }));
  expect(dispatch).not.toHaveBeenCalled();
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.queryByText('The category "Portraits" already exists')).toBeNull();
});

it("discards a different category context's draft", () => {
  const { rerender, props } = mount();
  rename();
  rerender(<CategoriesForm {...props} modelType="checkpoint" />);
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.getByRole("button", { name: "Rename Portraits" })).toBeTruthy();
});

it("clears a failed deletion when cancelled and opens a fresh confirmation for another category", async () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Delete Portraits" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
  await act(async () => { pending.reject(new Error("Write failed")); });
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Delete Places" }));
  expect(screen.queryByTestId("error-message")).toBeNull();
  expect(screen.getByRole("dialog").textContent).toContain('delete "Places" category');
});
