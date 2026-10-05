// @vitest-environment jsdom
import { createRef, StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CopyControl from "./CopyControl";
import PromptButtonCopy from "../prompt/prompt-button-copy/PromptButtonCopy";
import ImageSeed from "../general-elements/active-carousel/image-card/image-seed/ImageSeed";
import TagList from "../general-elements/tag-list/TagList";
import QuickStartGuide from "../general-elements/guide/QuickStartGuide";
import promptClasses from "../prompt/prompt-button-copy/PromptButtonCopy.module.scss";
import seedClasses from "../general-elements/active-carousel/image-card/image-seed/ImageSeed.module.scss";
import tagClasses from "../general-elements/tag-list/TagList.module.scss";
import guideClasses from "../general-elements/guide/QuickStartGuide.module.scss";
import buttonClasses from "./buttons/ButtonTertiary.module.scss";

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));
vi.mock("../../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector) => selector({ prompt: { curPrompt: "", curNegPrompt: "" } }),
}));
const writeText = vi.fn();
beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockReset().mockResolvedValue(undefined);
  dispatch.mockReset();
  vi.stubGlobal("navigator", { clipboard: { writeText } });
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const icons = { idleIcon: <span>Copy icon</span>, copiedIcon: <span>Copied icon</span> };

it("forwards native attributes, labels and refs while owning the copy action", () => {
  const ref = createRef();
  render(<CopyControl {...icons} text="clipboard value" type="button" title="Copy"
    data-type="negative" ref={ref} className="base" copiedClassName="copied">
    Visible label{" "}
  </CopyControl>);
  const button = screen.getByRole("button", { name: "Visible label Copy icon" });
  expect(ref.current).toBe(button);
  expect(button.type).toBe("button");
  expect(button.getAttribute("data-type")).toBe("negative");
  expect(button.title).toBe("Copy");
  expect(button.className).toBe("base");
  fireEvent.click(button);
  expect(writeText).toHaveBeenCalledExactlyOnceWith("clipboard value");
  expect(button.className).toBe("base copied");
  expect(screen.getByRole("button", { name: "Visible label Copied icon" })).toBe(button);
});

it("shows immediate feedback while the clipboard write is still pending", () => {
  writeText.mockReturnValue(new Promise(() => {}));
  render(<CopyControl {...icons} text="pending" />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Copied icon")).toBeTruthy();
  advance(1000);
  expect(screen.getByText("Copy icon")).toBeTruthy();
});

it("keeps existing feedback on text changes and copies the latest text on the next click", () => {
  const { rerender } = render(<CopyControl {...icons} text="old" />);
  fireEvent.click(screen.getByRole("button"));
  advance(500);
  rerender(<CopyControl {...icons} text="new" />);
  expect(screen.getByText("Copied icon")).toBeTruthy();
  fireEvent.click(screen.getByRole("button"));
  expect(writeText.mock.calls.map(([text]) => text)).toEqual(["old", "new"]);
  advance(999);
  expect(screen.getByText("Copied icon")).toBeTruthy();
  advance(1);
  expect(screen.getByText("Copy icon")).toBeTruthy();
});

it("respects native disabled controls", () => {
  render(<CopyControl {...icons} text="disabled" disabled />);
  fireEvent.click(screen.getByRole("button"));
  expect(writeText).not.toHaveBeenCalled();
  expect(screen.getByText("Copy icon")).toBeTruthy();
});

it("clears pending feedback timers on unmount, including under Strict Mode", () => {
  const { unmount } = render(<StrictMode><CopyControl {...icons} text="copy" /></StrictMode>);
  fireEvent.click(screen.getByRole("button"));
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

const consumers = [
  { name: "prompt", element: () => <PromptButtonCopy promptData={"  cat,\nlight  "} />,
    control: () => screen.getByTitle("Copy"), text: "  cat,\nlight  ", tag: "BUTTON", type: "button",
    classes: [promptClasses["btn-copy"]],
    isCopied: (control) => control.querySelector("svg").classList.contains(promptClasses.copied),
  },
  { name: "seed", element: () => <ImageSeed value={-1} />,
    control: () => screen.getByText("-1"), text: "-1", label: "-1", tag: "SPAN", type: null,
    classes: [seedClasses.seed],
    isCopied: (control) => control.classList.contains(seedClasses["seed--copied"]),
  },
  { name: "tags", element: () => <TagList tags={["cat", "light"]} name="Tags" promptType="negative" />,
    control: () => screen.getByTitle("Copy"), text: "cat, light", tag: "BUTTON", type: null,
    classes: [buttonClasses.btn, tagClasses["btn-copy"]],
    isCopied: (control) => control.classList.contains(tagClasses["btn-copy--copied"]),
  },
  { name: "guide", element: () => <QuickStartGuide stage={2} onClose={vi.fn()} />,
    control: () => screen.getByTitle("Copy"), text: "727427", label: "727427", tag: "BUTTON", type: null,
    classes: [buttonClasses.btn, guideClasses["btn-copy"]],
    isCopied: (control) => control.classList.contains(guideClasses["btn-copy--copied"]),
  },
];
const iconPath = (control) => [...control.querySelectorAll("svg path")].map((path) => path.getAttribute("d")).join("|");

it.each(consumers)("preserves $name markup and formatting while restarting feedback on every click", ({
  element, control: getControl, text, label, tag, type, classes, isCopied,
}) => {
  render(element());
  const control = getControl();
  expect(control.tagName).toBe(tag);
  expect(control.getAttribute("type")).toBe(type);
  for (const name of classes) expect(control.classList.contains(name)).toBe(true);
  if (label) expect(control.textContent.trim()).toBe(label);
  const initialIcon = iconPath(control);
  fireEvent.click(control);
  expect(writeText).toHaveBeenCalledExactlyOnceWith(text);
  expect(isCopied(control)).toBe(true);
  const copiedIcon = iconPath(control);
  expect(copiedIcon).not.toBe(initialIcon);
  advance(500);
  fireEvent.click(control);
  advance(500);
  expect(isCopied(control)).toBe(true);
  expect(iconPath(control)).toBe(copiedIcon);
  advance(499);
  expect(isCopied(control)).toBe(true);
  advance(1);
  expect(isCopied(control)).toBe(false);
  expect(iconPath(control)).toBe(initialIcon);
  if (label) expect(control.textContent.trim()).toBe(label);
  expect(writeText).toHaveBeenCalledTimes(2);
  expect(dispatch).not.toHaveBeenCalled();
});

it("preserves the guide's feedback across stage changes and clears its timer when closed", () => {
  const props = { onClose: vi.fn() };
  const { rerender, unmount } = render(<QuickStartGuide {...props} stage={2} />);
  fireEvent.click(screen.getByTitle("Copy"));
  advance(300);
  rerender(<QuickStartGuide {...props} stage={1} />);
  expect(screen.queryByTitle("Copy")).toBeNull();
  advance(300);
  rerender(<QuickStartGuide {...props} stage={2} />);
  expect(screen.getByTitle("Copy").classList.contains(guideClasses["btn-copy--copied"])).toBe(true);
  advance(400);
  expect(screen.getByTitle("Copy").classList.contains(guideClasses["btn-copy--copied"])).toBe(false);
  fireEvent.click(screen.getByTitle("Copy"));
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
