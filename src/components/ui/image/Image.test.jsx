// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import Image from "./Image";
import Modal from "../Modal";

vi.mock("../../../store/hooks/hooks", () => ({
  useAppSelector: (select) => select({ general: { isMobile: true } }),
}));
vi.mock("../../../hooks/use-intersection", () => ({ default: () => true }));

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
});

it("keeps noninteractive images inside links and checkbox labels free of extra buttons", () => {
  render(
    <>
      <a href="/model">
        <Image src="image.webp" alt="Model preview" />
      </a>
      <label>
        <Image src="selected.webp" alt="Select image" />
        <input type="checkbox" />
      </label>
    </>,
  );
  expect(
    screen.getByRole("link", { name: "Model preview" }).querySelector("button"),
  ).toBeNull();
  expect(screen.getByRole("checkbox", { name: "Select image" })).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
});

it.each(["{Enter}", " "])(
  "activates a named thumbnail action once with %s",
  async (key) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Image
        src="image.webp"
        alt="Portrait"
        actionLabel="Open portrait details"
        onClick={onClick}
      />,
    );
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Open portrait details" }),
    );
    await user.keyboard(key);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  },
);

it("opens full view from a thumbnail inside a modal and restores focus to that action on Escape", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <Modal title="Help" onClose={onClose}>
      <Image src="image.webp" alt="Instructions" fullView />
    </Modal>,
  );
  const opener = screen.getByRole("button", {
    name: "Open full view: Instructions",
  });
  await user.tab();
  expect(document.activeElement).toBe(opener);
  await user.keyboard("{Enter}");
  expect(
    screen.getByRole("dialog", { name: "Full view: Instructions" }),
  ).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(await screen.findByRole("dialog", { name: "Help" })).toBeTruthy();
  await waitFor(() => expect(document.activeElement).toBe(opener));
  expect(onClose).not.toHaveBeenCalled();
});
