// @vitest-environment jsdom
import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import Select from "./Select";
import classes from "./Select.module.scss";

const innerText = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "innerText",
);
beforeAll(() => {
  // Headless UI typeahead reads innerText, which jsdom does not implement.
  if (!innerText)
    Object.defineProperty(HTMLElement.prototype, "innerText", {
      configurable: true,
      get() {
        return this.textContent;
      },
    });
});
afterAll(() => {
  if (!innerText) delete HTMLElement.prototype.innerText;
});
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const options = [
  { name: "Zero", value: 0 },
  { name: "Alpha", value: 1 },
  { name: "Beta", value: 2 },
];
const mount = (overrides = {}) => {
  const props = {
    id: "choice",
    name: "choice",
    options,
    onChange: vi.fn(),
    ...overrides,
  };
  const view = render(<Select {...props} />);
  const display = () =>
    view.container.querySelector(`.${classes["select__input-field"]}`);
  return { ...view, props, display, open: () => fireEvent.click(display()) };
};

describe("controlled Select", () => {
  it("follows parent changes and matches string IDs to numeric option values", () => {
    const { props, rerender, display, open } = mount({ selected: "1" });
    expect(display().textContent).toBe("Alpha");
    rerender(<Select {...props} selected={2} />);
    expect(display().textContent).toBe("Beta");
    open();
    expect(
      screen
        .getByRole("option", { name: "Beta" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("option", { name: "Alpha" })
        .getAttribute("aria-selected"),
    ).toBe("false");
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it.each([undefined, null, ""])(
    "clears when the parent supplies %s",
    (selected) => {
      const { props, rerender, display, open } = mount({ selected: 1 });
      rerender(<Select {...props} selected={selected} />);
      expect(display().textContent).toBe("-");
      open();
      expect(
        screen.getByRole("option", { name: "-" }).getAttribute("aria-selected"),
      ).toBe("true");
      expect(
        screen
          .getByRole("option", { name: "Alpha" })
          .getAttribute("aria-selected"),
      ).toBe("false");
      // An explicit undefined remains controlled until the parent accepts a value.
      fireEvent.click(screen.getByRole("option", { name: "Beta" }));
      expect(props.onChange).toHaveBeenCalledExactlyOnceWith(2);
      expect(display().textContent).toBe("-");
    },
  );

  it("uses current option labels and drops the display of a removed option", () => {
    const { props, rerender, display } = mount({ selected: 1 });
    rerender(
      <Select {...props} options={[{ name: "Renamed Alpha", value: 1 }]} />,
    );
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
    fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith(2);
    expect(display().textContent).toBe("Alpha");
  });

  it("displays an accepted selection and treats numeric zero as a selected value", () => {
    const onChange = vi.fn();
    const Parent = () => {
      const [selected, setSelected] = useState(1);
      return (
        <Select
          options={options}
          selected={selected}
          onChange={(value) => {
            onChange(value);
            setSelected(value);
          }}
        />
      );
    };
    const { container } = render(<Parent />);
    const display = container.querySelector(
      `.${classes["select__input-field"]}`,
    );
    fireEvent.click(display);
    fireEvent.click(screen.getByRole("option", { name: "Zero" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(0);
    expect(display.textContent).toBe("Zero");
  });

  it("initializes numeric zero without offering a blank option", () => {
    const { display, open } = mount({ selected: 0 });
    expect(display().textContent).toBe("Zero");
    open();
    expect(
      screen
        .getByRole("option", { name: "Zero" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.queryByRole("option", { name: "-" })).toBeNull();
  });
});

describe("uncontrolled Select", () => {
  it("stores the chosen ID, follows new option labels, and clears through the blank option", async () => {
    const { props, rerender, display, open } = mount();
    open();
    fireEvent.click(screen.getByRole("option", { name: "Zero" }));
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith(0);
    expect(display().textContent).toBe("Zero");
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "-" })).toBeNull(),
    );
    rerender(
      <Select {...props} options={[{ name: "Renamed Zero", value: 0 }]} />,
    );
    expect(display().textContent).toBe("Renamed Zero");
    open();
    fireEvent.click(screen.getByRole("option", { name: "-" }));
    expect(props.onChange.mock.calls).toEqual([[0], [null]]);
    expect(display().textContent).toBe("-");
  });

  it("does not display a stale option when the available options change", () => {
    const { props, rerender, display, open } = mount();
    open();
    fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
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
  expect(screen.queryByRole("option", { name: "Beta" })).toBeNull();
  expect(props.onChange).not.toHaveBeenCalled();
});

it.each(["{Enter}", " ", "{ArrowDown}", "{ArrowUp}"])(
  "opens from the keyboard with %s and focuses the listbox",
  async (key) => {
    const user = userEvent.setup();
    const { props } = mount({ selected: 1, label: "Choice" });
    const button = screen.getByLabelText("Choice");
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard(key);
    const listbox = screen.getByRole("listbox");
    expect(document.activeElement).toBe(listbox);
    expect(button.getAttribute("aria-controls")).toBe(listbox.id);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(props.onChange).not.toHaveBeenCalled();
  },
);

it("selects with arrow keys and Enter, reports the raw numeric value, and restores focus", async () => {
  const user = userEvent.setup();
  const { props, display } = mount({ selected: "1", label: "Choice" });
  const button = screen.getByLabelText("Choice");
  await user.click(button);
  const listbox = screen.getByRole("listbox");
  expect(listbox.getAttribute("aria-activedescendant")).toBe(
    screen.getByRole("option", { name: "Alpha" }).id,
  );
  await user.keyboard("{ArrowDown}");
  expect(listbox.getAttribute("aria-activedescendant")).toBe(
    screen.getByRole("option", { name: "Beta" }).id,
  );
  await user.keyboard("{Enter}");
  expect(props.onChange).toHaveBeenCalledExactlyOnceWith(2);
  expect(display().textContent).toBe("Alpha");
  expect(document.activeElement).toBe(button);
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("supports Home, End and typeahead selection", async () => {
  const user = userEvent.setup();
  const { props, display, open } = mount({ selected: 0 });
  open();
  const listbox = screen.getByRole("listbox");
  const active = (name) =>
    expect(listbox.getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name }).id,
    );
  await user.keyboard("{End}");
  active("Beta");
  await user.keyboard("{Home}");
  active("Zero");
  await user.keyboard("a");
  active("Alpha");
  await user.keyboard("{Enter}");
  expect(props.onChange).toHaveBeenCalledExactlyOnceWith(1);
  expect(display().textContent).toBe("Zero");
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("dismisses with Escape without changing the value and hides the exiting menu from assistive technology", async () => {
  const user = userEvent.setup();
  const { props, display } = mount({ selected: 1, label: "Choice" });
  const button = screen.getByLabelText("Choice");
  await user.click(button);
  const listbox = screen.getByRole("listbox");
  await user.keyboard("{ArrowDown}{Escape}");
  expect(props.onChange).not.toHaveBeenCalled();
  expect(display().textContent).toBe("Alpha");
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("listbox")).toBeNull();
  // A retained animation frame must not leave a selectable menu behind.
  if (listbox.isConnected) {
    expect(listbox.getAttribute("aria-hidden")).toBe("true");
    expect(listbox.hasAttribute("inert")).toBe(true);
  }
});

it.each([false, true])(
  "dismisses on Tab (shift=%s) and moves to the adjacent control",
  async (shift) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <button>Before</button>
        <Select
          label="Choice"
          options={options}
          selected={1}
          onChange={onChange}
        />
        <button>After</button>
      </>,
    );
    await user.click(screen.getByLabelText("Choice"));
    await user.tab({ shift });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: shift ? "Before" : "After" }),
    );
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  },
);

it("isolates instance IDs, outside dismissal, and selections", async () => {
  const user = userEvent.setup();
  const firstChange = vi.fn();
  const secondChange = vi.fn();
  render(
    <>
      <Select label="First" options={options} onChange={firstChange} />
      <Select label="Second" options={options} onChange={secondChange} />
    </>,
  );
  const first = screen.getByLabelText("First");
  const second = screen.getByLabelText("Second");
  expect(first.id).not.toBe(second.id);
  await user.click(first);
  const firstListboxId = screen.getByRole("listbox").id;
  await user.click(second);
  const secondListbox = screen.getByRole("listbox");
  expect(secondListbox.id).not.toBe(firstListboxId);
  await user.click(screen.getByRole("option", { name: "Beta" }));
  expect(secondChange).toHaveBeenCalledExactlyOnceWith(2);
  expect(firstChange).not.toHaveBeenCalled();
  expect(first.textContent).toBe("-");
  expect(second.textContent).toBe("Beta");
});

it("uses text alternatives for rich options during typeahead and reports their string values", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <Select
      label="Source"
      onChange={onChange}
      options={[
        {
          name: <img alt="AITOOLS" src="aitools.png" />,
          value: "aitools",
          textValue: "AITOOLS",
        },
        {
          name: <img alt="Civitai" src="civitai.png" />,
          value: "civitai",
          textValue: "Civitai",
        },
      ]}
    />,
  );
  await user.click(screen.getByLabelText("Source"));
  await user.keyboard("c");
  expect(
    screen.getByRole("listbox").getAttribute("aria-activedescendant"),
  ).toBe(screen.getByRole("option", { name: "Civitai" }).id);
  await user.keyboard("{Enter}");
  expect(onChange).toHaveBeenCalledExactlyOnceWith("civitai");
  expect(screen.getByLabelText("Source").querySelector("img").alt).toBe(
    "Civitai",
  );
});

it("preserves explicit accessible names, descriptions, invalid state and IDs", () => {
  render(
    <>
      <span id="external-label">External choice</span>
      <p id="hint">Choose a model</p>
      <Select
        id="named"
        label="Visible label"
        aria-label="Overridden choice"
        options={options}
        selected={1}
        onChange={vi.fn()}
      />
      <Select
        id="external"
        aria-labelledby="external-label"
        aria-describedby="hint"
        aria-invalid="true"
        options={options}
        selected={2}
        onChange={vi.fn()}
      />
    </>,
  );
  expect(screen.getByRole("button", { name: "Overridden choice" }).id).toBe(
    "named",
  );
  const external = screen.getByRole("button", { name: "External choice" });
  expect(external.id).toBe("external");
  expect(external.getAttribute("aria-describedby")).toBe("hint");
  expect(external.getAttribute("aria-invalid")).toBe("true");
});

it("serializes one scalar value while closed, honors external form and disabled state, and never submits on selection", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((e) => e.preventDefault());
  const onChange = vi.fn();
  const ref = { current: null };
  const view = (disabled) => (
    <>
      <form id="values" data-testid="values" onSubmit={onSubmit} />
      <Select
        id="form-choice"
        label="Choice"
        name="choice"
        form="values"
        ref={ref}
        data-native="value"
        disabled={disabled}
        options={options}
        onChange={onChange}
      />
    </>
  );
  const { rerender } = render(view(false));
  const form = screen.getByTestId("values");
  expect([...new FormData(form)]).toEqual([["choice", ""]]);
  await user.click(screen.getByLabelText("Choice"));
  await user.click(screen.getByRole("option", { name: "Zero" }));
  expect([...new FormData(form)]).toEqual([["choice", "0"]]);
  expect(ref.current.value).toBe("0");
  expect(ref.current.getAttribute("data-native")).toBe("value");
  await user.click(screen.getByLabelText("Choice"));
  await user.keyboard("{End}{Enter}");
  expect([...new FormData(form)]).toEqual([["choice", "2"]]);
  expect(onChange.mock.calls).toEqual([[0], [2]]);
  expect(onSubmit).not.toHaveBeenCalled();
  rerender(view(true));
  expect([...new FormData(form)]).toEqual([]);
  expect(screen.getByLabelText("Choice").disabled).toBe(true);
});

it("does not emit a change when the current option is selected again", async () => {
  const user = userEvent.setup();
  const { props, open } = mount({ selected: 1 });
  open();
  await user.click(screen.getByRole("option", { name: "Alpha" }));
  expect(props.onChange).not.toHaveBeenCalled();
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("selects with Space after arrow navigation", async () => {
  const user = userEvent.setup();
  const { props, open } = mount({ selected: 0 });
  open();
  await user.keyboard("{ArrowDown}");
  await user.keyboard(" ");
  expect(props.onChange).toHaveBeenCalledExactlyOnceWith(1);
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("opens on Enter inside a form without submitting it", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event) => event.preventDefault());
  const onChange = vi.fn();
  render(
    <form onSubmit={onSubmit}>
      <Select
        label="Choice"
        options={options}
        selected={0}
        onChange={onChange}
      />
      <button type="submit">Submit</button>
    </form>,
  );
  await user.tab();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("listbox")).toBeTruthy();
  expect(onSubmit).not.toHaveBeenCalled();
  await user.keyboard("{ArrowDown}{Enter}");
  expect(onChange).toHaveBeenCalledExactlyOnceWith(1);
  expect(onSubmit).not.toHaveBeenCalled();
});
