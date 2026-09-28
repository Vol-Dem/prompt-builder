// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useModelPreviewLoading from "./use-model-preview-loading";
import ModelsList from "../components/models/models-list/ModelsList";
import tabsSlice, { getModelsPreview, tabActions } from "../store/tabs";
import guideSlice, { guideActions } from "../store/guide";
import { ERROR_MESSAGE_OFFLINE, GUIDE_STEP_OPEN_MODEL } from "../variables/constants";

const connection = vi.hoisted(() => ({ online: true }));
vi.mock("./use-online-status", () => ({ useOnlineStatus: () => connection.online }));
vi.mock("../utils/fetch/fetchUser", () => ({ saveUserPreviewFullView: vi.fn() }));
vi.mock("../utils/fetch/fetchPreviews", () => ({ fetchModelPreviewPage: vi.fn() }));
vi.mock("../store/tabs", async (importOriginal) => ({
  ...await importOriginal(), getModelsPreview: vi.fn(),
}));
vi.mock("../components/general-elements/preview-card/PreviewCard", () => ({
  default: ({ item, fullView }) => <div data-testid="preview" data-full-view={fullView}>{item.name}</div>,
}));
vi.mock("../components/models/models-list/models-list-panel/ModelsListPanel", () => ({
  default: () => <div>Model view controls</div>,
}));
vi.mock("../components/general-elements/guide/home/OpenModelGuide", () => ({
  default: () => <div>Open model guide</div>,
}));
vi.mock("../components/ui/Spinner", () => ({ default: () => <div role="status">Loading</div> }));

