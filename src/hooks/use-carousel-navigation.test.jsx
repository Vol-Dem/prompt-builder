// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useCarouselNavigation from "./use-carousel-navigation";
import CarouselContent from "../components/general-elements/carousel/CarouselContent";
import { SETTINGS_CAROUSEL_TRANSITION_DURATION } from "../variables/constants";

const { dispatch, track, picker } = vi.hoisted(() => ({
  dispatch: vi.fn(), track: { current: null }, picker: { current: null },
}));
vi.mock("../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector) => selector({
    general: { nsfwMode: false }, model: { model: { name: "Model" }, savedImages: null },
  }),
}));
vi.mock("../store/upload", () => ({ uploadActions: { addToQueue: (payload) => ({ type: "queue", payload }) } }));
vi.mock("../store/modelThunks", () => ({ deleteImgPost: vi.fn() }));
vi.mock("../store/imagesThunks", () => ({ updateCollectionPostsData: vi.fn() }));
vi.mock("../utils/fetch/fetchImages", () => ({ updateImagePostData: vi.fn() }));
vi.mock("../components/general-elements/carousel/carousel-images/CarouselImages", () => ({
  default: (props) => {
    track.current = props;
    return <div ref={props.ref} style={{ gap: "10px" }} data-testid="track">
      <div data-slide="true" />
      <button onClick={() => props.onClick(2)}>Open image</button>
      <button onClick={props.onOpen}>Full view</button>
      <button onClick={props.onDelete}>Delete list</button>
    </div>;
  },
}));
vi.mock("../components/general-elements/carousel/carousel-save/CarouselSave", () => ({
  default: ({ onOpenForm }) => <button onClick={() => onOpenForm({ isOpen: true, location: "models", type: "save" })}>Save model</button>,
}));
vi.mock("../components/ui/Modal", () => ({ default: ({ children, onClose }) => <div role="dialog">{children}<button onClick={onClose}>Close dialog</button></div> }));
vi.mock("../components/ui/ImageFullView", () => ({
  default: ({ src, onClose, nextSlide, prevSlide }) => <div role="dialog">
    <span>{src}</span><button onClick={onClose}>Close view</button>
    <button onClick={nextSlide}>Full next</button><button onClick={prevSlide}>Full previous</button>
  </div>,
}));
vi.mock("../components/forms/choose-image-form/ChooseImageForm", () => ({
  default: (props) => {
    picker.current = props;
    return <button onClick={() => props.onSave("models", [2], null)}>Save chosen</button>;
  },
}));
vi.mock("../components/forms/save-to-collection-form/SaveToCollectionForm", () => ({ default: () => null }));

