// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { updateDoc } from "firebase/firestore";
import useVersionSave from "./use-version-save";
import VersionForm from "../components/forms/version-form/VersionForm";
import modelSlice, { modelActions } from "../store/model";
import { AppError } from "../utils/generalUtils";
import {
  ERROR_MESSAGE_DEFAULT, ERROR_MESSAGE_INPUT_DEF, ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED, VALIDATION_NAME_MAX_LENGTH,
} from "../variables/constants";

// Exercise real payload preparation and model/preview persistence, stopping at Firestore.
vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}), doc: (_, ...path) => path.join("/"), updateDoc: vi.fn(),
}));
vi.mock("../components/ui/Spinner", () => ({ default: () => <span role="status">Saving</span> }));

const version = {
  versionId: 7, name: "Old version", versionName: "Original", downloadStatus: true,
  mainTag: "old", fileName: "old.safetensors", weight: 1,
  tagSetsData: [{ name: "Set", value: "detail", imgUrl: "set.webp", nsfwImgUrl: "nsfw.webp", default: true }],
};
const model = {
  id: 42,
  modelVersionsCustomData: {
    7: version,
    8: { versionId: 8, mainTag: "PORTRAIT", fileName: "Other.CKPT" },
    9: { versionId: 9, mainTag: "", fileName: "" },
  },
};
let online;
beforeEach(() => {
  updateDoc.mockReset().mockResolvedValue(undefined);
  online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const makeStore = () => {
  const store = configureStore({
    reducer: {
      model: modelSlice.reducer,
      auth: (state = { user: { uid: "user-1" } }) => state,
    },
  });
  store.dispatch(modelActions.setModelData(model));
  return store;
};
const wrapperFor = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;
const options = { versionData: version, modelId: 42, modelType: "lora", isDefault: false };
const mountHook = (overrides = {}) => {
  const store = makeStore();
  return { store, ...renderHook((props) => useVersionSave(props), {
    initialProps: { ...options, ...overrides }, wrapper: wrapperFor(store),
  }) };
};
const valid = (value = "") => ({ value, isValid: true });
const draft = (overrides = {}) => ({
  mainTagInput: valid(" <lora:MixedCase:1> "), titleInput: valid(" New name "),
  descriptionInput: valid(" New description "), trigerInput: valid(" face, light, , face "),
  fileNameInput: valid(" Model.SAFETENSORS "), weightInput: valid(" 0.75 "),
  minWeightInput: valid(" -1 "), maxWeightInput: valid(" 2 "), sizetInput: valid(" 512x768 "),
  helperTagsInput: valid("helper, extra"), negativeTagsInput: valid(" blur, noise "),
  vaeInput: valid(" VAE "), denoisingStrengthtInput: valid(" 0.5 "),
  hiresUpscaleInput: valid(" 2 "), hiresUpscaleStepsInput: valid(" 10 "),
  hiresUpscalerInput: valid(" ESRGAN "), cfgScaleInput: valid(" 7 "),
  samplerInput: valid(" Euler A "), stepsInput: valid(" 20 "),
  tagSetsInputs: [[valid("Changed set"), valid("changed detail")], [valid(), valid()]],
  ...overrides,
});
const submit = async (result, fields = draft()) => act(async () => { await result.current.submit(fields); });

it.each([false, true])("persists the existing version/default payload and preview metadata (default=%s)", async (isDefault) => {
  const { result, store } = mountHook({ isDefault });
  await submit(result);
  const payload = {
    ...version, mainTag: "<lora:MixedCase:1>", name: "New name", description: "New description",
    trainedWords: ["face", "light", "face"], fileName: "Model.SAFETENSORS",
    tagSetsData: [{ ...version.tagSetsData[0], name: "Changed set", value: "changed detail" }],
    weight: 0.75, minWeight: -1, maxWeight: 2, size: "512x768",
    helperTags: ["helper", "extra"], negativeTags: ["blur", "noise"],
  };
  const field = isDefault ? "defaultCustomData" : "modelVersionsCustomData.7";
  expect(updateDoc.mock.calls).toEqual([
    ["users/user-1/models/42", { [field]: payload }],
    ["users/user-1/preview/42", {
      [field]: payload,
      mainTags: isDefault ? ["old", "portrait", "MixedCase"] : ["MixedCase", "portrait"],
      customFileNames: isDefault ? ["old", "other.ckpt", "model.safetensors"] : ["model.safetensors", "other.ckpt"],
    }],
  ]);
  expect(store.getState().model.model).toEqual(model);
  expect(result.current.status).toEqual({
    isSaving: false, errorMessage: "", successMessage: SUCCESS_MESSAGE_UPLOADED, showErrorMessage: true,
  });
});

it("normalizes checkpoint settings while retaining untouched version metadata", async () => {
  const { result } = mountHook({ modelType: "checkpoint" });
  await submit(result);
  expect(updateDoc.mock.calls[0][1]["modelVersionsCustomData.7"]).toMatchObject({
    sampler: "euler a", steps: "20", vae: "vae", denoisingStrength: "0.5",
    hiresUpscaleBy: "2", hiresUpscaleSteps: "10", hiresUpscaler: "esrgan", cfgScale: "7",
    versionName: "Original", downloadStatus: true,
  });
});

it("preserves numeric empty-field conversion and allows empty tag sets", async () => {
  const { result } = mountHook();
  await submit(result, draft({ weightInput: valid(), minWeightInput: valid(), maxWeightInput: valid(), tagSetsInputs: [] }));
  expect(updateDoc.mock.calls[0][1]["modelVersionsCustomData.7"]).toMatchObject({
    weight: 0, minWeight: 0, maxWeight: 0, tagSetsData: [],
  });
});

it.each([
  "titleInput", "descriptionInput", "mainTagInput", "trigerInput", "helperTagsInput",
  "negativeTagsInput", "fileNameInput", "weightInput", "minWeightInput", "maxWeightInput", "sizetInput",
])("rejects invalid %s before checking connectivity", async (field) => {
  online.mockReturnValue(false);
  const { result } = mountHook();
  await submit(result, draft({ [field]: { value: "", isValid: false } }));
  expect(result.current.status).toMatchObject({ errorMessage: ERROR_MESSAGE_INPUT_DEF, isSaving: false, showErrorMessage: true });
  expect(updateDoc).not.toHaveBeenCalled();
});

it.each([0, 1])("rejects invalid tag-set field %s", async (field) => {
  const { result } = mountHook();
  const tagSet = [valid("Set"), valid("Value")];
  tagSet[field].isValid = false;
  await submit(result, draft({ tagSetsInputs: [tagSet] }));
  expect(result.current.status.errorMessage).toBe(ERROR_MESSAGE_INPUT_DEF);
  expect(updateDoc).not.toHaveBeenCalled();
});

it.each([
  "vaeInput", "denoisingStrengthtInput", "hiresUpscaleInput", "hiresUpscaleStepsInput",
  "hiresUpscalerInput", "cfgScaleInput", "samplerInput", "stepsInput",
])("applies %s validity only to checkpoint saves", async (field) => {
  const { result, rerender } = mountHook();
  const fields = draft({ [field]: { value: "", isValid: false } });
  await submit(result, fields);
  expect(updateDoc).toHaveBeenCalledTimes(2);
  updateDoc.mockClear();
  rerender({ ...options, modelType: "checkpoint" });
  await submit(result, fields);
  expect(result.current.status.errorMessage).toBe(ERROR_MESSAGE_INPUT_DEF);
  expect(updateDoc).not.toHaveBeenCalled();
});

it("reports offline without writing and clears that message on retry", async () => {
  online.mockReturnValue(false);
  const { result } = mountHook();
  await submit(result);
  expect(result.current.status).toMatchObject({ errorMessage: ERROR_MESSAGE_OFFLINE, isSaving: false, successMessage: "" });
  expect(updateDoc).not.toHaveBeenCalled();
  online.mockReturnValue(true);
  await submit(result);
  expect(result.current.status).toMatchObject({ errorMessage: "", successMessage: SUCCESS_MESSAGE_UPLOADED });
});

it("waits for both writes before reporting success", async () => {
  let finishModel, finishPreview;
  updateDoc.mockImplementationOnce(() => new Promise((resolve) => { finishModel = resolve; }))
    .mockImplementationOnce(() => new Promise((resolve) => { finishPreview = resolve; }));
  const { result } = mountHook();
  let pending;
  act(() => { pending = result.current.submit(draft()); });
  expect(result.current.status.isSaving).toBe(true);
  expect(updateDoc).toHaveBeenCalledTimes(1);
  await act(async () => finishModel());
  expect(updateDoc).toHaveBeenCalledTimes(2);
  expect(result.current.status).toMatchObject({ isSaving: true, successMessage: "" });
  await act(async () => { finishPreview(); await pending; });
  expect(result.current.status).toMatchObject({ isSaving: false, successMessage: SUCCESS_MESSAGE_UPLOADED });
});

it.each([1, 2])("handles failure of write %s without reporting success or updating Redux", async (write) => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  if (write === 2) updateDoc.mockResolvedValueOnce(undefined);
  updateDoc.mockRejectedValueOnce(new Error("Persistence failed"));
  const { result, store } = mountHook();
  await submit(result);
  expect(updateDoc).toHaveBeenCalledTimes(write);
  expect(result.current.status).toMatchObject({ errorMessage: ERROR_MESSAGE_DEFAULT, isSaving: false, successMessage: "" });
  expect(store.getState().model.model).toEqual(model);
});

it("retains the existing missing-version-ID early return", async () => {
  const { result } = mountHook({ versionData: null });
  await submit(result);
  expect(updateDoc).not.toHaveBeenCalled();
  expect(result.current.status).toEqual({ isSaving: true, errorMessage: "", successMessage: "", showErrorMessage: true });
});

const form = (props = {}) => <VersionForm {...options} {...props} />;
const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

it("retains edits after success and rehydrates fields while clearing messages on version changes", async () => {
  const { container, rerender } = render(form(), { wrapper: wrapperFor(makeStore()) });
  change("Version name", "Edited version");
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText(SUCCESS_MESSAGE_UPLOADED);
  expect(screen.getByLabelText("Version name").value).toBe("Edited version");
  expect(screen.getByDisplayValue("Set")).toBeTruthy();
  rerender(form({ versionData: { ...version, versionId: 8, name: "Next version", tagSetsData: [] } }));
  expect(screen.queryByText(SUCCESS_MESSAGE_UPLOADED)).toBeNull();
  expect(screen.getByLabelText("Version name").value).toBe("Next version");
  await waitFor(() => expect(screen.queryByDisplayValue("Set")).toBeNull());
});

it("preserves default-data hydration and clears errors without clearing submitted validation state", async () => {
  const data = { versionId: 7 };
  const { container, rerender } = render(form({
    versionData: data, defaultData: { name: "Fallback", description: "Description", trainedWords: ["trigger"] },
  }), { wrapper: wrapperFor(makeStore()) });
  expect(screen.getByLabelText("Version name").value).toBe("Fallback");
  expect(screen.getByLabelText("Version description").value).toBe("Description");
  expect(screen.getByLabelText("Trigger words").value).toBe("trigger");
  updateDoc.mockRejectedValueOnce(new AppError("Save failed"));
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText("Save failed");
  rerender(form({ versionData: data, defaultData: { name: "New fallback" } }));
  expect(screen.queryByText("Save failed")).toBeNull();
  expect(screen.getByLabelText("Version name").value).toBe("New fallback");
  change("Version name", "x".repeat(VALIDATION_NAME_MAX_LENGTH + 1));
  expect(await screen.findByText(`Value cannot be more than ${VALIDATION_NAME_MAX_LENGTH} characters`)).toBeTruthy();
});

it("keeps the existing checkpoint-field visibility and form loading behavior", async () => {
  let finish;
  updateDoc.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  const { container } = render(form({ modelType: "checkpoint", isDefault: true }), { wrapper: wrapperFor(makeStore()) });
  expect(screen.queryByLabelText("Version name")).toBeNull();
  expect(screen.queryByLabelText("Sampling method")).toBeNull();
  fireEvent.submit(container.querySelector("form"));
  expect(screen.getByRole("button", { name: "Saving" }).disabled).toBe(true);
  await act(async () => finish());
  await screen.findByText(SUCCESS_MESSAGE_UPLOADED);
  expect(screen.getByRole("button", { name: "Save" }).disabled).toBe(false);
});