let observers;
beforeEach(() => {
  connection.online = true;
  observers = [];
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) {
      this.callback = callback;
      this.observe = vi.fn();
      this.disconnect = vi.fn();
      observers.push(this);
    }
  });
  getModelsPreview.mockReset().mockImplementation(() => (dispatch) => {
    dispatch(tabActions.setIsLoading(true));
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const makeStore = (selection = ["lora", "portrait", "face"]) => {
  const store = configureStore({
    reducer: {
      tabs: tabsSlice.reducer,
      guide: guideSlice.reducer,
      general: (state = { nsfwMode: false }, action) =>
        action.type === "general/setNsfwMode" ? { nsfwMode: action.payload } : state,
    },
  });
  store.dispatch(tabActions.setCurrentTab(selection[0]));
  store.dispatch(tabActions.setCurrentCategory(selection[1]));
  store.dispatch(tabActions.setCurrentSubcategory(selection[2]));
  return store;
};
const wrapperFor = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;
const mountHook = (store) => renderHook(useModelPreviewLoading, { wrapper: wrapperFor(store) });
const intersect = (index, visible = true) => act(() => observers[index].callback([{ isIntersecting: visible }]));
const setPreviews = (store, previews) => store.dispatch(tabActions.setModelsData({
  ...store.getState().tabs.modelsData, previews,
}));
const preview = { id: 1, name: "Portrait model" };

it.each([0, 1])("starts loading when observer %s reports the list end", (index) => {
  const { result } = mountHook(makeStore());
  expect(getModelsPreview).not.toHaveBeenCalled();
  intersect(index);
  expect(getModelsPreview).toHaveBeenCalledExactlyOnceWith("lora", "portrait", "face", false, false);
  expect(result.current.status.isLoading).toBe(true);
  intersect(index);
  expect(getModelsPreview).toHaveBeenCalledOnce();
});

it.each([
  ["all", "", ""],
  ["lora", "all", ""],
  ["lora", "portrait", "all"],
])("allows an all-model selection at %s/%s/%s", (tab, category, subcategory) => {
  mountHook(makeStore([tab, category, subcategory]));
  intersect(0);
  expect(getModelsPreview).toHaveBeenCalledExactlyOnceWith(tab, category, subcategory, false, false);
});

it.each(["last page", "offline", "incomplete selection"])("does not request previews with %s", (reason) => {
  const store = makeStore(reason === "incomplete selection" ? ["lora", "portrait", ""] : undefined);
  if (reason === "last page") store.dispatch(tabActions.setIsLastPage(true));
  if (reason === "offline") connection.online = false;
  mountHook(store);
  intersect(0);
  expect(getModelsPreview).not.toHaveBeenCalled();
});

it("appends to retained previews on a fresh intersection and stops at the last page", () => {
  const store = makeStore();
  setPreviews(store, [preview]);
  const { result } = mountHook(store);
  intersect(0);
  expect(getModelsPreview).toHaveBeenCalledExactlyOnceWith("lora", "portrait", "face", true, false);
  act(() => {
    setPreviews(store, [preview, { id: 2, name: "Second model" }]);
    store.dispatch(tabActions.setIsLoading(false));
  });
  expect(result.current.previews).toHaveLength(2);
  expect(getModelsPreview).toHaveBeenCalledOnce();
  intersect(0, false);
  intersect(0);
  expect(getModelsPreview).toHaveBeenCalledTimes(2);
  act(() => store.dispatch(tabActions.setIsLastPage(true)));
  intersect(0, false);
  intersect(0);
  expect(getModelsPreview).toHaveBeenCalledTimes(2);
});

it.each(["tab", "category", "subcategory", "NSFW"])("rechecks a visible list after changing %s", (change) => {
  const store = makeStore();
  mountHook(store);
  intersect(0);
  act(() => {
    store.dispatch(tabActions.setIsLoading(false));
    if (change === "tab") store.dispatch(tabActions.setCurrentTab("all"));
    if (change === "category") store.dispatch(tabActions.setCurrentCategory("all"));
    if (change === "subcategory") store.dispatch(tabActions.setCurrentSubcategory("other"));
    if (change === "NSFW") store.dispatch({ type: "general/setNsfwMode", payload: true });
  });
  const { currTab, currCategory, currSubcategory } = store.getState().tabs;
  expect(getModelsPreview).toHaveBeenCalledTimes(2);
  expect(getModelsPreview).toHaveBeenLastCalledWith(currTab, currCategory, currSubcategory, false, change === "NSFW");
});

it("resumes an eligible visible list when the connection returns", () => {
  connection.online = false;
  const { rerender } = mountHook(makeStore());
  intersect(1);
  expect(getModelsPreview).not.toHaveBeenCalled();
  connection.online = true;
  rerender();
  expect(getModelsPreview).toHaveBeenCalledOnce();
});

it("keeps card view, controls and guide progression in ModelsList and disconnects observers on unmount", () => {
  const store = makeStore();
  setPreviews(store, [preview]);
  store.dispatch(tabActions.setPreviewFullView(true));
  store.dispatch(guideActions.setGuideStep({ type: "home", value: GUIDE_STEP_OPEN_MODEL - 1 }));
  const { unmount } = render(<ModelsList />, { wrapper: wrapperFor(store) });
  expect(screen.getByTestId("preview").getAttribute("data-full-view")).toBe("true");
  expect(screen.getByText("Model view controls")).toBeTruthy();
  expect(screen.getByText("Open model guide")).toBeTruthy();
  expect(store.getState().guide.home.step).toBe(GUIDE_STEP_OPEN_MODEL);
  expect(observers).toHaveLength(2);
  const observedEnd = observers[0].observe.mock.calls[0][0];
  expect(observedEnd.isConnected).toBe(true);
  expect(observers[1].observe).toHaveBeenCalledWith(observedEnd);
  act(() => store.dispatch(tabActions.setIsLoading(true)));
  expect(screen.queryByText("Open model guide")).toBeNull();
  act(() => {
    store.dispatch(tabActions.setIsLoading(false));
    store.dispatch(guideActions.setGuideStep({ type: "home", value: GUIDE_STEP_OPEN_MODEL + 1 }));
    setPreviews(store, [preview]);
  });
  expect(store.getState().guide.home.step).toBe(GUIDE_STEP_OPEN_MODEL + 1);
  unmount();
  expect(observers.every(({ disconnect }) => disconnect.mock.calls.length === 1)).toBe(true);
});

it("preserves empty, loading, error and offline feedback", () => {
  const store = makeStore();
  const { rerender } = render(<ModelsList />, { wrapper: wrapperFor(store) });
  expect(screen.getByText("This category is empty. Try changing the filter.")).toBeTruthy();
  act(() => store.dispatch(tabActions.setIsLoading(true)));
  expect(screen.getByRole("status").textContent).toBe("Loading");
  expect(screen.queryByText("This category is empty. Try changing the filter.")).toBeNull();
  act(() => {
    store.dispatch(tabActions.setIsLoading(false));
    store.dispatch(tabActions.setErrorMessage("Preview request failed"));
  });
  expect(screen.getByText("Preview request failed")).toBeTruthy();
  connection.online = false;
  rerender(<ModelsList />);
  expect(screen.getByText(ERROR_MESSAGE_OFFLINE)).toBeTruthy();
  act(() => store.dispatch(tabActions.setCurrentSubcategory("")));
  expect(screen.queryByText("Model view controls")).toBeNull();
});
