// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

import Input from "./Input";
import InputNumber from "./InputNumber";
import Textarea from "./Textarea";
import ComboSelect from "./ComboSelect";
import inputClasses from "./Input.module.scss";
import numberClasses from "./InputNumber.module.scss";
import textareaClasses from "./Textarea.module.scss";
import comboClasses from "./ComboSelect.module.scss";

const choices = [{ id: "short", name: "ok" }, { id: "long", name: "lengthy" }];
const controls = [
  { name: "Input", Component: Input, errorClass: inputClasses["input--error"] },
  { name: "InputNumber", Component: InputNumber, errorClass: numberClasses["input--error"] },
  { name: "Textarea", Component: Textarea, errorClass: textareaClasses["textarea--error"] },
  { name: "ComboSelect", Component: ComboSelect, errorClass: comboClasses["select--error"] },
];
const control = ({ name, Component }, value, props) => name === "ComboSelect"
  ? <Component id="field" label="Field" selected={value ? { id: "current", name: value } : null}
      query="" setQuery={vi.fn()} setSelected={vi.fn()} optionsData={choices} {...props} />
  : <Component id="field" label="Field" type="text" step={0.1} value={value} onChange={vi.fn()} {...props} />;
const field = () => screen.queryByRole("combobox") || screen.getByLabelText("Field");

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

describe.each(controls)("$name validation feedback", (variant) => {
  it("accepts a loaded baseline and shows errors only for invalid changes", () => {
    const props = { validation: { maxLength: 3, acceptedValue: "Legacy name" }, showError: true };
    const { rerender } = render(control(variant, "Legacy name", props));
    expect(screen.queryByText("Value cannot be more than 3 characters")).toBeNull();
    expect(field()).not.toHaveAttribute("aria-invalid");
    rerender(control(variant, "Different name", props));
    expect(screen.getByText("Value cannot be more than 3 characters")).toBeTruthy();
    expect(field()).toHaveAttribute("aria-invalid", "true");
    rerender(control(variant, "Legacy name", props));
    expect(screen.queryByText("Value cannot be more than 3 characters")).toBeNull();
    expect(field().className).not.toContain(variant.errorClass);
    expect(field()).not.toHaveAttribute("aria-invalid");
  });

  it("shows minimum-length feedback for a value below the limit", () => {
    render(control(variant, "ab", { validation: { minLength: 3 }, showError: true }));
    expect(screen.getByText("Value must be at least 3 characters")).toBeTruthy();
    expect(field().className).toContain(variant.errorClass);
    expect(field()).toHaveAccessibleDescription("Value must be at least 3 characters");
  });

  it("clears messages from removed rules while retaining external errors", () => {
    const { rerender } = render(control(variant, "", {
      validation: { required: true }, showError: true, error: "Server error",
    }));
    expect(screen.getByText("This field is required")).toBeTruthy();
    expect(screen.getByText("Server error")).toBeTruthy();
    rerender(control(variant, "", { showError: true, error: "Server error" }));
    expect(screen.queryByText("This field is required")).toBeNull();
    expect(screen.getByText("Server error")).toBeTruthy();
    expect(field().className).not.toContain(variant.errorClass);
  });

  it("follows parent-driven values and rule changes without input events", () => {
    const { rerender } = render(control(variant, "long", {
      validation: { maxLength: 3 }, showError: true,
    }));
    expect(screen.getByText("Value cannot be more than 3 characters")).toBeTruthy();
    rerender(control(variant, "ok", { validation: { maxLength: 3 }, showError: true }));
    expect(screen.queryByText("Value cannot be more than 3 characters")).toBeNull();
    rerender(control(variant, "ok", { validation: { maxLength: 1 }, showError: true }));
    expect(screen.getByText("Value cannot be more than 1 characters")).toBeTruthy();
    rerender(control(variant, "", { validation: { required: true, maxLength: 1 }, showError: true }));
    expect(screen.getByText("This field is required")).toBeTruthy();
  });

  it("retains blur feedback, forced feedback, and reset visibility", () => {
    const validation = { required: true };
    const { rerender } = render(control(variant, "", { validation, showError: false }));
    expect(screen.queryByText("This field is required")).toBeNull();
    expect(field()).not.toHaveAttribute("aria-invalid");
    expect(field()).not.toHaveAttribute("aria-describedby");
    fireEvent.blur(field());
    expect(field().className).toContain(variant.errorClass);
    expect(field()).toHaveAttribute("aria-invalid", "true");
    // Textarea currently reveals its border on blur, with messages driven by showError.
    expect(!!screen.queryByText("This field is required")).toBe(variant.name !== "Textarea");
    expect(field()).toHaveAccessibleDescription(variant.name === "Textarea" ? "" : "This field is required");
    rerender(control(variant, "", { validation, showError: true }));
    expect(screen.getByText("This field is required")).toBeTruthy();
    rerender(control(variant, "", { validation, showError: false }));
    expect(screen.queryByText("This field is required")).toBeNull();
    expect(field().className).not.toContain(variant.errorClass);
    expect(field()).not.toHaveAttribute("aria-invalid");
    expect(field()).not.toHaveAttribute("aria-describedby");
  });

  it("retains each control's disableErrorOnBlur behavior", () => {
    render(control(variant, "", { validation: { required: true, disableErrorOnBlur: true } }));
    fireEvent.blur(field());
    // InputNumber currently reveals errors on blur whenever validation is present.
    expect(!!screen.queryByText("This field is required")).toBe(variant.name === "InputNumber");
  });
});

