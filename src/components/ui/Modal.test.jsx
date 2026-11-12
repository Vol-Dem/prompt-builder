// @vitest-environment jsdom
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import Modal from "./Modal";
import Select from "./forms/Select";
import ComboSelect from "./forms/ComboSelect";
import Notification from "./Notification";
import modalClasses from "./Modal.module.scss";
import cardClasses from "./Card.module.scss";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
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

const Example = ({ children = <p>Content</p>, modalProps = {}, onClose }) => {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid="app">
      <button onClick={() => setOpen(true)}>Open</button>
      <button>Background action</button>
      <AnimatePresence>
        {open && (
          <Modal
            title="Settings"
            {...modalProps}
            onClose={() => {
              onClose?.();
              setOpen(false);
            }}
          >
            {children}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
const openExample = async (props) => {
  const user = userEvent.setup();
  render(<Example {...props} />);
  const opener = screen.getByRole("button", { name: "Open" });
  await user.click(opener);
  const dialog = await screen.findByRole("dialog");
  return { user, opener, dialog };
};

it("names the dialog from its existing heading and keeps the Card, root and content classes", async () => {
  const { dialog } = await openExample({
    modalProps: { disableClass: "custom-root", className: "custom-content" },
  });
  expect(screen.getByRole("dialog", { name: "Settings" })).toBe(dialog);
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  expect(dialog.classList.contains(modalClasses.modal)).toBe(true);
  expect(dialog.classList.contains("custom-root")).toBe(true);
  expect(
    within(dialog)
      .getByRole("heading", { level: 2 })
      .classList.contains(modalClasses.title),
  ).toBe(true);
  const card = within(dialog).getByText("Content").parentElement;
  expect(card.classList.contains(cardClasses.card)).toBe(true);
  expect(card.parentElement.classList.contains("custom-content")).toBe(true);
  expect(within(dialog).getByRole("button", { name: "Close" }).type).toBe(
    "button",
  );
});

it("supports nonvisual labels, external labels and descriptions without adding a heading", async () => {
  const user = userEvent.setup();
  const Named = () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <span id="label">External name</span>
        <p id="description">Help text</p>
        <button onClick={() => setOpen(true)}>Open</button>
        {open && (
          <Modal
            aria-labelledby="label"
            aria-describedby="description"
            onClose={() => setOpen(false)}
          >
            <p>Content</p>
          </Modal>
        )}
      </>
    );
  };
  render(<Named />);
  await user.click(screen.getByRole("button", { name: "Open" }));
  const dialog = screen.getByRole("dialog", { name: "External name" });
  expect(dialog.getAttribute("aria-describedby")).toBe("description");
  expect(within(dialog).queryByRole("heading")).toBeNull();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("allows an explicit accessible label to override a rich visible title", async () => {
  const { dialog } = await openExample({
    modalProps: {
      title: (
        <>
          Presets <button>Help</button>
        </>
      ),
      "aria-label": "Presets",
    },
  });
  expect(screen.getByRole("dialog", { name: "Presets" })).toBe(dialog);
  expect(within(dialog).getByRole("button", { name: "Help" })).toBeTruthy();
});

it.each([undefined, "Confirm action"])(
  "names an untitled modal with label=%s",
  async (label) => {
    const { dialog } = await openExample({
      modalProps: { title: undefined, "aria-label": label },
    });
    expect(screen.getByRole("dialog", { name: label ?? "Dialog" })).toBe(
      dialog,
    );
    expect(within(dialog).queryByRole("heading")).toBeNull();
  },
);

it("focuses the dialog when no control requests initial focus and marks the background inert", async () => {
  const { dialog } = await openExample();
  await waitFor(() => expect(document.activeElement).toBe(dialog));
  await waitFor(() =>
    expect(
      screen.getByTestId("app").closest('[aria-hidden="true"]'),
    ).not.toBeNull(),
  );
  expect(
    screen.queryByRole("button", { name: "Background action" }),
  ).toBeNull();
});

it("preserves native input autofocus and the normal forward tab order", async () => {
  const { user, dialog } = await openExample({
    children: (
      <>
        <input aria-label="Name" autoFocus />
        <button>Save</button>
      </>
    ),
  });
  const input = within(dialog).getByRole("textbox", { name: "Name" });
  await waitFor(() => expect(document.activeElement).toBe(input));
  await user.tab();
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Save" }),
  );
  await user.tab();
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Close" }),
  );
});

it("wraps Tab and Shift+Tab within the dialog", async () => {
  const { user, dialog } = await openExample({
    children: (
      <>
        <button data-autofocus>First</button>
        <button>Last</button>
      </>
    ),
  });
  const first = within(dialog).getByRole("button", { name: "First" });
  const last = within(dialog).getByRole("button", { name: "Last" });
  const close = within(dialog).getByRole("button", { name: "Close" });
  await waitFor(() => expect(document.activeElement).toBe(first));
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(close);
  await user.tab();
  expect(document.activeElement).toBe(first);
  await user.tab();
  expect(document.activeElement).toBe(last);
  await user.tab();
  expect(document.activeElement).toBe(close);
});

it.each(["Escape", "Close", "backdrop"])(
  "dismisses through %s once, restores focus and scroll, and excludes its exit animation from interaction",
  async (method) => {
    const onClose = vi.fn();
    const { user, dialog, opener } = await openExample({ onClose });
    if (method === "Escape") await user.keyboard("{Escape}");
    if (method === "Close")
      await user.click(within(dialog).getByRole("button", { name: "Close" }));
    if (method === "backdrop")
      await user.click(
        dialog.querySelector(`.${modalClasses["modal__backdrop"]}`),
      );
    expect(onClose).toHaveBeenCalledExactlyOnceWith();
    expect(screen.queryByRole("dialog")).toBeNull();
    if (dialog.isConnected) {
      expect(dialog.getAttribute("aria-hidden")).toBe("true");
      expect(dialog.hasAttribute("inert")).toBe(true);
    }
    await waitFor(() => expect(document.activeElement).toBe(opener));
    await waitFor(() =>
      expect(document.documentElement.style.overflow).toBe(""),
    );
    await waitFor(() => expect(dialog.isConnected).toBe(false));
    expect(
      screen.getByTestId("app").closest('[aria-hidden="true"]'),
    ).toBeNull();
  },
);

it("does not dismiss on content clicks or force a guarded onClose callback to unmount", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <Modal title="Pending operation" onClose={onClose}>
      <button>Content action</button>
    </Modal>,
  );
  await user.click(screen.getByRole("button", { name: "Content action" }));
  expect(onClose).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledExactlyOnceWith();
  expect(
    screen.getByRole("dialog", { name: "Pending operation" }),
  ).toBeTruthy();
});

