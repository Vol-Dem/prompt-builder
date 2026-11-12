// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import CarouselImages from "./CarouselImages";

vi.mock("../../../../store/hooks/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector) =>
    selector({
      general: { sfwValue: "None", nsfwMode: true, isMobile: true },
      model: { curVersion: null },
    }),
}));
vi.mock("../../../../store/modelThunks", () => ({ setPreviewImg: vi.fn() }));
vi.mock("../../button-square-add/ButtonSquareAdd", () => ({
  default: ({ previewData }) => <button>Sidebar {previewData.id}</button>,
}));
vi.mock("../set-tagset-preview/SetTagSetPreview", () => ({
  default: () => null,
}));

afterEach(cleanup);

const images = [1, 2, 3].map((id) => ({
  id,
  type: "image",
  nsfw: false,
  width: 100,
  height: 100,
  url: `https://image.civitai.com/image-${id}/width=450/image.webp`,
}));

const mountLoadedTrack = (visibleAmount) => {
  const props = {
    images,
    visibleAmount,
    versionId: null,
    saved: false,
    active: false,
    side: false,
    menu: true,
    translate: 0,
    transitionDur: 0,
    onClick: vi.fn(),
    onOpen: vi.fn(),
    onDelete: vi.fn(),
  };
  const windowAt = (first) =>
    Array.from({ length: visibleAmount }, (_, i) => first + i);
  const view = render(
    <CarouselImages {...props} visibleImages={windowAt(visibleAmount)} />,
  );
  const show = (visibleImages, extraProps = {}) => {
    view.rerender(
      <CarouselImages
        {...props}
        visibleImages={visibleImages}
        {...extraProps}
      />,
    );
    for (const image of view.container.querySelectorAll("img"))
      fireEvent.load(image);
  };
  // Visit every original slide so hidden slides and edge copies retain loaded controls.
  for (
    let first = visibleAmount;
    first < visibleAmount + images.length;
    first++
  ) {
    show(windowAt(first));
  }
  return { show, track: view.container.firstElementChild };
};

it.each([
  [1, [1]],
  [1, [2]],
  [1, [0]],
  [1, [4]],
  [2, [3, 4]],
  [2, [5, 6]],
])(
  "exposes only the visible track positions with visibleAmount=%s and visibleImages=%s",
  (visibleAmount, visibleImages) => {
    const { show, track } = mountLoadedTrack(visibleAmount);
    show(visibleImages);
    const slides = [...track.children];
    expect(slides).toHaveLength(images.length + 2 * visibleAmount);
    expect(track.querySelectorAll("img")).toHaveLength(slides.length);
    expect(
      screen.getAllByRole("button", { name: /^Sidebar/, hidden: true }),
    ).toHaveLength(slides.length);

    slides.forEach((slide, position) => {
      const visible = visibleImages.includes(position);
      expect(slide.hasAttribute("inert")).toBe(!visible);
      expect(slide.getAttribute("aria-hidden")).toBe(visible ? null : "true");
    });
    const accessibleActions = screen.getAllByRole("button", {
      name: /^Sidebar/,
    });
    expect(accessibleActions).toHaveLength(visibleImages.length);
    expect(accessibleActions.map((button) => button.parentElement)).toEqual(
      visibleImages.map((position) => slides[position]),
    );
  },
);

it("makes every loaded slide inert when no slide is visible or the carousel is hidden", () => {
  const { show, track } = mountLoadedTrack(1);
  for (const [visibleImages, extraProps] of [
    [[], {}],
    [[1], { caruselIsVisible: false }],
  ]) {
    show(visibleImages, extraProps);
    expect(screen.queryAllByRole("button", { name: /^Sidebar/ })).toHaveLength(
      0,
    );
    expect(
      [...track.children].every((slide) => slide.hasAttribute("inert")),
    ).toBe(true);
    expect(track.querySelectorAll("img")).toHaveLength(5);
  }
});
