// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import Button from "./buttons/Button";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";
import Notification from "./Notification";
import Spinner from "./Spinner";

afterEach(cleanup);

it("keeps a loading action named and announces progress outside its busy subtree", () => {
  const onClick = vi.fn();
  const ref = createRef();
  const props = { type: "submit", ref, onClick, loadingMessage: "Saving model" };
  const { rerender } = render(<Button {...props} loading={false}>Save</Button>);
  const button = screen.getByRole("button", { name: "Save" });
  const status = screen.getByRole("status");
  expect(status.textContent).toBe("");
  expect(button.type).toBe("submit");
  expect(ref.current).toBe(button);
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledOnce();

  rerender(<Button {...props} loading disabled>Save</Button>);
  expect(screen.getByRole("button", { name: "Save" })).toBe(button);
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.disabled).toBe(true);
  expect(within(button).queryByRole("status")).toBeNull();
  expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull();
  expect(status.textContent).toBe("Saving model");
  expect(status.closest('[aria-busy="true"]')).toBeNull();
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledOnce();

  rerender(<Button {...props} loading={false}>Save</Button>);
  expect(screen.getByRole("status")).toBe(status);
  expect(status.textContent).toBe("");
  expect(button.getAttribute("aria-busy")).toBe("false");
  expect(button.disabled).toBe(false);
});

it("preserves explicit names and native busy state for ordinary buttons", () => {
  const { rerender } = render(<Button aria-label="Send changes" loading>Save</Button>);
  expect(screen.getByRole("button", { name: "Send changes" })).toBeTruthy();
  rerender(<Button aria-busy="true">Submit</Button>);
  expect(screen.getByRole("button", { name: "Submit" }).getAttribute("aria-busy")).toBe("true");
  expect(screen.queryByRole("status")).toBeNull();
});

it("exposes a labelled loading status and allows decorative spinners without announcements", () => {
  const { container, rerender } = render(<Spinner label="Loading models" />);
  const status = screen.getByRole("status", { name: "Loading models" });
  expect(status.textContent).toBe("Loading models");
  expect(status.getAttribute("aria-atomic")).toBe("true");
  rerender(<Spinner decorative />);
  expect(screen.queryByRole("status")).toBeNull();
  expect(container.firstChild.getAttribute("aria-hidden")).toBe("true");
});

it("exposes errors as alerts and success feedback as atomic polite statuses", () => {
  render(<><ErrorMessage>Save failed</ErrorMessage><SuccessMessage>Saved</SuccessMessage></>);
  expect(screen.getByRole("alert").textContent).toBe("Save failed");
  expect(screen.getByRole("alert").getAttribute("aria-atomic")).toBe("true");
  expect(screen.getByRole("status").textContent).toBe("Saved");
  expect(screen.getByRole("status").getAttribute("aria-atomic")).toBe("true");
  expect(screen.getByRole("status").querySelector("svg").getAttribute("aria-hidden")).toBe("true");
});

it.each([['warning', 'alert'], ['notification', 'status']])(
  "announces a %s notification message without including its dismissal action",
  (type, role) => {
    const onClick = vi.fn();
    render(<Notification type={type} title="Notice" onClick={onClick}>Message</Notification>);
    const message = screen.getByRole(role);
    expect(message.textContent).toBe("NoticeMessage");
    expect(message.getAttribute("aria-atomic")).toBe("true");
    expect(within(message).queryByRole("button")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Got it!" }));
    expect(onClick).toHaveBeenCalledOnce();
  },
);
