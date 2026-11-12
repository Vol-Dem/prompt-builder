// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import Tooltip from "./Tooltip";
import Modal from "./Modal";

beforeEach(() => {
  for (const name of ["ResizeObserver", "IntersectionObserver"]) {
    vi.stubGlobal(
      name,
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  }
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("describes the actual trigger, preserves existing descriptions and handlers, and adds no extra tab stop", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const onFocus = vi.fn();
  render(
    <>
      <p id="existing">Existing help</p>
      <Tooltip asChild content="Tooltip help">
        <button onClick={onClick} onFocus={onFocus} aria-describedby="existing">
          Save
        </button>
      </Tooltip>
      <button>After</button>
    </>,
  );
  const button = screen.getByRole("button", { name: "Save" });
  const [existing, tooltipId] = button
    .getAttribute("aria-describedby")
    .split(" ");
  expect(existing).toBe("existing");
  expect(document.getElementById(tooltipId).hidden).toBe(true);
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(screen.queryByRole("group")).toBeNull();
  await user.tab();
  expect(document.activeElement).toBe(button);
  expect(onFocus).toHaveBeenCalledOnce();
  expect(screen.getByRole("tooltip").id).toBe(tooltipId);
  expect(screen.getByRole("tooltip").textContent).toBe("Tooltip help");
  await user.keyboard("{Enter}");
  expect(onClick).toHaveBeenCalledOnce();
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "After" }),
  );
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("keeps hover content open when the pointer moves over it and closes when it leaves", async () => {
  const user = userEvent.setup();
  render(
    <Tooltip label="Download status" content="Version downloaded">
      <span>Version 1</span>
    </Tooltip>,
  );
  const trigger = screen.getByRole("group", { name: "Download status" });
  await user.hover(trigger);
  const tooltip = screen.getByRole("tooltip");
  await user.hover(tooltip);
  expect(screen.getByRole("tooltip")).toBe(tooltip);
  await user.unhover(tooltip);
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("keeps a focused tooltip visible after pointer leave and closes it after blur", async () => {
  const user = userEvent.setup();
  render(
    <>
      <Tooltip asChild content="Help">
        <button>Action</button>
      </Tooltip>
      <button>After</button>
    </>,
  );
  const button = screen.getByRole("button", { name: "Action" });
  await user.tab();
  await user.hover(button);
  await user.unhover(button);
  expect(screen.getByRole("tooltip")).toBeTruthy();
  expect(document.activeElement).toBe(button);
  await user.tab();
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("keeps a hovered tooltip visible after focus moves elsewhere", async () => {
  const user = userEvent.setup();
  render(
    <>
      <Tooltip asChild content="Help">
        <button>Action</button>
      </Tooltip>
      <button>After</button>
    </>,
  );
  const button = screen.getByRole("button", { name: "Action" });
  await user.tab();
  await user.hover(button);
  act(() => screen.getByRole("button", { name: "After" }).focus());
  expect(screen.getByRole("tooltip")).toBeTruthy();
  await user.unhover(button);
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("does not reopen after Escape while focus or hover remains, and reopens on a fresh focus", async () => {
  const user = userEvent.setup();
  render(
    <>
      <Tooltip asChild content="Help">
        <button>Action</button>
      </Tooltip>
      <button>After</button>
    </>,
  );
  const button = screen.getByRole("button", { name: "Action" });
  await user.tab();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(document.activeElement).toBe(button);
  await user.hover(button);
  await user.unhover(button);
  expect(screen.queryByRole("tooltip")).toBeNull();
  await user.tab();
  await user.tab({ shift: true });
  expect(screen.getByRole("tooltip")).toBeTruthy();
});

it("gives disabled-control help a separate focus target while keeping the control natively disabled", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(
    <>
      <Tooltip
        asChild
        label="Saved images availability"
        content="Save the model first"
      >
        <button disabled onClick={onClick}>
          Saved
        </button>
      </Tooltip>
      <button>After</button>
    </>,
  );
  const group = screen.getByRole("group", {
    name: "Saved images availability",
  });
  const button = screen.getByRole("button", { name: "Saved" });
  expect(button.disabled).toBe(true);
  expect(group.getAttribute("aria-disabled")).toBe("true");
  await user.tab();
  expect(document.activeElement).toBe(group);
  expect(group.getAttribute("aria-describedby")).toBe(
    screen.getByRole("tooltip").id,
  );
  await user.keyboard("{Enter} ");
  expect(onClick).not.toHaveBeenCalled();
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "After" }),
  );
});

it("does not add tooltip roles, descriptions or focus stops for empty content", async () => {
  const user = userEvent.setup();
  render(
    <>
      <Tooltip content="">
        <span>Plain label</span>
      </Tooltip>
      <Tooltip asChild content="">
        <button aria-describedby="existing">Action</button>
      </Tooltip>
    </>,
  );
  expect(screen.queryByRole("group")).toBeNull();
  const button = screen.getByRole("button", { name: "Action" });
  expect(button.getAttribute("aria-describedby")).toBe("existing");
  await user.tab();
  expect(document.activeElement).toBe(button);
  await user.hover(button);
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("updates descriptions and visibility when content is added, changed or removed while hovered", async () => {
  const user = userEvent.setup();
  const view = (content) => (
    <Tooltip asChild content={content}>
      <button aria-describedby="existing">Action</button>
    </Tooltip>
  );
  const { rerender } = render(view(""));
  const button = screen.getByRole("button", { name: "Action" });
  await user.hover(button);
  rerender(view("First help"));
  expect(screen.getByRole("tooltip").textContent).toBe("First help");
  const ids = button.getAttribute("aria-describedby");
  rerender(view("Updated help"));
  expect(button.getAttribute("aria-describedby")).toBe(ids);
  expect(screen.getByRole("tooltip").textContent).toBe("Updated help");
  rerender(view(""));
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(button.getAttribute("aria-describedby")).toBe("existing");
});

it("dismisses the tooltip before its enclosing modal and leaves focus on the trigger", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <Modal title="Editor" onClose={onClose}>
      <Tooltip asChild content="Action help">
        <button>Action</button>
      </Tooltip>
    </Modal>,
  );
  await user.tab();
  const button = screen.getByRole("button", { name: "Action" });
  expect(document.activeElement).toBe(button);
  expect(screen.getByRole("tooltip")).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(document.activeElement).toBe(button);
  expect(onClose).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledOnce();
});

it("allows Escape to dismiss hover help without moving focus or dismissing the containing dialog", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <Modal title="Editor" onClose={onClose}>
      <Tooltip asChild content="Help">
        <button>Action</button>
      </Tooltip>
    </Modal>,
  );
  const dialog = screen.getByRole("dialog");
  await user.hover(screen.getByRole("button", { name: "Action" }));
  expect(screen.getByRole("tooltip")).toBeTruthy();
  expect(document.activeElement).toBe(dialog);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(document.activeElement).toBe(dialog);
  expect(onClose).not.toHaveBeenCalled();
});

it("lets a popup opened over the tooltip handle its own Escape", async () => {
  const user = userEvent.setup();
  const onKeyDown = vi.fn();
  render(
    <>
      <Tooltip asChild content="Help">
        <button>Action</button>
      </Tooltip>
      <div
        role="listbox"
        tabIndex={0}
        aria-label="Options"
        onKeyDown={onKeyDown}
      >
        <div role="option" aria-selected="true">
          Choice
        </div>
      </div>
    </>,
  );
  await user.hover(screen.getByRole("button", { name: "Action" }));
  act(() => screen.getByRole("listbox").focus());
  await user.keyboard("{Escape}");
  expect(onKeyDown).toHaveBeenCalledOnce();
  expect(screen.getByRole("tooltip")).toBeTruthy();
});

it("dismisses only the most recently opened tooltip for each Escape press", async () => {
  const user = userEvent.setup();
  render(
    <>
      <Tooltip asChild content="First help">
        <button>First</button>
      </Tooltip>
      <Tooltip asChild content="Second help">
        <button>Second</button>
      </Tooltip>
    </>,
  );
  await user.tab();
  await user.hover(screen.getByRole("button", { name: "Second" }));
  expect(screen.getAllByRole("tooltip")).toHaveLength(2);
  await user.keyboard("{Escape}");
  expect(screen.getByRole("tooltip").textContent).toBe("First help");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it.each([
  [
    "right",
    200,
    1000,
    "translate(100%, -100%)",
    "0%",
    "0%",
    "10px 10px 10px 0",
  ],
  ["right", 20, 1000, "translate(100%, 0%)", "100%", "0%", "0 10px 10px 10px"],
  ["right", 200, 250, "translate(0%, -100%)", "0%", "100%", "10px 10px 0 10px"],
  ["right", 20, 250, "translate(0%, 0%)", "100%", "100%", "10px 0 10px 10px"],
  ["left", 200, 1000, "translate(0%, -100%)", "0%", "100%", "10px 10px 0 10px"],
  ["center", 200, 1000, "translate(1%, -100%)", "0%", "0%", "10px"],
])(
  "preserves %s positioning with top=%s and body width=%s",
  async (defSide, top, width, transform, cssTop, right, radius) => {
    const user = userEvent.setup();
    vi.spyOn(document.body, "offsetWidth", "get").mockReturnValue(width);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function () {
        return this.getAttribute("role") === "tooltip"
          ? { width: 100, height: 40, top: 0, left: 0, right: 100, bottom: 40 }
          : {
              width: 50,
              height: 20,
              top,
              left: 150,
              right: 200,
              bottom: top + 20,
            };
      },
    );
    render(
      <Tooltip asChild content="Help" defSide={defSide}>
        <button>Action</button>
      </Tooltip>,
    );
    await user.tab();
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.style.transform).toBe(transform);
    expect(tooltip.style.top).toBe(cssTop);
    expect(tooltip.style.right).toBe(right);
    expect(tooltip.style.borderRadius).toBe(radius);
  },
);

it("removes its Escape listener when an open tooltip unmounts", async () => {
  const user = userEvent.setup();
  const { unmount } = render(
    <Tooltip asChild content="Help">
      <button>Action</button>
    </Tooltip>,
  );
  const add = vi.spyOn(document, "addEventListener");
  const remove = vi.spyOn(document, "removeEventListener");
  await user.tab();
  const entry = add.mock.calls.find(
    ([type, , capture]) => type === "keydown" && capture === true,
  );
  expect(entry).toBeTruthy();
  unmount();
  expect(remove).toHaveBeenCalledWith(...entry);
});
