// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { updateDoc } from "firebase/firestore";
import TagsForm from "./tags-form/TagsForm";
import TagSetsForm from "./tag-sets-form/TagSetsForm";
import VersionForm from "./version-form/VersionForm";
import VersionStatusForm from "./version-status-form/VersionStatusForm";
import { ERROR_MESSAGE_DEFAULT, SUCCESS_MESSAGE_UPLOADED } from "../../variables/constants";

const { dispatch, state } = vi.hoisted(() => ({ dispatch: vi.fn(), state: {} }));
vi.mock("../../firebase-config", () => ({ default: {} }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}),
  doc: (_, ...path) => path.join("/"),
  updateDoc: vi.fn(),
}));
vi.mock("../../store/hooks/hooks", () => ({
  useAppSelector: (selector) => selector(state),
  useAppDispatch: () => dispatch,
}));
vi.mock("../../store/model", () => ({
  modelActions: { updateModelDataField: (payload) => ({ type: "model/updateModelDataField", payload }) },
}));
vi.mock("../../store/guide", () => ({ guideActions: { setGuideStep: vi.fn() } }));
vi.mock("../general-elements/guide/model/ModelTagsEditGuide", () => ({ default: () => null }));

const version = {
  versionId: 7, name: "Version", versionName: "Version", mainTag: "portrait",
  trainedWords: ["face"], helperTags: ["light"], negativeTags: ["blur"],
  fileName: "model.safetensors", weight: 1, downloadStatus: true,
  tagSetsData: [{ name: "Set", value: "detail", imgUrl: "set.webp" }],
};
const model = {
  id: 42,
  modelVersionsCustomData: { 7: version },
  data: { modelVersions: [{ id: 7, images: [{ type: "image", url: "preview.webp" }] }] },
};
beforeEach(() => {
  dispatch.mockReset();
  vi.mocked(updateDoc).mockReset().mockResolvedValue(undefined);
  Object.assign(state, {
    auth: { user: { uid: "user-1" } },
    model: { model, curVersion: { id: 7 } },
    guide: { model: { active: false } },
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const forms = [
  { name: "tags", element: (onClose) => <TagsForm modelId={42} versionData={version} onClose={onClose} />, writes: 2, closes: true },
  { name: "tag sets", element: (onClose) => <TagSetsForm modelId={42} onClose={onClose} />, writes: 1, closes: true },
  { name: "version", element: () => <VersionForm modelId={42} modelType="lora" versionData={version} isDefault={false} />, writes: 2 },
  { name: "default", element: () => <VersionForm modelId={42} modelType="lora" versionData={version} isDefault />, writes: 2 },
  { name: "statuses", element: () => <VersionStatusForm modelData={model} />, writes: 2 },
];

it.each(forms)("submits $name edits with the existing payload and success behavior", async ({ name, element, writes, closes }) => {
  const onClose = vi.fn();
  const { container } = render(element(onClose));
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText(SUCCESS_MESSAGE_UPLOADED);
  expect(updateDoc).toHaveBeenCalledTimes(writes);
  const calls = vi.mocked(updateDoc).mock.calls;
  expect(calls[0][0]).toBe("users/user-1/models/42");
  if (writes === 2) expect(calls[1][0]).toBe("users/user-1/preview/42");

  if (name === "statuses") {
    expect(calls[0][1]).toEqual({ modelVersionsCustomData: { 7: version } });
    expect(calls[1][1].imgUrl).toBe("preview.webp");
  } else {
    const field = name === "default" ? "defaultCustomData" : "modelVersionsCustomData.7";
    expect(calls[0][1][field]).toMatchObject({
      versionId: 7, mainTag: "portrait", tagSetsData: version.tagSetsData,
    });
    if (name === "version" || name === "default") {
      expect(calls[1][1]).toMatchObject({ customFileNames: expect.arrayContaining(["model"]) });
    }
    if (closes) {
      expect(dispatch).toHaveBeenCalledWith({
        type: "model/updateModelDataField",
        payload: { modelVersionsCustomData: { 7: calls[0][1][field] } },
      });
    }
  }
  expect(onClose).toHaveBeenCalledTimes(closes ? 1 : 0);
});

it("does not close or update Redux until both tag writes succeed", async () => {
  let finishPreview;
  vi.mocked(updateDoc).mockResolvedValueOnce(undefined).mockImplementationOnce(() => new Promise((resolve) => {
    finishPreview = resolve;
  }));
  const onClose = vi.fn();
  const { container } = render(<TagsForm modelId={42} versionData={version} onClose={onClose} />);
  fireEvent.submit(container.querySelector("form"));
  await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(2));
  expect(dispatch).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.queryByText(SUCCESS_MESSAGE_UPLOADED)).toBeNull();
  await act(async () => finishPreview());
  expect(onClose).toHaveBeenCalledOnce();
});

it.each(forms)("keeps $name edits open and reports persistence failure", async ({ element, writes }) => {
  const logError = vi.spyOn(console, "error").mockImplementation(() => {});
  const onClose = vi.fn();
  if (writes === 2) vi.mocked(updateDoc).mockResolvedValueOnce(undefined);
  vi.mocked(updateDoc).mockRejectedValueOnce(new Error("Persistence failed"));
  const { container } = render(element(onClose));
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText(ERROR_MESSAGE_DEFAULT);
  expect(logError).toHaveBeenCalled();
  expect(screen.queryByText(SUCCESS_MESSAGE_UPLOADED)).toBeNull();
  expect(onClose).not.toHaveBeenCalled();
  expect(dispatch).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Save" }).disabled).toBe(false);
});
