// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CarouselImage from "./carousel-image/CarouselImage";
import SetTagSetPreview from "./set-tagset-preview/SetTagSetPreview";
import { setPreviewImg, setTagSetPreviewImg } from "../../../store/modelThunks";
import { transformSrcPreview } from "../../../utils/imageUtils";
import {
  ERROR_MESSAGE_COLLECTION_PREVIEW_SAVE,
  ERROR_MESSAGE_MODEL_PREVIEW_SAVE,
  ERROR_MESSAGE_TAG_SET_PREVIEW_SAVE,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
  SUCCESS_MESSAGE_COLLECTION_PREVIEW_SAVED,
  SUCCESS_MESSAGE_MODEL_PREVIEW_SAVED,
} from "../../../variables/constants";

const { dispatch, state } = vi.hoisted(() => ({ dispatch: vi.fn(), state: {} }));
vi.mock("../../../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector) => selector(state),
}));
vi.mock("../../../store/modelThunks", () => ({
  setPreviewImg: vi.fn(), setTagSetPreviewImg: vi.fn(),
}));
vi.mock("../button-square-add/ButtonSquareAdd", () => ({ default: () => null }));
vi.mock("../../ui/Modal", () => ({ default: ({ children, onClose, title }) => (
  <div role="dialog" aria-label={title}>
    {children}
    <button onClick={onClose}>Close</button>
  </div>
) }));
vi.mock("../../ui/image/Image", () => ({ default: ({ src }) => <img alt="Tag-set preview" src={src} /> }));
vi.mock("../../forms/tag-sets-form/TagSetsForm", () => ({ default: () => null }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal(), AnimatePresence: ({ children }) => children,
}));

const src = "https://image.civitai.com/image-id/width=450/image.webp";
const tagSets = [
  { name: "Portrait", value: "portrait", imgUrl: "old.webp", nsfwImgUrl: "old-nsfw.webp" },
  { name: "Landscape", value: "landscape", imgUrl: "landscape.webp" },
];
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((finish, fail) => { resolve = finish; reject = fail; });
  return { promise, resolve, reject };
};
let pending;

