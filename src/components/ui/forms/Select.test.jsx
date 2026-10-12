// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Select from "./Select";
import classes from "./Select.module.scss";

afterEach(cleanup);

const options = [
  { name: "Zero", value: 0 },
  { name: "Alpha", value: 1 },
  { name: "Beta", value: 2 },
];
const mount = (overrides = {}) => {
  const props = { id: "choice", name: "choice", options, onChange: vi.fn(), ...overrides };
  const view = render(<Select {...props} />);
  const display = () => view.container.querySelector(`.${classes["select__input-field"]}`);
  return { ...view, props, display, open: () => fireEvent.click(display()) };
};

describe("controlled Select", () => {
  it("follows parent changes and matches string IDs to numeric option values", () => {
    const { props, rerender, display, open } = mount({ selected: "1" });
    expect(display().textContent).toBe("Alpha");
    rerender(<Select {...props} selected={2} />);
    expect(display().textContent).toBe("Beta");
    open();
    expect(screen.getByLabelText("Beta").checked).toBe(true);
    expect(screen.getByLabelText("Alpha").checked).toBe(false);
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it.each([undefined, null, ""])("clears when the parent supplies %s", (selected) => {
    const { props, rerender, display, open } = mount({ selected: 1 });
    rerender(<Select {...props} selected={selected} />);
    expect(display().textContent).toBe("-");
    open();
    expect(screen.getByLabelText("-").checked).toBe(true);
    expect(screen.getByLabelText("Alpha").checked).toBe(false);
    // An explicit undefined remains controlled until the parent accepts a value.
    fireEvent.click(screen.getByLabelText("Beta"));
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith(2);
    expect(display().textContent).toBe("-");
  });

  it("uses current option labels and drops the display of a removed option", () => {
    const { props, rerender, display } = mount({ selected: 1 });
    rerender(<Select {...props} options={[{ name: "Renamed Alpha", value: 1 }]} />);
    expect(display().textContent).toBe("Renamed Alpha");
    rerender(<Select {...props} options={[options[2]]} />);
    expect(display().textContent).toBe("-");
    rerender(<Select {...props} options={options} />);
    expect(display().textContent).toBe("Alpha");
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it("reports an attempted selection while displaying the parent's current value", () => {
    const { props, display, open } = mount({ selected: 1 });
    open();
    fireEvent.click(screen.getByLabelText("Beta"));
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith(2);
    expect(display().textContent).toBe("Alpha");
  });

  it("displays an accepted selection and treats numeric zero as a selected value", () => {
    const onChange = vi.fn();
    const Parent = () => {
      const [selected, setSelected] = useState(1);
      return <Select options={options} selected={selected} onChange={(value) => {
        onChange(value);
        setSelected(value);
      }} />;
    };
    const { container } = render(<Parent />);
    const display = container.querySelector(`.${classes["select__input-field"]}`);
    fireEvent.click(display);
    fireEvent.click(screen.getByLabelText("Zero"));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(0);
    expect(display.textContent).toBe("Zero");
  });

  it("initializes numeric zero without offering a blank option", () => {
    const { display, open } = mount({ selected: 0 });
    expect(display().textContent).toBe("Zero");
    open();
    expect(screen.getByLabelText("Zero").checked).toBe(true);
    expect(screen.queryByLabelText("-")).toBeNull();
  });
});

describe("uncontrolled Select", () => {
  it("stores the chosen ID, follows new option labels, and clears through the blank option", async () => {
    const { props, rerender, display, open } = mount();
    open();
    fireEvent.click(screen.getByLabelText("Zero"));
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith(0);
    expect(display().textContent).toBe("Zero");
    await waitFor(() => expect(screen.queryByLabelText("-")).toBeNull());
    rerender(<Select {...props} options={[{ name: "Renamed Zero", value: 0 }]} />);
    expect(display().textContent).toBe("Renamed Zero");
    open();
    fireEvent.click(screen.getByLabelText("-"));
    expect(props.onChange.mock.calls).toEqual([[0], [null]]);
    expect(display().textContent).toBe("-");
  });

  it("does not display a stale option when the available options change", () => {
    const { props, rerender, display, open } = mount();
    open();
    fireEvent.click(screen.getByLabelText("Alpha"));
    expect(display().textContent).toBe("Alpha");
    rerender(<Select {...props} options={[options[2]]} />);
    expect(display().textContent).toBe("-");
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith(1);
  });
});

it("keeps disabled selects closed", () => {
  const { props, display, open } = mount({ selected: 1, disabled: true });
  open();
  expect(display().textContent).toBe("Alpha");
  expect(screen.queryByLabelText("Beta")).toBeNull();
  expect(props.onChange).not.toHaveBeenCalled();
});
