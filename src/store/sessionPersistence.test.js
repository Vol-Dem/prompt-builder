// @vitest-environment jsdom
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

import promptSlice, { promptActions, uploadPromptFromStorage } from "./prompt";
import usedModelsSlice, { usedModelsActions, uploadPanelStateFromStorage } from "./usedModels";
import { sessionPersistenceMiddleware } from "./sessionPersistence";
import appStore from "./store";
import { authActions, getUserData } from "./auth";

const { auth, unsubscribe } = vi.hoisted(() => ({
  auth: { currentUser: null },
  unsubscribe: vi.fn(),
}));
vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", async (importOriginal) => ({
  ...await importOriginal(),
  getAuth: () => auth,
  signOut: vi.fn(),
}));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));
vi.mock("firebase/app-check", () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: class {},
}));

const makeStore = (uid = "redux-user") => configureStore({
  reducer: {
    prompt: promptSlice.reducer,
    used: usedModelsSlice.reducer,
    auth: () => ({ user: { uid } }),
  },
  middleware: (getDefault) => getDefault().concat(sessionPersistenceMiddleware),
});
const read = (key) => JSON.parse(sessionStorage.getItem(key));
let setItem;

beforeEach(() => {
  vi.clearAllMocks();
  auth.currentUser = null;
  appStore.dispatch(promptActions.clearPrompt());
  appStore.dispatch(promptActions.setPromptIsOpen(false));
  appStore.dispatch(promptActions.setTextMode(false));
  appStore.dispatch(usedModelsActions.clearPanel());
  appStore.dispatch(usedModelsActions.panelState(false));
  appStore.dispatch(usedModelsActions.cardViewState(false));
  sessionStorage.clear();
  setItem = vi.spyOn(Storage.prototype, "setItem");
  auth.currentUser = { uid: "firebase-user" };
  signOut.mockReset().mockResolvedValue(undefined);
  getDoc.mockReset().mockResolvedValue({ exists: () => false });
  onSnapshot.mockReset().mockReturnValue(unsubscribe);
});
afterEach(() => {
  auth.currentUser = null;
  vi.restoreAllMocks();
});

it("persists completed positive/negative prompt transformations and flags under the Firebase uid", () => {
  const store = makeStore();
  store.dispatch(promptActions.setCurrentPrompt("portrait, soft light"));
  store.dispatch(promptActions.setCurrentNegPrompt("blur"));
  store.dispatch(promptActions.setPromptIsOpen(true));
  store.dispatch(promptActions.setTextMode(true));
  setItem.mockClear();

  const action = promptActions.addTagToPrompt({ type: "positive", value: "detailed" });
  expect(store.dispatch(action)).toBe(action);
  expect(setItem.mock.calls).toEqual([
    ["firebase-user-prompt", JSON.stringify("portrait, soft light, detailed")],
    ["firebase-user-neg-prompt", JSON.stringify("blur")],
    ["firebase-user-prompt-state", JSON.stringify({ promptIsOpen: true })],
    ["firebase-user-prompt-text", JSON.stringify({ isTextMode: true })],
  ]);
  expect(store.getState().prompt.curPromptArr.map(({ tag }) => tag)).toEqual([
    "portrait", "soft light", "detailed",
  ]);
  expect(sessionStorage.getItem("redux-user-prompt")).toBeNull();
});

it("persists sidebar models, images, and flags using the existing keys and payloads", () => {
  const store = makeStore();
  const models = [{ id: 42, name: "Model" }];
  const images = [{ id: 7, url: "image.webp" }];
  store.dispatch(usedModelsActions.addModelsToPanel(models));
  store.dispatch(usedModelsActions.addImagesToPanel(images));
  store.dispatch(usedModelsActions.panelState(true));
  setItem.mockClear();
  store.dispatch(usedModelsActions.cardViewState(true));

  expect(setItem.mock.calls).toEqual([
    ["firebase-user-side", JSON.stringify(models)],
    ["firebase-user-side-img", JSON.stringify(images)],
    ["firebase-user-side-state", JSON.stringify({ panelIsOpen: true })],
    ["firebase-user-side-view", JSON.stringify({ fullCardView: true })],
  ]);
});

it.each(["prompt/custom-action", "used/custom-action"])("retains prefix matching for %s", (type) => {
  makeStore().dispatch({ type });
  expect(setItem).toHaveBeenCalledTimes(4);
});

it("ignores unrelated actions and does not persist the outer thunk itself", () => {
  const store = makeStore();
  expect(store.dispatch(() => "result")).toBe("result");
  store.dispatch({ type: "unrelated/action" });
  expect(setItem).not.toHaveBeenCalled();
  store.dispatch((dispatch) => dispatch(promptActions.setCurrentPrompt("portrait")));
  expect(setItem).toHaveBeenCalledTimes(4);
});

it("skips persistence when Firebase is signed out even if Redux still has a uid", () => {
  auth.currentUser = null;
  const store = makeStore();
  store.dispatch(promptActions.setCurrentPrompt("portrait"));
  store.dispatch(usedModelsActions.panelState(true));
  expect(setItem).not.toHaveBeenCalled();
  expect(store.getState().prompt.curPrompt).toBe("portrait");
  expect(store.getState().used.panelIsOpen).toBe(true);
});