describe.each(controls)("$name accessible field associations", (variant) => {
  const role = variant.name === "ComboSelect" ? "combobox" : "textbox";

  it("connects its visible label to the supplied field ID", () => {
    render(control(variant, "ok", { id: "custom-field" }));
    const element = screen.getByRole(role, { name: "Field" });
    expect(element).toBe(screen.getByLabelText("Field"));
    expect(element.id).toBe("custom-field");
  });

  it("keeps generated field and error IDs unique and stable across renders", () => {
    const fields = (firstValue) => <>
      {control(variant, firstValue, { id: undefined, label: "First", validation: { required: true }, showError: true })}
      {control(variant, "", { id: undefined, label: "Second", validation: { required: true }, showError: true })}
    </>;
    const { rerender } = render(fields(""));
    const first = screen.getByRole(role, { name: "First" });
    const second = screen.getByRole(role, { name: "Second" });
    const firstId = first.id;
    const firstErrorId = first.getAttribute("aria-describedby");
    expect(firstId).not.toBe("");
    expect(firstId).not.toBe(second.id);
    expect(firstErrorId).not.toBe(second.getAttribute("aria-describedby"));
    expect(document.getElementById(firstErrorId)).toHaveTextContent("This field is required");
    expect(first).toHaveAccessibleDescription("This field is required");
    expect(second).toHaveAccessibleDescription("This field is required");

    rerender(fields("ok"));
    expect(screen.getByRole(role, { name: "First" }).id).toBe(firstId);
    expect(screen.getByRole(role, { name: "First" })).not.toHaveAttribute("aria-describedby");
    expect(second).toHaveAccessibleDescription("This field is required");
    rerender(fields(""));
    expect(screen.getByRole(role, { name: "First" }).getAttribute("aria-describedby")).toBe(firstErrorId);
  });

  it("accepts an accessible name without adding a visible label", () => {
    const { container } = render(control(variant, "ok", { label: undefined, "aria-label": "Custom field" }));
    expect(screen.getByRole(role, { name: "Custom field" })).toBeTruthy();
    expect(container.querySelector("label")).toBeNull();
  });

  it("preserves caller descriptions while adding and clearing rendered errors", () => {
    const fields = (showError, value = "", error = "Server error") => <>
      <p id="hint">Field hint</p>
      {control(variant, value, { "aria-describedby": "hint", validation: { required: true }, showError, error })}
    </>;
    const { rerender } = render(fields(false));
    expect(field()).toHaveAccessibleDescription("Field hint");
    expect(field()).not.toHaveAttribute("aria-invalid");
    rerender(fields(true));
    expect(field()).toHaveAccessibleDescription("Field hint Server error This field is required");
    expect(field()).toHaveAttribute("aria-invalid", "true");
    rerender(fields(true, "ok", ""));
    expect(field()).toHaveAccessibleDescription("Field hint");
    expect(field()).not.toHaveAttribute("aria-invalid");
    expect(field().getAttribute("aria-describedby")).toBe("hint");
    rerender(fields(false));
    expect(field()).toHaveAccessibleDescription("Field hint");
    expect(field()).not.toHaveAttribute("aria-invalid");
  });

  it("preserves an external label and explicit ARIA invalid state", () => {
    render(<>
      <span id="external-label">External label</span>
      {control(variant, "ok", { label: undefined, "aria-labelledby": "external-label", "aria-invalid": "grammar" })}
    </>);
    expect(screen.getByRole(role, { name: "External label" })).toHaveAttribute("aria-invalid", "grammar");
  });
});

