// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useModelSave from "./use-model-save";
import UpdateModelForm from "../components/forms/update-model-form/UpdateModelForm";
import modelSlice, { modelActions } from "../store/model";
import tabsSlice, { tabActions } from "../store/tabs";
import { saveModelData } from "../utils/fetch/fetchModel";
import { AppError } from "../utils/generalUtils";
import {
  ERROR_MESSAGE_DEFAULT, ERROR_MESSAGE_EXISTS, ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_INVALID_MODEL_ID, ERROR_MESSAGE_OFFLINE, SUCCESS_MESSAGE_UPLOADED,
  SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT, SETTINGS_FORMS_TAGSETS_MAX_AMOUNT,
} from "../variables/constants";

vi.mock("../utils/fetch/fetchModel", () => ({ saveModelData: vi.fn() }));
vi.mock("../utils/fetch/fetchUser", () => ({ saveUserPreviewFullView: vi.fn() }));
vi.mock("../utils/fetch/fetchPreviews", () => ({ fetchModelPreviewPage: vi.fn() }));
vi.mock("../components/general-elements/guide/edit/EditDefaultGuide", () => ({ default: () => null }));
vi.mock("../components/ui/Spinner", () => ({ default: () => <span role="status">Saving</span> }));
// Exercise field selection and form resets without the combobox's menu/positioning behavior.
vi.mock("../components/ui/forms/ComboSelect", () => ({
  default: ({ label, placeholder, selected, setSelected, id }) => (
    <input aria-label={label || placeholder} value={selected?.name || ""}
      onChange={(e) => setSelected({ id: e.target.value, name: e.target.value }, !!e.target.value, "", id)} />
  ),
}));

