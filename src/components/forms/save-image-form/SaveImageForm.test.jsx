// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SaveImageForm from "./SaveImageForm";
import { ERROR_MESSAGE_CIV_CONNECTION, ERROR_MESSAGE_EMPTY } from "../../../variables/constants";

const { dispatch, choice } = vi.hoisted(() => ({ dispatch: vi.fn(), choice: { current: null } }));
vi.mock("../../../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector) => selector({ general: { nsfwMode: false, nsfwLevel: "None" } }),
}));
vi.mock("../../../store/upload", () => ({ uploadActions: {
  addToQueue: (payload) => ({ type: "upload/addToQueue", payload }),
} }));
vi.mock("../../ui/buttons/ButtonInfo", () => ({ default: () => null }));
vi.mock("../choose-image-form/ChooseImageForm", () => ({ default: (props) => {
  choice.current = props;
  return <button onClick={() => props.onSave(props.location, [1], null)}>Save chosen image</button>;
} }));
const fetchMock = vi.fn();
beforeEach(() => {
  dispatch.mockReset();
  choice.current = null;
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const loadImages = () => {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "https://civitai.com/posts/7" } });
  fireEvent.click(screen.getByRole("button", { name: "Select images" }));
};

it.each([true, false])("keeps model restriction=%s, metadata repair, saved IDs, and queue selection", async (restrictModel) => {
  fetchMock.mockResolvedValue({ status: 200, json: async () => ({ items: [
    { id: 1, meta: { meta: { prompt: "portrait" } } }, { id: 2 },
  ] }) });
  const saved = { postId: 7, imagesId: [2] };
  render(<SaveImageForm location="models" modelData={{ id: 42 }} curVersion={9} savedModelPosts={{ 9: [saved] }} />);
  if (!restrictModel) fireEvent.click(screen.getByRole("checkbox"));
  loadImages();
  const save = await screen.findByRole("button", { name: "Save chosen image" });
  expect(fetchMock).toHaveBeenCalledWith(`https://civitai.com/api/v1/images?postId=7${restrictModel ? "&modelId=42" : ""}&nsfw=None&withMeta=true`);
  expect(choice.current).toMatchObject({ savedImageIds: [2], postData: saved, images: [{ id: 1, meta: { prompt: "portrait" } }, { id: 2 }] });
  fireEvent.click(save);
  await screen.findByText("Added to download queue");
  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
    type: "upload/addToQueue",
    payload: expect.objectContaining({ postId: 7, modelId: 42, versionId: 9, ids: [1], images: [expect.objectContaining({ id: 1 })] }),
  }));
});

it.each([
  { status: 500, message: ERROR_MESSAGE_CIV_CONNECTION },
  { status: 200, message: ERROR_MESSAGE_EMPTY },
])("keeps status $status error feedback and does not open selection", async ({ status, message }) => {
  const json = vi.fn().mockResolvedValue({ items: [] });
  fetchMock.mockResolvedValue({ status, json });
  render(<SaveImageForm location="collections" />);
  loadImages();
  await screen.findByText(message);
  expect(choice.current).toBeNull();
  expect(dispatch).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Select images" }).disabled).toBe(false);
  if (status === 500) expect(json).not.toHaveBeenCalled();
});