it("uses the current Firebase account for each dispatch", () => {
  const store = makeStore();
  store.dispatch(promptActions.setCurrentPrompt("first"));
  auth.currentUser = { uid: "second-user" };
  store.dispatch(promptActions.setCurrentPrompt("second"));
  expect(read("firebase-user-prompt")).toBe("first");
  expect(read("second-user-prompt")).toBe("second");
});

it("keeps direct reducer calls free of persistence", () => {
  setItem.mockImplementation(() => { throw new Error("Storage unavailable"); });
  const prompt = promptSlice.reducer(undefined, promptActions.setCurrentPrompt("portrait"));
  const sidebar = usedModelsSlice.reducer(undefined, usedModelsActions.panelState(true));
  expect(prompt.curPrompt).toBe("portrait");
  expect(sidebar.panelIsOpen).toBe(true);
  expect(setItem).not.toHaveBeenCalled();
});

it.each([
  { name: "prompt", action: () => promptActions.setCurrentPrompt("portrait"), check: (state) => expect(state.prompt.curPrompt).toBe("portrait") },
  { name: "sidebar", action: () => usedModelsActions.panelState(true), check: (state) => expect(state.used.panelIsOpen).toBe(true) },
])("propagates $name storage errors synchronously after the Redux update", ({ action, check }) => {
  const store = makeStore();
  const error = new Error("Storage unavailable");
  setItem.mockImplementation(() => { throw error; });
  expect(() => store.dispatch(action())).toThrow(error);
  check(store.getState());
  expect(setItem).toHaveBeenCalledOnce();
});

it("preserves prompt and sidebar restoration through their existing thunks", () => {
  const saved = {
    "firebase-user-prompt": "portrait",
    "firebase-user-neg-prompt": "blur",
    "firebase-user-prompt-state": { promptIsOpen: true },
    "firebase-user-prompt-text": { isTextMode: true },
    "firebase-user-side": [{ id: 42 }],
    "firebase-user-side-img": [{ id: 7 }],
    "firebase-user-side-state": { panelIsOpen: true },
  };
  Object.entries(saved).forEach(([key, value]) => sessionStorage.setItem(key, JSON.stringify(value)));
  const store = makeStore("firebase-user");
  store.dispatch(uploadPromptFromStorage());
  store.dispatch(uploadPanelStateFromStorage());
  expect(store.getState().prompt).toMatchObject({
    curPrompt: "portrait", curNegPrompt: "blur", promptIsOpen: true, isTextMode: true,
  });
  expect(store.getState().used).toMatchObject({ models: [{ id: 42 }], images: [{ id: 7 }], panelIsOpen: true });
  Object.entries(saved).forEach(([key, value]) => expect(read(key)).toEqual(value));
});

describe("application store integration", () => {
  it("registers persistence once in the real store", () => {
    appStore.dispatch(promptActions.setCurrentPrompt("portrait"));
    appStore.dispatch(usedModelsActions.panelState(true));
    expect(read("firebase-user-prompt")).toBe("portrait");
    expect(read("firebase-user-side-state")).toEqual({ panelIsOpen: true });
    expect(setItem).toHaveBeenCalledTimes(8);
  });

  it.each([false, true])("keeps logout ordering when Firebase clears the user immediately=%s", async (clearImmediately) => {
    appStore.dispatch(authActions.login({
      uid: "firebase-user", accessToken: "", refreshToken: "", email: null,
      displayName: null, emailVerified: false,
    }));
    await appStore.dispatch(getUserData("firebase-user"));
    appStore.dispatch(promptActions.setCurrentPrompt("portrait"));
    appStore.dispatch(promptActions.setPromptIsOpen(true));
    appStore.dispatch(usedModelsActions.addModelsToPanel([{ id: 42 }]));
    appStore.dispatch(usedModelsActions.panelState(true));
    setItem.mockClear();
    signOut.mockImplementation(() => {
      if (clearImmediately) auth.currentUser = null;
      return Promise.resolve();
    });

    appStore.dispatch(authActions.logout());
    expect(signOut).toHaveBeenCalledExactlyOnceWith(auth);
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(appStore.getState().auth.isLoggedIn).toBe(false);
    expect(appStore.getState().prompt).toMatchObject({ curPrompt: "", promptIsOpen: false });
    expect(appStore.getState().used).toMatchObject({ models: [], images: [], panelIsOpen: false });
    if (clearImmediately) {
      expect(setItem).not.toHaveBeenCalled();
      expect(read("firebase-user-prompt")).toBe("portrait");
      expect(read("firebase-user-side")).toEqual([{ id: 42 }]);
    } else {
      expect(setItem).toHaveBeenCalledTimes(16);
      expect(signOut.mock.invocationCallOrder[0]).toBeLessThan(unsubscribe.mock.invocationCallOrder[0]);
      expect(unsubscribe.mock.invocationCallOrder[0]).toBeLessThan(setItem.mock.invocationCallOrder[0]);
      expect(read("firebase-user-prompt")).toBe("");
      expect(read("firebase-user-prompt-state")).toEqual({ promptIsOpen: false });
      expect(read("firebase-user-side")).toEqual([]);
      expect(read("firebase-user-side-state")).toEqual({ panelIsOpen: false });
    }
  });
});
