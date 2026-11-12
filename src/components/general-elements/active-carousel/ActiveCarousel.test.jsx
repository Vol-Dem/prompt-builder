// @vitest-environment jsdom
import { useState } from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { AnimatePresence } from "framer-motion";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import ActiveCarousel from "./ActiveCarousel";
import modelSlice, { modelActions } from "../../../store/model";
import guideSlice, { guideActions } from "../../../store/guide";
import ImageFullView from "../../ui/ImageFullView";
import Modal from "../../ui/Modal";
import { GUIDE_STEP_CLOSE_IMAGE } from "../../../variables/constants";

vi.mock("../carousel/Carousel", () => ({
  default: function Carousel() {
    const [full, setFull] = useState(false);
    const [form, setForm] = useState(false);
    return (
      <>
        <button onClick={() => setFull(true)}>Full view</button>
        <button onClick={() => setForm(true)}>Save image</button>
        <AnimatePresence>
          {full && (
            <ImageFullView
              src="https://example.com/image.jpg"
              onClose={() => setFull(false)}
            />
          )}
          {form && (
            <Modal title="Save image" onClose={() => setForm(false)}>
              <button>Save</button>
            </Modal>
          )}
        </AnimatePresence>
      </>
    );
  },
}));
vi.mock("./image-card/ImageCard", () => ({
  default: () => <p>Image details content</p>,
}));
vi.mock("../carousel/carousel-image-list/CarouselImageList", () => ({
  default: () => <p>Post image grid</p>,
}));
vi.mock("../guide/model/ImageCardCarouselGuide", () => ({
  default: () => null,
}));
vi.mock("../guide/model/CloseImageGuide", () => ({ default: () => null }));

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
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const openCarousel = async (data = {}) => {
  const user = userEvent.setup();
  const store = configureStore({
    reducer: {
      model: modelSlice.reducer,
      guide: guideSlice.reducer,
      general: (state = { headerIsFixed: true }) => state,
    },
  });
  render(
    <Provider store={store}>
      <main data-testid="page">
        <button
          onClick={() =>
            store.dispatch(
              modelActions.setActiveCarouselData({
                images: [{ id: 1, url: "https://example.com/image.jpg" }],
                postId: 1,
                saved: false,
                currImgNum: 0,
                ...data,
              }),
            )
          }
        >
          Open image
        </button>
        <ActiveCarousel />
        <button
          onClick={() =>
            store.dispatch(modelActions.setActiveCarouselData(null))
          }
        >
          Page action
        </button>
      </main>
    </Provider>,
  );
  const opener = screen.getByRole("button", { name: "Open image" });
  await user.click(opener);
  return { user, store, opener, dialog: screen.getByRole("dialog") };
};

it("names and focuses the inline dialog without moving it out of the page or blocking the prompt/navigation tab sequence", async () => {
  const { user, dialog } = await openCarousel();
  expect(screen.getByRole("dialog", { name: "Image details" })).toBe(dialog);
  expect(screen.getByTestId("page").contains(dialog)).toBe(true);
  expect(dialog.hasAttribute("aria-modal")).toBe(false);
  expect(document.activeElement).toBe(dialog);
  expect(
    within(dialog).getByRole("button", { name: "Close image details" }).type,
  ).toBe("button");
  await user.tab();
  await user.tab();
  await user.tab();
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Page action" }),
  );
  expect(screen.getByRole("dialog")).toBe(dialog);
});

it("names the existing all-images mode without changing its content", async () => {
  const { dialog } = await openCarousel({ currImgNum: null });
  expect(screen.getByRole("dialog", { name: "Post images" })).toBe(dialog);
  expect(within(dialog).getByText("Post image grid")).toBeTruthy();
  expect(within(dialog).queryByText("Image details content")).toBeNull();
});

it.each(["Escape", "Close"])(
  "closes the carousel through %s and restores focus after its exit",
  async (method) => {
    const { user, store, opener, dialog } = await openCarousel();
    if (method === "Escape") await user.keyboard("{Escape}");
    else
      await user.click(
        within(dialog).getByRole("button", { name: "Close image details" }),
      );
    expect(store.getState().model.activeCarouselData).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    if (dialog.isConnected) {
      expect(dialog.getAttribute("aria-hidden")).toBe("true");
      expect(dialog.hasAttribute("inert")).toBe(true);
    }
    await waitFor(() => expect(dialog.isConnected).toBe(false));
    expect(document.activeElement).toBe(opener);
  },
);

it.each([
  ["Full view", "Image full view"],
  ["Save image", "Save image"],
])(
  "closes only the nested %s dialog before returning to the carousel",
  async (action, name) => {
    const { user, store, opener } = await openCarousel();
    const childOpener = screen.getByRole("button", { name: action });
    await user.click(childOpener);
    expect(screen.getByRole("dialog", { name })).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(
      await screen.findByRole("dialog", { name: "Image details" }),
    ).toBeTruthy();
    expect(store.getState().model.activeCarouselData).not.toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(childOpener));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.activeElement).toBe(opener));
    expect(store.getState().model.activeCarouselData).toBeNull();
  },
);

it("keeps focus on a page action that intentionally closes the carousel", async () => {
  const { user, dialog } = await openCarousel();
  const pageAction = screen.getByRole("button", { name: "Page action" });
  await user.click(pageAction);
  await waitFor(() => expect(dialog.isConnected).toBe(false));
  expect(document.activeElement).toBe(pageAction);
});

it("preserves the guide step transition when Escape closes the image", async () => {
  const { user, store, dialog } = await openCarousel();
  act(() => {
    store.dispatch(guideActions.setGuideIsActive(true));
    store.dispatch(
      guideActions.setGuideStep({
        type: "model",
        value: GUIDE_STEP_CLOSE_IMAGE,
      }),
    );
  });
  await user.keyboard("{Escape}");
  await waitFor(() => expect(dialog.isConnected).toBe(false));
  expect(store.getState().guide.model.step).toBe(GUIDE_STEP_CLOSE_IMAGE + 1);
});
