// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CollectionEditForm from "./CollectionEditForm";
import { editCollectionData } from "../../../store/imagesThunks";
import { SUCCESS_MESSAGE_SAVED } from "../../../variables/constants";

const { state, dispatch } = vi.hoisted(() => ({ state: {}, dispatch: vi.fn() }));
vi.mock("../../../store/hooks/hooks", () => ({
  useAppSelector: (selector) => selector(state), useAppDispatch: () => dispatch,
}));
vi.mock("../../../store/imagesThunks", () => ({ editCollectionData: vi.fn() }));
// Keep the fieldset and form handlers, replacing only the combobox's dropdown UI.
vi.mock("../../ui/forms/ComboSelect", () => ({
  default: ({ label, placeholder, optionsData, selected, setSelected, id, validation }) => (
    <input aria-label={label || placeholder} value={selected?.name || ""} onChange={(event) => {
      const name = event.target.value;
      const selected = name ? optionsData.find((option) => option.name === name) || { id: null, name } : null;
      setSelected(selected, !validation.required || !!name, "", id);
    }} />
  ),
}));

const categories = [{ id: "people", name: "People", subcategories: [
  { id: "face", name: "Face" }, { id: "pose", name: "Pose" },
] }, { id: "places", name: "Places", subcategories: [] }];
const collectionData = {
  id: 5, name: "Portraits", category: "people", subcategories: ["face", "deleted", "pose"],
  description: "Saved description", nsfw: true,
};
beforeEach(() => {
  state.images = { categories, collectionDataIsSaving: false };
  dispatch.mockReset().mockResolvedValue(undefined);
  editCollectionData.mockReset().mockImplementation((payload) => ({ type: "editCollection", payload }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

it("hydrates existing rows, skips deleted subcategories and saves only the remaining rows", async () => {
  const { container } = render(<CollectionEditForm collectionData={collectionData} />);
  expect(screen.getAllByLabelText("Subcategory").map((input) => input.value)).toEqual(["Face", "Pose"]);
  const group = screen.getByRole("group", { name: "Subcategories" });
  fireEvent.click(group.querySelector('button[class*="input__btn-del"]'));
  await waitFor(() => expect(screen.queryByDisplayValue("Pose")).toBeNull());
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText(SUCCESS_MESSAGE_SAVED);
  expect(editCollectionData).toHaveBeenCalledExactlyOnceWith({
    collectionData: { id: 5, name: "Portraits" },
    categoryData: { id: "people", name: "People" },
    curCollectionSabcategories: collectionData.subcategories,
    subcategoriesData: [{ id: "face", name: "Face" }],
    description: "Saved description", nsfw: true,
  });
});

it("preserves optional clearing and excludes the cleared row from the save payload", async () => {
  const { container } = render(<CollectionEditForm collectionData={{ ...collectionData, subcategories: ["face"] }} />);
  change("Subcategory", "");
  expect(screen.getByLabelText("Subcategory").value).toBe("");
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText(SUCCESS_MESSAGE_SAVED);
  expect(editCollectionData.mock.calls[0][0].subcategoriesData).toEqual([]);
});

it("retains new rows and resets them when the main category changes", async () => {
  render(<CollectionEditForm collectionData={{ ...collectionData, subcategories: ["face"] }} />);
  fireEvent.click(screen.getByRole("button", { name: "+ add subcategory" }));
  const inputs = screen.getAllByLabelText("Subcategory");
  fireEvent.change(inputs[1], { target: { value: "New subcategory" } });
  expect(screen.getAllByLabelText("Subcategory").map((input) => input.value)).toEqual(["Face", "New subcategory"]);
  change("Category", "Places");
  await waitFor(() => expect(screen.getAllByLabelText("Subcategory")).toHaveLength(1));
  expect(screen.getByLabelText("Subcategory").value).toBe("");
});
