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
import { ERROR_MESSAGE_CLIPBOARD_COPY, ERROR_MESSAGE_CLIPBOARD_UNAVAILABLE } from "../../variables/constants";

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
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("navigator", { clipboard: { writeText } });
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const click = async (element) => act(async () => { fireEvent.click(element); });
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((finish, fail) => { resolve = finish; reject = fail; });
  return { promise, resolve, reject };
};
const icons = { idleIcon: <span>Copy icon</span>, copiedIcon: <span>Copied icon</span> };

it("forwards native attributes, labels and refs while owning the copy action", async () => {
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
  await click(button);
  expect(writeText).toHaveBeenCalledExactlyOnceWith("clipboard value");
  expect(button.className).toBe("base copied");
  expect(screen.getByRole("button", { name: "Visible label Copied icon" })).toBe(button);
});

it("starts its one-second feedback only after the clipboard write succeeds", async () => {
  const pending = deferred();
  writeText.mockReturnValue(pending.promise);
  render(<CopyControl {...icons} text="pending" />);
  await click(screen.getByRole("button"));
  expect(screen.getByText("Copy icon")).toBeTruthy();
  expect(screen.queryByText("Copied icon")).toBeNull();
  expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
  expect(vi.getTimerCount()).toBe(0);
  advance(5000);
  expect(screen.getByText("Copy icon")).toBeTruthy();
  await act(async () => { pending.resolve(); });
  expect(screen.getByText("Copied icon")).toBeTruthy();
  expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("false");
  advance(999);
  expect(screen.getByText("Copied icon")).toBeTruthy();
  advance(1);
  expect(screen.getByText("Copy icon")).toBeTruthy();
});