const images = [1, 2, 3, 4].map((id) => ({ id, postId: 7, url: "image-" + id, type: "image" }));
let navigation;
let wrapperWidth;
beforeEach(() => {
  wrapperWidth = 350;
  dispatch.mockReset();
  track.current = null;
  picker.current = null;
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function () {
    return this.dataset.slide ? 100 : wrapperWidth;
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const Harness = (props) => {
  navigation = useCarouselNavigation({ imagesData: images, fullViewIsOpen: false, ...props });
  return <div ref={navigation.refs.carouselRef}
    onTouchStart={navigation.gestures.onStart} onTouchMove={navigation.gestures.onMove} onTouchEnd={navigation.gestures.onEnd}
    data-testid="carousel">
    <div ref={navigation.refs.imagesRef} style={{ gap: "10px" }}><div data-slide="true" /></div>
  </div>;
};
const mount = (props = {}) => render(<Harness visibleImgAmount={1} {...props} />);
const next = () => act(() => navigation.actions.next());
const previous = () => act(() => navigation.actions.previous());
const end = () => act(() => document.dispatchEvent(new Event("transitionend")));
const swipe = (from, to) => {
  const node = screen.getByTestId("carousel");
  fireEvent.touchStart(node, { touches: [{ clientX: from }] });
  fireEvent.touchMove(node, { touches: [{ clientX: to }] });
  fireEvent.touchEnd(node);
};

it("measures fixed-width slides and initializes the duplicated leading edge", () => {
  mount();
  expect(navigation.slides).toEqual({
    visibleAmount: 1, currImgNum: 0, visibleImages: [1], translate: -110,
    curTransitionDur: 0, carouselWidth: 100, showNavigation: true, hasMultipleImages: true,
  });
});

it.each([[350, 3, 320, true], [900, 4, 430, false], [80, 0, 100, true]])(
  "calculates automatic visibility for wrapper width %s", (width, count, carouselWidth, showNavigation) => {
    wrapperWidth = width;
    mount({ visibleImgAmount: 0 });
    expect(navigation.slides).toMatchObject({ visibleAmount: count, carouselWidth, showNavigation });
    expect(navigation.slides.visibleImages).toEqual(Array.from({ length: count }, (_, i) => count + i));
  },
);

it("preserves the initial active image and callback timing", () => {
  const onActiveNumChange = vi.fn();
  mount({ activeImgNum: 2, onActiveNumChange });
  expect(navigation.slides).toMatchObject({ currImgNum: 2, visibleImages: [3], translate: -330 });
  expect(onActiveNumChange).not.toHaveBeenCalled();
  next();
  expect(navigation.slides.currImgNum).toBe(3);
  expect(onActiveNumChange).toHaveBeenCalledExactlyOnceWith(3);
});

it("wraps forward after the trailing duplicate finishes transitioning", () => {
  mount();
  for (let i = 0; i < 3; i++) { next(); end(); }
  next();
  expect(navigation.slides).toMatchObject({ currImgNum: 0, visibleImages: [5], translate: -550, curTransitionDur: SETTINGS_CAROUSEL_TRANSITION_DURATION });
  end();
  expect(navigation.slides).toMatchObject({ currImgNum: 0, visibleImages: [1], translate: -110, curTransitionDur: 0 });
});

it("wraps backward after the leading duplicate finishes transitioning", () => {
  mount();
  previous();
  expect(navigation.slides).toMatchObject({ currImgNum: 3, visibleImages: [0], translate: -0 });
  end();
  expect(navigation.slides).toMatchObject({ currImgNum: 3, visibleImages: [4], translate: -440, curTransitionDur: 0 });
});

it("keeps the full visible range when several images wrap backward", () => {
  mount({ visibleImgAmount: 2 });
  previous(); end();
  expect(navigation.slides.visibleImages).toEqual([1, 2]);
  previous(); end();
  expect(navigation.slides).toMatchObject({ visibleImages: [4, 5], translate: -440, carouselWidth: 210 });
});

it("blocks arrow navigation between transitionstart and transitionend", () => {
  mount();
  next();
  act(() => document.dispatchEvent(new Event("transitionstart")));
  next(); previous();
  expect(navigation.slides.currImgNum).toBe(1);
  end();
  next();
  expect(navigation.slides.currImgNum).toBe(2);
});

it("preserves pagination offsets and callbacks when multiple slides are visible", () => {
  const onActiveNumChange = vi.fn();
  mount({ visibleImgAmount: 2, onActiveNumChange });
  act(() => navigation.actions.goTo(2));
  expect(navigation.slides).toMatchObject({ currImgNum: 2, visibleImages: [4, 5], translate: -330 });
  expect(onActiveNumChange).toHaveBeenCalledExactlyOnceWith(2);
});

it("suppresses arrow callbacks during full view and still reports pagination changes", () => {
  const onActiveNumChange = vi.fn();
  const { rerender } = mount({ fullViewIsOpen: true, onActiveNumChange });
  next(); end(); previous(); end();
  expect(onActiveNumChange).not.toHaveBeenCalled();
  act(() => navigation.actions.goTo(2));
  expect(onActiveNumChange).toHaveBeenCalledExactlyOnceWith(2);
  end();
  rerender(<Harness visibleImgAmount={1} fullViewIsOpen={false} onActiveNumChange={onActiveNumChange} />);
  next();
  expect(onActiveNumChange).toHaveBeenLastCalledWith(3);
});

it.each([[100, 59, 1], [100, 141, 3], [100, 60, 0], [100, 140, 0], [0, 80, 0]])(
  "preserves swipe threshold and coordinate handling from %s to %s", (from, to, index) => {
    mount();
    swipe(from, to);
    expect(navigation.slides.currImgNum).toBe(index);
  },
);

it("resets gesture coordinates after a completed swipe", () => {
  mount();
  swipe(100, 50);
  end();
  fireEvent.touchEnd(screen.getByTestId("carousel"));
  expect(navigation.slides.currImgNum).toBe(1);
});

it("supports the existing mouse-event branch in gesture handlers", () => {
  mount();
  act(() => navigation.gestures.onStart({ clientX: 100 }));
  act(() => navigation.gestures.onMove({ clientX: 50 }));
  act(() => navigation.gestures.onEnd());
  expect(navigation.slides.currImgNum).toBe(1);
});

it.each([{ imagesData: [] }, { imagesData: images.slice(0, 1) }])("keeps arrows inert for $imagesData.length images", ({ imagesData }) => {
  mount({ imagesData });
  next(); previous();
  expect(navigation.slides.currImgNum).toBe(0);
  expect(navigation.slides.showNavigation).toBe(false);
  expect(navigation.slides.hasMultipleImages).toBe(false);
});

it("removes all active transition listeners on unmount", () => {
  const registered = new Map([["transitionstart", new Set()], ["transitionend", new Set()]]);
  const add = document.addEventListener.bind(document);
  const remove = document.removeEventListener.bind(document);
  vi.spyOn(document, "addEventListener").mockImplementation((event, callback, options) => {
    registered.get(event)?.add(callback); add(event, callback, options);
  });
  vi.spyOn(document, "removeEventListener").mockImplementation((event, callback, options) => {
    registered.get(event)?.delete(callback); remove(event, callback, options);
  });
  const { unmount } = mount();
  next(); end(); next();
  expect(registered.get("transitionend").size).toBe(1);
  unmount();
  expect([...registered.values()].every((set) => set.size === 0)).toBe(true);
});

const mountContent = (props = {}) => render(<CarouselContent imagesData={images}
  visibleImgAmount={1} postId={7} modelId={42} versionId={9} saved={false}
  location="models" locationId={42} imageHeight={200} {...props} />);

it("connects arrows and pagination to the image track and active-carousel opening", () => {
  const onActiveNumChange = vi.fn();
  const { container } = mountContent({ onActiveNumChange });
  expect(container.firstChild.style.maxWidth).toBe("100px");
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(track.current.visibleImages).toEqual([2]);
  expect(track.current.translate).toBe(-220);
  end();
  fireEvent.click(container.querySelectorAll("li")[2]);
  expect(track.current.visibleImages).toEqual([3]);
  expect(onActiveNumChange).toHaveBeenLastCalledWith(2);
  fireEvent.click(screen.getByRole("button", { name: "Open image" }));
  expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
    type: "model/setActiveCarouselData", payload: expect.objectContaining({ currImgNum: 1, images, postId: 7 }),
  }));
});

it("keeps full-view state local and reports the current image when the viewer closes", () => {
  const onActiveNumChange = vi.fn();
  mountContent({ onActiveNumChange });
  fireEvent.click(screen.getByRole("button", { name: "Full view" }));
  fireEvent.click(screen.getByRole("button", { name: "Full next" }));
  expect(screen.getByText("image-2")).toBeTruthy();
  expect(onActiveNumChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Close view" }));
  expect(onActiveNumChange).toHaveBeenCalledExactlyOnceWith(1);
});

it("passes the navigated image to the save dialog and queues the selected image locally", () => {
  mountContent();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.click(screen.getByRole("button", { name: "Save model" }));
  expect(picker.current.activeImageIndex).toBe(1);
  fireEvent.click(screen.getByRole("button", { name: "Save chosen" }));
  expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
    type: "queue", payload: expect.objectContaining({ ids: [2], images: [images[1]], postId: 7, versionId: 9 }),
  }));
});