beforeEach(() => {
  vi.resetAllMocks();
  pending = deferred();
  state.general = { nsfwMode: true, isMobile: false };
  state.model = {
    curVersion: null,
    model: {
      id: 42,
      defaultCustomData: { tagSetsData: tagSets },
      modelVersionsCustomData: { 9: { versionId: 9, name: "Version", tagSetsData: tagSets } },
    },
  };
  setPreviewImg.mockReturnValue({ type: "test/preview" });
  setTagSetPreviewImg.mockReturnValue({ type: "test/tagSetPreview" });
  dispatch.mockImplementation(() => pending.promise);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const mountImage = (location = "models", type = "image") => {
  const onDelete = vi.fn();
  render(<CarouselImage id="1" src={src} alt="Current image" nsfw={false}
    position={0} saved active={false} side={false} menu location={location} locationId={42}
    imageData={{ id: 1, type, width: 100, height: 100 }}
    onClick={vi.fn()} onOpen={vi.fn()} onDelete={onDelete} />);
  if (type === "image") fireEvent.load(screen.getByAltText("Current image"));
  fireEvent.click(screen.getByRole("button", { name: "Image settings" }));
  return { onDelete };
};

describe("model and collection previews", () => {
  it.each([
    ["models", false, "image"], ["models", true, "video"],
    ["collections", false, "video"], ["collections", true, "image"],
  ])("closes the %s menu immediately (nsfw=%s, type=%s), then shows success after persistence", async (location, nsfw, type) => {
    const { onDelete } = mountImage(location, type);
    const label = nsfw ? "Set as NSFW preview" : "Set as preview";
    fireEvent.click(screen.getByRole("button", { name: label }));

    expect(setPreviewImg).toHaveBeenCalledExactlyOnceWith(
      transformSrcPreview(src, SETTINGS_IMAGE_PREVIEW_WIDTH_BIG, type).previewSrc,
      nsfw, location, 42, type,
    );
    expect(screen.queryByRole("button", { name: label })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("button", { name: "Image settings" }).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Image settings" }));
    expect(setPreviewImg).toHaveBeenCalledOnce();
    expect(onDelete).not.toHaveBeenCalled();

    await act(async () => { pending.resolve(); });
    expect(screen.queryByRole("button", { name: label })).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("button", { name: "Image settings" }).disabled).toBe(false);
    const dialog = screen.getByRole("dialog", { name: "Preview" });
    expect(within(dialog).getByText(location === "models"
      ? SUCCESS_MESSAGE_MODEL_PREVIEW_SAVED : SUCCESS_MESSAGE_COLLECTION_PREVIEW_SAVED)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each(["models", "collections"])("shows a specific %s error in a dismissible modal and allows retry from the menu", async (location) => {
    mountImage(location);
    const button = screen.getByRole("button", { name: "Set as preview" });
    fireEvent.click(button);
    const original = new Error("Internal write details");
    await act(async () => { pending.reject(original); });

    const dialog = screen.getByRole("dialog", { name: "Preview" });
    expect(within(dialog).getByTestId("error-message").textContent).toBe(location === "models"
      ? ERROR_MESSAGE_MODEL_PREVIEW_SAVE : ERROR_MESSAGE_COLLECTION_PREVIEW_SAVE);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
    expect(screen.queryByRole("button", { name: "Set as preview" })).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();

    pending = deferred();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Image settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Set as preview" }));
    expect(setPreviewImg).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId("error-message")).toBeNull();
    expect(screen.queryByRole("button", { name: "Set as preview" })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    await act(async () => { pending.resolve(); });
    expect(screen.queryByRole("button", { name: "Set as preview" })).toBeNull();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

const mountTagSets = (version) => {
  render(<SetTagSetPreview src={src} />);
  if (version === "9") fireEvent.click(screen.getByText("Version"));
};

describe("tag-set previews", () => {
  it.each([
    ["tsv-def", false], ["tsv-def", true], ["9", false], ["9", true],
  ])("waits for %s tag-set preview persistence (nsfw=%s) and prevents overlapping writes", async (version, nsfw) => {
    mountTagSets(version);
    const label = nsfw ? "Set as NSFW preview" : "Set as preview";
    const clickedButton = screen.getAllByRole("button", { name: label })[1];
    fireEvent.click(clickedButton);

    expect(setTagSetPreviewImg).toHaveBeenCalledExactlyOnceWith(version, [
      tagSets[0], { ...tagSets[1], [nsfw ? "nsfwImgUrl" : "imgUrl"]: src },
    ]);
    const spinner = screen.getByRole("status", { name: "Saving tag-set preview" });
    expect(clickedButton.contains(spinner)).toBe(true);
    expect(spinner.textContent).toBe("");
    expect(spinner.querySelector("div")).not.toBeNull();
    expect(screen.queryByText("Saving preview…")).toBeNull();
    for (const button of screen.getAllByRole("button", { name: /Set as .*preview/ })) {
      expect(button.disabled).toBe(true);
      expect(button.getAttribute("aria-busy")).toBe(button === clickedButton ? "true" : "false");
      if (button !== clickedButton) expect(within(button).queryByRole("status")).toBeNull();
      fireEvent.click(button);
    }
    expect(screen.getByRole("button", { name: "Add tag set" }).disabled).toBe(true);
    fireEvent.click(screen.getByText(version === "9" ? "Default" : "Version"));
    expect(screen.getByText(version === "9" ? "Default" : "Version").getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText(version === "9" ? "Version" : "Default").className).toContain("--active");
    expect(setTagSetPreviewImg).toHaveBeenCalledOnce();
    expect(screen.getAllByAltText("Tag-set preview")[1].getAttribute("src")).not.toBe(src);

    await act(async () => { pending.resolve(); });
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getAllByRole("button", { name: label })[1].disabled).toBe(false);
    expect(screen.getByText("Tag sets")).toBeTruthy();
    expect(screen.queryByTestId("error-message")).toBeNull();
  });

  it.each(["tsv-def", "9"])("keeps %s previews unchanged after failure and allows retry", async (version) => {
    mountTagSets(version);
    const button = screen.getAllByRole("button", { name: "Set as preview" })[0];
    fireEvent.click(button);
    const original = new Error("Internal tag-set write details");
    await act(async () => { pending.reject(original); });

    expect(screen.getByTestId("error-message").textContent).toBe(ERROR_MESSAGE_TAG_SET_PREVIEW_SAVE);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
    expect(button.disabled).toBe(false);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getAllByAltText("Tag-set preview")[0].getAttribute("src")).toBe("old-nsfw.webp");

    pending = deferred();
    fireEvent.click(button);
    expect(screen.queryByTestId("error-message")).toBeNull();
    expect(setTagSetPreviewImg).toHaveBeenCalledTimes(2);
    await act(async () => { pending.resolve(); });
    expect(screen.getAllByAltText("Tag-set preview")[0].getAttribute("src")).toBe("old.webp");
    expect(button.disabled).toBe(false);
  });
});