it("keeps existing feedback on text changes and copies the latest text on the next click", async () => {
  const { rerender } = render(<CopyControl {...icons} text="old" />);
  await click(screen.getByRole("button"));
  advance(500);
  rerender(<CopyControl {...icons} text="new" />);
  expect(screen.getByText("Copied icon")).toBeTruthy();
  await click(screen.getByRole("button"));
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

it("clears pending feedback timers on unmount, including under Strict Mode", async () => {
  const { unmount } = render(<StrictMode><CopyControl {...icons} text="copy" /></StrictMode>);
  await click(screen.getByRole("button"));
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

it.each(consumers)("preserves $name markup and formatting while restarting feedback after each successful copy", async ({
  element, control: getControl, text, label, tag, type, classes, isCopied,
}) => {
  render(element());
  const control = getControl();
  expect(control.tagName).toBe(tag);
  expect(control.getAttribute("type")).toBe(type);
  for (const name of classes) expect(control.classList.contains(name)).toBe(true);
  if (label) expect(control.textContent.trim()).toBe(label);
  const initialIcon = iconPath(control);
  await click(control);
  expect(writeText).toHaveBeenCalledExactlyOnceWith(text);
  expect(isCopied(control)).toBe(true);
  const copiedIcon = iconPath(control);
  expect(copiedIcon).not.toBe(initialIcon);
  advance(500);
  await click(control);
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

it("preserves the guide's feedback across stage changes and clears its timer when closed", async () => {
  const props = { onClose: vi.fn() };
  const { rerender, unmount } = render(<QuickStartGuide {...props} stage={2} />);
  await click(screen.getByTitle("Copy"));
  advance(300);
  rerender(<QuickStartGuide {...props} stage={1} />);
  expect(screen.queryByTitle("Copy")).toBeNull();
  advance(300);
  rerender(<QuickStartGuide {...props} stage={2} />);
  expect(screen.getByTitle("Copy").classList.contains(guideClasses["btn-copy--copied"])).toBe(true);
  advance(400);
  expect(screen.getByTitle("Copy").classList.contains(guideClasses["btn-copy--copied"])).toBe(false);
  await click(screen.getByTitle("Copy"));
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("ignores overlapping clicks and uses the latest text on a later copy", async () => {
  const pending = deferred();
  writeText.mockReturnValueOnce(pending.promise);
  const { rerender } = render(<CopyControl {...icons} text="first" />);
  await click(screen.getByRole("button"));
  rerender(<CopyControl {...icons} text="latest" />);
  await click(screen.getByRole("button"));
  expect(writeText).toHaveBeenCalledExactlyOnceWith("first");
  expect(screen.queryByText("Copied icon")).toBeNull();
  await act(async () => { pending.resolve(); });
  await click(screen.getByRole("button"));
  expect(writeText.mock.calls.map(([text]) => text)).toEqual(["first", "latest"]);
  expect(screen.getByText("Copied icon")).toBeTruthy();
});

it.each(consumers)("shows a safe error for failed $name copies and allows dismissal and retry", async ({
  element, control: getControl, text, isCopied,
}) => {
  const original = new DOMException("Private browser policy details", "NotAllowedError");
  const pending = deferred();
  writeText.mockReturnValueOnce(pending.promise);
  render(element());
  const control = getControl();
  await click(control);
  expect(isCopied(control)).toBe(false);
  expect(writeText).toHaveBeenCalledExactlyOnceWith(text);
  await act(async () => { pending.reject(original); });
  expect(isCopied(control)).toBe(false);
  expect(screen.getByText(ERROR_MESSAGE_CLIPBOARD_COPY)).toBeTruthy();
  expect(screen.queryByText(original.message)).toBeNull();
  expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  expect(control.getAttribute("aria-busy")).toBe("false");
  await click(screen.getByRole("button", { name: "Got it!" }));
  expect(screen.queryByText(ERROR_MESSAGE_CLIPBOARD_COPY)).toBeNull();
  await click(control);
  expect(writeText).toHaveBeenCalledTimes(2);
  expect(isCopied(control)).toBe(true);
  expect(dispatch).not.toHaveBeenCalled();
});

it.each(["missing navigator", "missing clipboard", "missing writeText"])("handles %s without claiming success", async (reason) => {
  vi.stubGlobal("navigator", reason === "missing navigator" ? undefined
    : reason === "missing clipboard" ? {} : { clipboard: {} });
  render(<CopyControl {...icons} text="value" />);
  await click(screen.getByRole("button"));
  expect(writeText).not.toHaveBeenCalled();
  expect(screen.getByText("Copy icon")).toBeTruthy();
  expect(screen.queryByText("Copied icon")).toBeNull();
  expect(screen.getByText(ERROR_MESSAGE_CLIPBOARD_UNAVAILABLE)).toBeTruthy();
  expect(console.error).toHaveBeenCalledOnce();
});

it.each(["throw", "reject", "clipboard getter"])("handles an immediate clipboard %s failure", async (failure) => {
  const original = new Error("Internal clipboard failure");
  if (failure === "throw") writeText.mockImplementationOnce(() => { throw original; });
  else if (failure === "reject") writeText.mockRejectedValueOnce(original);
  else vi.stubGlobal("navigator", { get clipboard() { throw original; } });
  render(<CopyControl {...icons} text="value" />);
  await click(screen.getByRole("button"));
  expect(screen.getByText("Copy icon")).toBeTruthy();
  expect(screen.getByText(ERROR_MESSAGE_CLIPBOARD_COPY)).toBeTruthy();
  expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
});

it("clears a previous copied state when a new attempt fails and clears the error on retry", async () => {
  render(<CopyControl {...icons} text="value" />);
  const button = screen.getByRole("button");
  await click(button);
  expect(screen.getByText("Copied icon")).toBeTruthy();
  advance(500);
  writeText.mockRejectedValueOnce(new Error("Copy failed"));
  await click(button);
  expect(screen.getByText("Copy icon")).toBeTruthy();
  expect(screen.getByText(ERROR_MESSAGE_CLIPBOARD_COPY)).toBeTruthy();
  advance(1000);
  expect(screen.getByText("Copy icon")).toBeTruthy();
  await click(button);
  expect(screen.queryByText(ERROR_MESSAGE_CLIPBOARD_COPY)).toBeNull();
  expect(screen.getByText("Copied icon")).toBeTruthy();
  advance(999);
  expect(screen.getByText("Copied icon")).toBeTruthy();
  advance(1);
  expect(screen.getByText("Copy icon")).toBeTruthy();
});

it.each(["success", "failure"])("ignores a late %s from an unmounted control", async (outcome) => {
  const pending = deferred();
  writeText.mockReturnValueOnce(pending.promise);
  const { unmount } = render(<StrictMode><CopyControl {...icons} text="old" /></StrictMode>);
  await click(screen.getByRole("button"));
  unmount();
  render(<CopyControl {...icons} text="new" />);
  await act(async () => {
    if (outcome === "success") pending.resolve();
    else pending.reject(new Error("Late clipboard error"));
  });
  expect(screen.getByText("Copy icon")).toBeTruthy();
  expect(screen.queryByText("Copied icon")).toBeNull();
  expect(screen.queryByText(ERROR_MESSAGE_CLIPBOARD_COPY)).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
  expect(console.error).not.toHaveBeenCalled();
  await click(screen.getByRole("button"));
  expect(writeText).toHaveBeenLastCalledWith("new");
  expect(screen.getByText("Copied icon")).toBeTruthy();
});