describe.each(controls.filter(({ name }) => name !== "ComboSelect"))("$name callbacks", (variant) => {
  it("forwards validity for the attempted edit while displaying the parent's current value", () => {
    let attemptedValue;
    const onChange = vi.fn((eventOrValue) => {
      attemptedValue = variant.name === "InputNumber" ? eventOrValue : eventOrValue.target.value;
    });
    render(control(variant, "ok", { validation: { maxLength: 3 }, showError: true, onChange }));
    const element = field();
    fireEvent.change(element, { target: { value: "lengthy" } });
    expect(attemptedValue).toBe("lengthy");
    expect(onChange).toHaveBeenCalledOnce();
    const [eventOrValue, isValid, message] = onChange.mock.calls[0];
    if (variant.name === "InputNumber") expect(eventOrValue).toBe("lengthy");
    else expect(eventOrValue.target).toBe(element);
    expect(isValid).toBe(false);
    expect(message).toBe("Value cannot be more than 3 characters");
    expect(element.value).toBe("ok");
    expect(screen.queryByText(message)).toBeNull();
  });

  it("preserves callbacks without validation rules", () => {
    const onChange = vi.fn();
    render(control(variant, "ok", { onChange }));
    fireEvent.change(field(), { target: { value: "changed" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]).toHaveLength(2);
    expect(onChange.mock.calls[0][1]).toBe(variant.name === "InputNumber" ? null : true);
  });
});

it("forwards combobox selection metadata without caching a rejected selection's error", async () => {
  const setSelected = vi.fn();
  const setQuery = vi.fn();
  render(<ComboSelect id="choice" label="Choice" selected={choices[0]} optionsData={choices}
    query="" setQuery={setQuery} setSelected={setSelected}
    validation={{ maxLength: 3 }} showError />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox"));
  await user.click(await screen.findByRole("option", { name: "lengthy" }));
  expect(setSelected).toHaveBeenCalledExactlyOnceWith(choices[1], false,
    "Value cannot be more than 3 characters", "choice");
  expect(screen.getByRole("combobox").value).toBe("ok");
  expect(screen.queryByText("Value cannot be more than 3 characters")).toBeNull();
  expect(setQuery).toHaveBeenCalledWith("");
});

it("keeps the combobox callback ID omitted when its DOM ID is generated", async () => {
  const setSelected = vi.fn();
  render(<ComboSelect label="Choice" selected={choices[0]} optionsData={choices}
    query="" setQuery={vi.fn()} setSelected={setSelected} validation={{ maxLength: 10 }} />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: "Choice" }));
  await user.click(await screen.findByRole("option", { name: "lengthy" }));
  expect(setSelected).toHaveBeenCalledExactlyOnceWith(choices[1], true, "", undefined);
});

it("retains numeric increment/decrement formatting and validity callback arguments", () => {
  const onChange = vi.fn();
  render(<InputNumber label="Weight" type="text" value="1.0" step={0.1}
    onChange={onChange} validation={{ number: true }} />);
  fireEvent.click(screen.getByRole("button", { name: "up" }));
  fireEvent.click(screen.getByRole("button", { name: "down" }));
  expect(onChange.mock.calls).toEqual([["1.1", true], ["0.9", true]]);
});

it("reports invalid numeric edits and follows the parent's accepted value", () => {
  const onChange = vi.fn();
  const props = { id: "weight", label: "Weight", type: "text", step: 0.1,
    onChange, validation: { number: true }, showError: true };
  const { rerender } = render(<InputNumber {...props} value="1.0" />);
  fireEvent.change(screen.getByLabelText("Weight"), { target: { value: "abc" } });
  expect(onChange).toHaveBeenCalledExactlyOnceWith("abc", false, "Value must be a number");
  expect(screen.getByLabelText("Weight").value).toBe("1.0");
  expect(screen.queryByText("Value must be a number")).toBeNull();
  rerender(<InputNumber {...props} value="abc" />);
  expect(screen.getByText("Value must be a number")).toBeTruthy();
  rerender(<InputNumber {...props} value="-1.5" />);
  expect(screen.queryByText("Value must be a number")).toBeNull();
});
