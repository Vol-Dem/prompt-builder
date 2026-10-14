// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  it("shows minimum-length feedback for a value below the limit", () => {
    render(control(variant, "ab", { validation: { minLength: 3 }, showError: true }));
    expect(screen.getByText("Value must be at least 3 characters")).toBeTruthy();
    expect(field().className).toContain(variant.errorClass);
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
    fireEvent.blur(field());
    expect(field().className).toContain(variant.errorClass);
    // Textarea currently reveals its border on blur, with messages driven by showError.
    expect(!!screen.queryByText("This field is required")).toBe(variant.name !== "Textarea");
    rerender(control(variant, "", { validation, showError: true }));
    expect(screen.getByText("This field is required")).toBeTruthy();
    rerender(control(variant, "", { validation, showError: false }));
    expect(screen.queryByText("This field is required")).toBeNull();
    expect(field().className).not.toContain(variant.errorClass);
  });

  it("retains each control's disableErrorOnBlur behavior", () => {
    render(control(variant, "", { validation: { required: true, disableErrorOnBlur: true } }));
    fireEvent.blur(field());
    // InputNumber currently reveals errors on blur whenever validation is present.
    expect(!!screen.queryByText("This field is required")).toBe(variant.name === "InputNumber");
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
