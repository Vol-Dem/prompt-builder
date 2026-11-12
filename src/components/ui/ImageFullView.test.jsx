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

import ImageFullView from "./ImageFullView";
import Modal from "./Modal";
import classes from "./ImageFullView.module.scss";

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

const Example = ({ onClose, ...props }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open full view</button>
      <button>Page action</button>
      <AnimatePresence>
        {open && (
          <ImageFullView
            src="https://example.com/image.jpg"
            {...props}
            onClose={() => {
              onClose?.();
              setOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const openExample = async (props) => {
  const user = userEvent.setup();
  const view = render(<Example {...props} />);
  const opener = screen.getByRole("button", { name: "Open full view" });
  await user.click(opener);
  return { user, opener, dialog: screen.getByRole("dialog"), ...view };
};

it("names and focuses the fullscreen dialog, isolates the page and wraps its navigation controls", async () => {
  const { user, dialog } = await openExample({
    alt: "Landscape",
    controls: true,
    nextSlide: vi.fn(),
    prevSlide: vi.fn(),
  });
  expect(screen.getByRole("dialog", { name: "Full view: Landscape" })).toBe(
    dialog,
  );
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  expect(
    within(dialog).getByRole("img", { name: "Landscape" }).getAttribute("src"),
  ).toBe("https://example.com/image.jpg");
  await waitFor(() => expect(document.activeElement).toBe(dialog));
  expect(screen.queryByRole("button", { name: "Page action" })).toBeNull();

  const close = within(dialog).getByRole("button", { name: "Close full view" });
  const previous = within(dialog).getByRole("button", {
    name: "Previous media",
  });
  const next = within(dialog).getByRole("button", { name: "Next media" });
  await user.tab();
  expect(document.activeElement).toBe(close);
  await user.tab();
  expect(document.activeElement).toBe(previous);
  await user.tab();
  expect(document.activeElement).toBe(next);
  await user.tab();
  expect(document.activeElement).toBe(close);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(next);
});

it.each(["Escape", "Close", "backdrop"])(
  "dismisses fullscreen media through %s once and restores the opener after the exit animation",
  async (method) => {
    const onClose = vi.fn();
    const { user, opener, dialog } = await openExample({ onClose });
    if (method === "Escape") await user.keyboard("{Escape}");
    if (method === "Close")
      await user.click(
        within(dialog).getByRole("button", { name: "Close full view" }),
      );
    if (method === "backdrop")
      await user.click(dialog.querySelector(`.${classes["modal--backdrop"]}`));
    expect(onClose).toHaveBeenCalledExactlyOnceWith();
    expect(screen.queryByRole("dialog")).toBeNull();
    if (dialog.isConnected) {
      expect(dialog.getAttribute("aria-hidden")).toBe("true");
      expect(dialog.hasAttribute("inert")).toBe(true);
    }
    await waitFor(() => expect(dialog.isConnected).toBe(false));
    await waitFor(() => expect(document.activeElement).toBe(opener));
    expect(screen.getByRole("button", { name: "Page action" })).toBeTruthy();
  },
);

it("keeps content clicks and previous/next actions inside the viewer and preserves focus when the source changes", async () => {
  const onClose = vi.fn();
  const nextSlide = vi.fn();
  const prevSlide = vi.fn();
  const props = {
    alt: "Landscape",
    controls: true,
    nextSlide,
    prevSlide,
    onClose,
  };
  const { user, dialog, rerender } = await openExample(props);
  await user.click(within(dialog).getByRole("img"));
  await user.click(
    within(dialog).getByRole("button", { name: "Previous media" }),
  );
  await user.click(within(dialog).getByRole("button", { name: "Next media" }));
  expect(prevSlide).toHaveBeenCalledOnce();
  expect(nextSlide).toHaveBeenCalledOnce();
  expect(onClose).not.toHaveBeenCalled();
  const nextButton = document.activeElement;
  rerender(<Example {...props} src="https://example.com/next.jpg" />);
  expect(within(dialog).getByRole("img").getAttribute("src")).toBe(
    "https://example.com/next.jpg",
  );
  expect(document.activeElement).toBe(nextButton);
});

it("names video viewers without replacing their native playback controls or sources", async () => {
  const { dialog } = await openExample({ type: "video" });
  expect(screen.getByRole("dialog", { name: "Video full view" })).toBe(dialog);
  const video = dialog.querySelector("video");
  expect(video.controls).toBe(true);
  expect(video.autoplay).toBe(true);
  expect(video.loop).toBe(true);
  expect(video.muted).toBe(true);
  expect(
    [...video.querySelectorAll("source")].map((source) => source.type),
  ).toEqual(["video/webm", "video/mp4"]);
  expect(
    within(dialog).queryByRole("button", { name: "Next media" }),
  ).toBeNull();
});

it("closes only a fullscreen viewer opened from a shared modal and returns to that modal's opener", async () => {
  const user = userEvent.setup();
  const Nested = () => {
    const [modal, setModal] = useState(false);
    const [full, setFull] = useState(false);
    return (
      <>
        <button onClick={() => setModal(true)}>Open editor</button>
        <AnimatePresence>
          {modal && (
            <Modal title="Editor" onClose={() => setModal(false)}>
              <button onClick={() => setFull(true)}>Open full view</button>
              <AnimatePresence>
                {full && (
                  <ImageFullView
                    src="https://example.com/image.jpg"
                    onClose={() => setFull(false)}
                  />
                )}
              </AnimatePresence>
            </Modal>
          )}
        </AnimatePresence>
      </>
    );
  };
  render(<Nested />);
  const editorOpener = screen.getByRole("button", { name: "Open editor" });
  await user.click(editorOpener);
  const fullOpener = screen.getByRole("button", { name: "Open full view" });
  await user.click(fullOpener);
  expect(screen.getByRole("dialog", { name: "Image full view" })).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(await screen.findByRole("dialog", { name: "Editor" })).toBeTruthy();
  await waitFor(() => expect(document.activeElement).toBe(fullOpener));
  await user.keyboard("{Escape}");
  await waitFor(() => expect(document.activeElement).toBe(editorOpener));
});
