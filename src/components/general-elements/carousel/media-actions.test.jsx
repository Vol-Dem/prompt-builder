// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import CarouselPagination from "./carousel-pagination/CarouselPagination";
import CarouselImage from "./carousel-image/CarouselImage";
import CarouselImageList from "./carousel-image-list/CarouselImageList";
import SetTagSetPreview from "./set-tagset-preview/SetTagSetPreview";
import ReferenceImageList from "../../layout/right-sidebar/reference-image-list/ReferenceImageList";
import ImageTabs from "../../model/generated-images/image-tabs/ImageTabs";
import ChooseImageForm from "../../forms/choose-image-form/ChooseImageForm";
import { removeImageFromPanel } from "../../../store/usedModels";

const { state, dispatch } = vi.hoisted(() => ({
  state: {},
  dispatch: vi.fn(),
}));
vi.mock("../../../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (select) => select(state),
}));
vi.mock("react-redux", async (original) => ({
  ...(await original()),
  useDispatch: () => dispatch,
}));
vi.mock("../../../store/modelThunks", () => ({
  setPreviewImg: vi.fn(),
  setTagSetPreviewImg: vi.fn(),
}));
vi.mock("../../../store/usedModels", () => ({
  removeImageFromPanel: vi.fn((hash, url) => ({
    type: "removeImage",
    payload: { hash, url },
  })),
  usedModelsActions: {
    panelState: (open) => ({ type: "panelState", payload: open }),
  },
}));
vi.mock("../button-square-add/ButtonSquareAdd", () => ({
  default: () => <button type="button">Add to sidebar</button>,
}));
vi.mock("../../forms/tag-sets-form/TagSetsForm", () => ({
  default: () => null,
}));
vi.mock("../../../hooks/use-intersection", () => ({ default: () => true }));
vi.mock("../../../hooks/use-online-status", () => ({
  useOnlineStatus: () => true,
}));

const images = [1, 2, 3].map((id) => ({
  id,
  postId: 7,
  hash: `hash-${id}`,
  url: `https://example.com/image-${id}.webp`,
  type: "image",
  width: 100,
  height: 100,
  nsfw: false,
}));
beforeEach(() => {
  vi.clearAllMocks();
  dispatch.mockImplementation((action) => action);
  state.general = { isMobile: true, sfwValue: "None", nsfwMode: true };
  state.auth = { user: { uid: "user" } };
  state.model = {
    curVersion: null,
    activeCarouselData: { images, currImgNum: null },
    model: {
      id: 42,
      defaultCustomData: {
        tagSetsData: [{ name: "Default tags", value: "one" }],
      },
      modelVersionsCustomData: {
        9: {
          versionId: 9,
          name: "Version nine",
          tagSetsData: [{ name: "Version tags", value: "two" }],
        },
      },
    },
  };
});
afterEach(cleanup);

const tabTo = async (user, button) => {
  for (let i = 0; i < 12 && document.activeElement !== button; i++)
    await user.tab();
  expect(document.activeElement).toBe(button);
};