it("closes only the nested shared modal and restores the parent before the page", async () => {
  const user = userEvent.setup();
  const Nested = () => {
    const [parent, setParent] = useState(false);
    const [child, setChild] = useState(false);
    return (
      <>
        <button onClick={() => setParent(true)}>Open parent</button>
        <AnimatePresence>
          {parent && (
            <Modal title="Parent" onClose={() => setParent(false)}>
              <button onClick={() => setChild(true)}>Open child</button>
              <AnimatePresence>
                {child && (
                  <Modal title="Child" onClose={() => setChild(false)}>
                    <p>Nested content</p>
                  </Modal>
                )}
              </AnimatePresence>
            </Modal>
          )}
        </AnimatePresence>
      </>
    );
  };
  render(<Nested />);
  const opener = screen.getByRole("button", { name: "Open parent" });
  await user.click(opener);
  const childOpener = screen.getByRole("button", { name: "Open child" });
  await user.click(childOpener);
  expect(screen.getByRole("dialog", { name: "Child" })).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog", { name: "Child" })).toBeNull();
  expect(await screen.findByRole("dialog", { name: "Parent" })).toBeTruthy();
  await waitFor(() => expect(document.activeElement).toBe(childOpener));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() => expect(document.activeElement).toBe(opener));
});

it("lets Escape dismiss a Select menu before dismissing the modal", async () => {
  const onClose = vi.fn();
  const { user, dialog } = await openExample({
    onClose,
    children: (
      <Select
        label="Choice"
        options={[
          { name: "Alpha", value: 1 },
          { name: "Beta", value: 2 },
        ]}
        selected={1}
        onChange={vi.fn()}
      />
    ),
  });
  const button = within(dialog).getByLabelText("Choice");
  await user.click(button);
  expect(screen.getByRole("listbox")).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(screen.getByRole("dialog")).toBe(dialog);
  expect(onClose).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(button);
  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledExactlyOnceWith();
});

it("allows a portaled combobox menu to select an option without dismissing the modal", async () => {
  const onClose = vi.fn();
  const Options = () => {
    const [selected, setSelected] = useState({ id: "a", name: "Alpha" });
    const [query, setQuery] = useState("");
    return (
      <ComboSelect
        label="Category"
        selected={selected}
        query={query}
        setQuery={setQuery}
        setSelected={(value) => setSelected(value)}
        validation={{}}
        optionsData={[
          { id: "a", name: "Alpha" },
          { id: "b", name: "Beta" },
        ]}
      />
    );
  };
  const { user, dialog } = await openExample({
    onClose,
    children: <Options />,
  });
  const input = within(dialog).getByRole("combobox", { name: "Category" });
  await user.click(input);
  const option = await screen.findByRole("option", { name: "Beta" });
  expect(dialog.querySelector(`.${cardClasses.card}`).contains(option)).toBe(
    false,
  );
  await user.click(option);
  expect(input.value).toBe("Beta");
  expect(screen.getByRole("dialog")).toBe(dialog);
  expect(onClose).not.toHaveBeenCalled();
});

it("isolates the page on each reopening and restores it after every close", async () => {
  const { user, opener, dialog } = await openExample();
  const app = screen.getByTestId("app");
  await waitFor(() =>
    expect(app.closest('[aria-hidden="true"]')).not.toBeNull(),
  );
  await user.keyboard("{Escape}");
  await waitFor(() => expect(dialog.isConnected).toBe(false));
  expect(app.closest('[aria-hidden="true"]')).toBeNull();
  await user.click(opener);
  const reopened = await screen.findByRole("dialog");
  await waitFor(() =>
    expect(app.closest('[aria-hidden="true"]')).not.toBeNull(),
  );
  await user.keyboard("{Escape}");
  await waitFor(() => expect(reopened.isConnected).toBe(false));
  expect(app.closest('[aria-hidden="true"]')).toBeNull();
  expect(document.activeElement).toBe(opener);
});

it("keeps a nested feedback notification reachable from the modal's tab order", async () => {
  const dismiss = vi.fn();
  const Feedback = () => {
    const [visible, setVisible] = useState(true);
    return (
      visible && (
        <Notification
          type="warning"
          title="Copy failed"
          onClick={() => {
            dismiss();
            setVisible(false);
          }}
        >
          Try again
        </Notification>
      )
    );
  };
  const onClose = vi.fn();
  const { user, dialog } = await openExample({
    onClose,
    children: <Feedback />,
  });
  const dismissButton = screen.getByRole("button", { name: "Got it!" });
  for (let i = 0; i < 4 && document.activeElement !== dismissButton; i++)
    await user.tab();
  expect(document.activeElement).toBe(dismissButton);
  await user.keyboard("{Enter}");
  expect(dismiss).toHaveBeenCalledOnce();
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog")).toBe(dialog);
});