const categories = { lora: [{ id: "people", name: "People", subcategories: [{ id: "portrait", name: "Portrait" }] }] };
const preview = { id: 42, name: "Saved preview" };
const savedData = { id: 42, name: "Saved model" };
const savedResult = () => ({ preview, baseModels: ["SDXL", "Flux"], modelData: savedData });
let online;
beforeEach(() => {
  online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  saveModelData.mockReset().mockImplementation(async () => savedResult());
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const makeStore = (model = { id: 42, name: "Old model" }) => {
  const store = configureStore({
    reducer: {
      model: modelSlice.reducer, tabs: tabsSlice.reducer,
      guide: (state = { active: false, edit: { step: 0 } }) => state,
    },
  });
  store.dispatch(modelActions.setModelData(model));
  store.dispatch(tabActions.setCategories(categories));
  store.dispatch(tabActions.setBaseModels(["SD 1.5"]));
  return store;
};
const wrapperFor = (store) => ({ children }) => <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>;
const mountHook = (options = {}, store = makeStore()) => {
  const onReset = vi.fn();
  const onSave = vi.fn();
  return { store, onReset, onSave, ...renderHook(() => useModelSave({ onReset, onSave, ...options }), { wrapper: wrapperFor(store) }) };
};
const valid = (value = "") => ({ value, isValid: true });
const draft = (overrides = {}) => ({
  idInput: valid("https://civitai.com/models/42/example?modelVersionId=7"),
  srcInput: valid("civitai.com"), titleInput: valid("  Model name  "),
  descriptionInput: valid("Description"), hashtagsInput: valid(" one, two, , one "),
  modelTypeInput: "lora", mainCategorySelected: { id: "people", name: "People", isValid: true },
  subCatInputs: [
    { selected: { name: " Portrait " }, isValid: true },
    { selected: { name: "Portrait" }, isValid: false },
    { selected: null, isValid: false },
  ],
  tagSetsInputs: [], versionsDownloadStatus: [{ id: "7in", value: true }], nsfwInput: true,
  ...overrides,
});
const submit = async (result, value = draft()) => act(async () => { await result.current.submit(value); });

it("normalizes the save payload and preserves callback/reset/Redux ordering after persistence", async () => {
  const store = makeStore();
  const order = [];
  const onSave = vi.fn(() => {
    order.push("save");
    expect(store.getState().tabs.baseModels).toEqual(["Flux", "SDXL"]);
    expect(store.getState().model.model.name).toBe("Old model");
  });
  const onReset = vi.fn(() => order.push("reset"));
  const { result } = mountHook({ onSave, onReset }, store);
  let finish;
  saveModelData.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  let pending;
  act(() => { pending = result.current.submit(draft()); });
  expect(result.current.status).toMatchObject({ modelIsSaving: true, showErrorMessage: true, successMessage: "", savedModel: null });
  expect(onSave).not.toHaveBeenCalled();
  expect(onReset).not.toHaveBeenCalled();
  expect(store.getState().tabs.baseModels).toEqual(["SD 1.5"]);
  expect(saveModelData).toHaveBeenCalledExactlyOnceWith({
    modelId: 42, modelVersionId: 7, modelType: "lora", modelName: "Model name",
    categories, main: "People", sub: ["Portrait"], hashtags: ["one", "two", "one"],
    versionsDownloadStatus: [{ id: "7in", value: true }], nsfw: true,
  }, categories, ["SD 1.5"], undefined);
  await act(async () => { finish(savedResult()); await pending; });
  expect(onSave).toHaveBeenCalledExactlyOnceWith(preview);
  expect(order).toEqual(["save", "reset"]);
  expect(store.getState().model.model).toEqual(savedData);
  expect(result.current.status).toEqual({
    modelIsSaving: false, showErrorMessage: false, errorMessage: "",
    successMessage: SUCCESS_MESSAGE_UPLOADED, savedModel: 42,
  });
});

it("passes existing model data unchanged and skips creation resets", async () => {
  const modelData = { id: 42, name: "Existing" };
  const { result, onReset } = mountHook({ modelData, newModelVersionId: 99 });
  await submit(result);
  expect(saveModelData.mock.calls[0][0].modelVersionId).toBe(99);
  expect(saveModelData.mock.calls[0][3]).toBe(modelData);
  expect(onReset).not.toHaveBeenCalled();
});

it("leaves unrelated active models and absent base-model results untouched", async () => {
  const store = makeStore({ id: 99, name: "Other model" });
  const { result } = mountHook({}, store);
  saveModelData.mockResolvedValue({ preview, modelData: savedData });
  await submit(result);
  expect(store.getState().model.model).toEqual({ id: 99, name: "Other model" });
  expect(store.getState().tabs.baseModels).toEqual(["SD 1.5"]);
});

it.each([
  ["ID", { idInput: { value: "42", isValid: false } }],
  ["category", { mainCategorySelected: { name: "People", isValid: false } }],
  ["subcategories", { subCatInputs: [{ isValid: false }] }],
  ["subcategory limit", { subCatInputs: Array.from({ length: SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT + 1 }, () => ({ isValid: true })) }],
  ["tag-set limit", { tagSetsInputs: Array.from({ length: SETTINGS_FORMS_TAGSETS_MAX_AMOUNT + 1 }, () => [valid(), valid()]) }],
])("rejects invalid %s before checking connectivity", async (_, overrides) => {
  online.mockReturnValue(false);
  const { result, onSave, onReset } = mountHook();
  await submit(result, draft(overrides));
  expect(result.current.status).toMatchObject({ errorMessage: ERROR_MESSAGE_INPUT_DEF, modelIsSaving: false, showErrorMessage: true });
  expect(saveModelData).not.toHaveBeenCalled();
  expect(onSave).not.toHaveBeenCalled();
  expect(onReset).not.toHaveBeenCalled();
});

it.each(["srcInput", "titleInput", "descriptionInput", "hashtagsInput", "tagSetsInputs"])("checks %s only in edit mode", async (field) => {
  const overrides = { [field]: field === "tagSetsInputs" ? [[{ isValid: false }, valid()]] : { value: "", isValid: false } };
  const create = mountHook();
  await submit(create.result, draft(overrides));
  expect(saveModelData).toHaveBeenCalledOnce();
  saveModelData.mockClear();
  const edit = mountHook({ modelData: { id: 42 } });
  await submit(edit.result, draft(overrides));
  expect(edit.result.current.status.errorMessage).toBe(ERROR_MESSAGE_INPUT_DEF);
  expect(saveModelData).not.toHaveBeenCalled();
});

it("keeps offline checking ahead of ID parsing", async () => {
  const { result } = mountHook();
  online.mockReturnValue(false);
  await submit(result, draft({ idInput: valid("invalid") }));
  expect(result.current.status.errorMessage).toBe(ERROR_MESSAGE_OFFLINE);
  online.mockReturnValue(true);
  await submit(result, draft({ idInput: valid("invalid") }));
  expect(result.current.status.errorMessage).toBe(ERROR_MESSAGE_INVALID_MODEL_ID);
  expect(saveModelData).not.toHaveBeenCalled();
});

it("exposes an existing-model link without invoking success callbacks or resetting drafts", async () => {
  const { result, onSave, onReset, store } = mountHook();
  saveModelData.mockRejectedValue(new AppError(ERROR_MESSAGE_EXISTS));
  await submit(result);
  expect(result.current.status).toMatchObject({
    errorMessage: ERROR_MESSAGE_EXISTS, savedModel: 42, successMessage: "", modelIsSaving: false, showErrorMessage: true,
  });
  expect(onSave).not.toHaveBeenCalled();
  expect(onReset).not.toHaveBeenCalled();
  expect(store.getState().model.model.name).toBe("Old model");
});

it("reports save failures, releases loading and clears the error on retry", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const { result, onSave, onReset } = mountHook();
  saveModelData.mockRejectedValueOnce(new Error("Save failed"));
  await submit(result);
  expect(result.current.status).toMatchObject({ errorMessage: ERROR_MESSAGE_DEFAULT, modelIsSaving: false, successMessage: "", savedModel: null });
  expect(onSave).not.toHaveBeenCalled();
  expect(onReset).not.toHaveBeenCalled();
  await submit(result);
  expect(result.current.status).toMatchObject({ errorMessage: "", successMessage: SUCCESS_MESSAGE_UPLOADED });
  await submit(result, draft({ idInput: { value: "", isValid: false } }));
  expect(result.current.status).toMatchObject({ errorMessage: ERROR_MESSAGE_INPUT_DEF, successMessage: "", savedModel: 42 });
});

const mountForm = (props = {}, store = makeStore(null)) => ({
  store, ...render(<UpdateModelForm {...props} />, { wrapper: wrapperFor(store) }),
});
const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const selectCategories = () => {
  change("Category", "People");
  change("Subcategory", "Portrait");
};

it("resets creation fields after success and leaves the save button available for another model", async () => {
  const { container, store } = mountForm({}, makeStore({ id: 99, name: "Other" }));
  change("Model ID or URL", "42");
  selectCategories();
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText(SUCCESS_MESSAGE_UPLOADED);
  expect(screen.getByLabelText("Model ID or URL").value).toBe("");
  expect(screen.getByLabelText("Category").value).toBe("");
  expect(screen.getByLabelText("Subcategory").value).toBe("");
  expect(screen.getByRole("button", { name: "Save" }).disabled).toBe(false);
  const link = screen.getByRole("link", { name: "Show model" });
  expect(link.getAttribute("href")).toBe("/models/42");
  fireEvent.click(link);
  expect(store.getState().model.model).toBeNull();
});

it("keeps resource IDs read-only, forwards its version and hides Save after success", async () => {
  const onSave = vi.fn();
  const { container } = mountForm({ newModelId: 42, newModelVersionId: 99, newModelType: "LORA", onSave });
  expect(screen.getByLabelText("Model ID or URL").readOnly).toBe(true);
  selectCategories();
  fireEvent.submit(container.querySelector("form"));
  await screen.findByText(SUCCESS_MESSAGE_UPLOADED);
  expect(saveModelData.mock.calls[0][0]).toMatchObject({ modelId: 42, modelVersionId: 99, modelType: "lora" });
  expect(onSave).toHaveBeenCalledExactlyOnceWith(preview);
  expect(screen.getByLabelText("Model ID or URL").value).toBe("42");
  expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
});

it("preserves hydrated edit fields and displays pending and failed save states", async () => {
  const modelData = {
    id: 42, name: "Existing model", modelType: "lora", main: "people", sub: ["portrait"],
    hashtags: ["tag"], defaultCustomData: { description: "Description" },
  };
  const { container } = mountForm({ modelData });
  expect(screen.getByLabelText("Category").value).toBe("People");
  expect(screen.getByLabelText("Subcategory").value).toBe("Portrait");
  change("Name", "Edited name");
  let fail;
  saveModelData.mockImplementation(() => new Promise((_, reject) => { fail = reject; }));
  fireEvent.submit(container.querySelector("form"));
  expect(screen.getByRole("button", { name: "Saving" }).disabled).toBe(true);
  await act(async () => fail(new AppError("Retry save")));
  expect(screen.getByText("Retry save")).toBeTruthy();
  expect(screen.getByLabelText("Name").value).toBe("Edited name");
  expect(screen.getByLabelText("Category").value).toBe("People");
  expect(screen.getByRole("button", { name: "Save" }).disabled).toBe(false);
});