it.each(["{Enter}", " "])(
  "selects a pagination image with %s and exposes its visible state",
  async (key) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <CarouselPagination
        images={images}
        visibleAmount={1}
        visibleImages={[1]}
        onClick={onClick}
      />,
    );
    expect(
      screen
        .getByRole("button", { name: "Show image 1" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    const next = screen.getByRole("button", { name: "Show image 2" });
    await tabTo(user, next);
    await user.keyboard(key);
    expect(onClick).toHaveBeenCalledExactlyOnceWith(1);
    rerender(
      <CarouselPagination
        images={images}
        visibleAmount={1}
        visibleImages={[2]}
        onClick={onClick}
      />,
    );
    expect(next.getAttribute("aria-pressed")).toBe("true");
    rerender(
      <CarouselPagination
        images={images}
        visibleAmount={1}
        visibleImages={[0]}
        onClick={onClick}
      />,
    );
    expect(
      screen
        .getByRole("button", { name: "Show image 3" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  },
);

it.each([false, true])(
  "opens the visible carousel media from a native action (active=%s)",
  async (active) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpen = vi.fn();
    render(
      <CarouselImage
        id="1"
        imageData={images[0]}
        src={images[0].url}
        alt="Current image"
        position={4}
        saved={false}
        active={active}
        side={false}
        menu
        onClick={onClick}
        onOpen={onOpen}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.load(screen.getByRole("img", { name: "Current image" }));
    const action = screen.getByRole("button", {
      name: active ? "Open full view" : "Open image 1",
    });
    await tabTo(user, action);
    await user.keyboard(" ");
    if (active) {
      expect(onOpen).toHaveBeenCalledExactlyOnceWith();
      expect(onClick).not.toHaveBeenCalled();
      expect(screen.queryByRole("button", { name: "Open image 1" })).toBeNull();
    } else expect(onClick).toHaveBeenCalledExactlyOnceWith(4);
  },
);

it("opens a grid image with Enter without activating its separate sidebar action", async () => {
  const user = userEvent.setup();
  render(<CarouselImageList images={images} />);
  const opener = screen.getByRole("button", { name: "Open image 2" });
  await tabTo(user, opener);
  await user.keyboard("{Enter}");
  expect(dispatch).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      type: "model/setActiveCarouselData",
      payload: expect.objectContaining({ images, currImgNum: 1 }),
    }),
  );
  expect(opener.closest("li").querySelectorAll("button")).toHaveLength(2);
});

it("opens and removes a reference image using separate keyboard actions", async () => {
  const user = userEvent.setup();
  render(<ReferenceImageList usedImages={[images[0]]} />);
  const opener = screen.getByRole("button", { name: "Open reference image 1" });
  await tabTo(user, opener);
  await user.keyboard("{Enter}");
  expect(dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "model/setActiveCarouselData",
      payload: { images: [images[0]], postId: 7, saved: true, side: true },
    }),
  );
  dispatch.mockClear();
  await tabTo(
    user,
    screen.getByRole("button", { name: "Remove reference image 1" }),
  );
  await user.keyboard(" ");
  expect(removeImageFromPanel).toHaveBeenCalledExactlyOnceWith(
    images[0].hash,
    images[0].url,
  );
  expect(dispatch).toHaveBeenCalledExactlyOnceWith({
    type: "removeImage",
    payload: { hash: images[0].hash, url: images[0].url },
  });
});

it("switches image sources with native buttons and keeps Saved disabled for unsaved models", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const { rerender } = render(
    <ImageTabs curTab="all" saved={false} onClick={onClick} />,
  );
  const saved = screen.getByRole("button", { name: "Saved" });
  expect(saved.disabled).toBe(true);
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("group", { name: "Saved images availability" }),
  );
  expect(screen.getByRole("tooltip")).toBeTruthy();
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "All" }),
  );
  rerender(<ImageTabs curTab="all" saved onClick={onClick} />);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(saved);
  await user.keyboard(" ");
  expect(onClick).toHaveBeenCalledExactlyOnceWith("saved");
  rerender(<ImageTabs curTab="saved" saved onClick={onClick} />);
  expect(saved.getAttribute("aria-pressed")).toBe("true");
  expect(
    screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed"),
  ).toBe("false");
});

it("changes tag-set preview versions with Enter and Space and exposes the selected version", async () => {
  const user = userEvent.setup();
  render(<SetTagSetPreview src={images[0].url} />);
  const version = screen.getByRole("button", { name: "Version nine" });
  await tabTo(user, version);
  await user.keyboard("{Enter}");
  expect(version.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("heading", { name: "Version tags" })).toBeTruthy();
  const defaultVersion = screen.getByRole("button", { name: "Default" });
  await tabTo(user, defaultVersion);
  await user.keyboard(" ");
  expect(defaultVersion.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("heading", { name: "Default tags" })).toBeTruthy();
});

it("selects images with the existing checkboxes and prevents already-saved images changing", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(
    <ChooseImageForm
      images={images}
      location="models"
      type="save"
      savedImageIds={[1]}
      onSave={onSave}
    />,
  );
  expect(
    screen.getByRole("checkbox", { name: "Select image 1" }).disabled,
  ).toBe(true);
  const selectable = screen.getByRole("checkbox", { name: "Select image 2" });
  await user.tab();
  expect(document.activeElement).toBe(selectable);
  await user.keyboard(" ");
  expect(selectable.checked).toBe(true);
  await tabTo(user, screen.getByRole("button", { name: "Save (1) selected" }));
  await user.keyboard("{Enter}");
  expect(onSave).toHaveBeenCalledWith("models", [1, 2], null, undefined);
  expect(
    within(
      screen.getByRole("checkbox", { name: "Select image 1" }).closest("label"),
    ).queryByRole("button"),
  ).toBeNull();
});
