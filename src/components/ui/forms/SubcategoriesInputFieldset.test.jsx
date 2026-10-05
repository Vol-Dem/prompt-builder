// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SubcategoriesInputFieldset from "./SubcategoriesInputFieldset";
import {
  SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT,
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
} from "../../../variables/constants";

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const row = (id, selected = null) => ({
  id, selected, type: "text", name: "sub", placeholder: "Subcategory",
  isValid: true, errorMessage: "",
});
const mount = (overrides = {}) => {
  const props = {
    subcategories: [row("first")], options: [], query: "", required: false,
    showError: false, onQueryChange: vi.fn(), onSelect: vi.fn(),
    onAdd: vi.fn(), onDelete: vi.fn(), ...overrides,
  };
  return { props, ...render(<SubcategoriesInputFieldset {...props} />) };
};

it.each([true, false])("preserves required=%s validation for an empty selection", (required) => {
  mount({ required, showError: true });
  expect(screen.getByRole("combobox").value).toBe("");
  expect(!!screen.queryByText("This field is required")).toBe(required);
});

it.each([true, false])("retains the category length limit with required=%s", (required) => {
  mount({ required, showError: true, subcategories: [row("first", {
    id: null, name: "x".repeat(VALIDATION_CATEGORY_NAME_MAX_LENGTH + 1),
  })] });
  expect(screen.getByText(`Value cannot be more than ${VALIDATION_CATEGORY_NAME_MAX_LENGTH} characters`)).toBeTruthy();
});

it("keeps the first row protected and forwards add/delete without submitting its form", () => {
  const onSubmit = vi.fn((event) => event.preventDefault());
  const onAdd = vi.fn();
  const onDelete = vi.fn();
  render(<form onSubmit={onSubmit}>
    <SubcategoriesInputFieldset subcategories={[row("first"), row("second"), row("third")]}
      options={[]} query="" required={false} showError={false}
      onQueryChange={vi.fn()} onSelect={vi.fn()} onAdd={onAdd} onDelete={onDelete} />
  </form>);
  const group = screen.getByRole("group", { name: "Subcategories" });
  const buttons = group.querySelectorAll('button[class*="input__btn-del"]');
  expect(buttons).toHaveLength(2);
  expect(group.querySelector("[data-id=first]").parentElement.querySelector('button[class*="input__btn-del"]')).toBeNull();
  fireEvent.click(buttons[1]);
  expect(onDelete).toHaveBeenCalledOnce();
  expect(onDelete.mock.calls[0][0]).toBe(2);
  fireEvent.click(screen.getByRole("button", { name: "+ add subcategory" }));
  expect(onAdd).toHaveBeenCalledOnce();
  expect(onSubmit).not.toHaveBeenCalled();
});

it("hides Add at the row limit and restores it when a row is removed", () => {
  const subcategories = Array.from({ length: SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT }, (_, index) => row(String(index)));
  const { props, rerender } = mount({ subcategories });
  expect(screen.queryByRole("button", { name: "+ add subcategory" })).toBeNull();
  rerender(<SubcategoriesInputFieldset {...props} subcategories={subcategories.slice(0, -1)} />);
  expect(screen.getByRole("button", { name: "+ add subcategory" })).toBeTruthy();
});

it("forwards query changes and existing selections with the correct row ID", async () => {
  const user = userEvent.setup();
  const portrait = { id: "portrait", name: "Portrait" };
  const { props } = mount({ options: [portrait] });
  await user.click(screen.getByRole("combobox"));
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "Por" } });
  expect(props.onQueryChange).toHaveBeenCalledWith("Por");
  await user.click(await screen.findByRole("option", { name: "Portrait" }));
  expect(props.onSelect).toHaveBeenCalledExactlyOnceWith(portrait, true, "", "first");
  await waitFor(() => expect(props.onQueryChange).toHaveBeenCalledWith(""));
});

it.each([true, false])("forwards clearing a selection using required=%s validation", async (required) => {
  const user = userEvent.setup();
  const { props } = mount({ required, subcategories: [row("first", { id: "portrait", name: "Portrait" })] });
  await user.clear(screen.getByRole("combobox"));
  expect(props.onSelect).toHaveBeenCalledWith(null, !required, required ? "This field is required" : "", "first");
});
