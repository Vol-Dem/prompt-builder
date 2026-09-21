import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { initializeAppCheck } from "firebase/app-check";

import authSlice, { authActions } from "./auth";
import generalSlice, { generalActions } from "./general";
import tabsSlice from "./tabs";
import imagesSlice from "./images";
import promptSlice from "./prompt";
import usedModelsSlice from "./usedModels";
import modelSlice from "./model";
import guideSlice from "./guide";
import { authListener } from "./authListener";
import { getUserData } from "./authThunks";
import { startUserDataSubscription, stopUserDataSubscription } from "./authSession";
import { ERROR_MESSAGE_USER_DATA_LOAD } from "../variables/constants";

const { auth } = vi.hoisted(() => ({ auth: { currentUser: null } }));
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
  ReCaptchaV3Provider: class { constructor(key) { this.key = key; } },
}));

const makeStore = (events = []) => configureStore({
  reducer: {
    auth: authSlice.reducer,
    general: generalSlice.reducer,
    tabs: tabsSlice.reducer,
    images: imagesSlice.reducer,
    prompt: promptSlice.reducer,
    used: usedModelsSlice.reducer,
    model: modelSlice.reducer,
    guide: guideSlice.reducer,
  },
  middleware: (getDefault) => getDefault()
    .prepend(authListener.middleware)
    .concat(() => (next) => (action) => {
      events.push(action.type);
      return next(action);
    }),
});
const deferred = () => {
  let resolve;
  const promise = new Promise((finish) => { resolve = finish; });
  return { promise, resolve };
};

beforeEach(() => {
  vi.resetAllMocks();
  onSnapshot.mockReturnValue(vi.fn());
  getDoc.mockResolvedValue({ exists: () => false });
  signOut.mockResolvedValue(undefined);
});
afterEach(() => vi.restoreAllMocks());

it("subscribes before the initial read and hydrates live fields while that read is pending", async () => {
  const events = [];
  const store = makeStore(events);
  const pending = deferred();
  getDoc.mockReturnValue(pending.promise);
  const request = store.dispatch(getUserData("user-1"));
  expect(onSnapshot).toHaveBeenCalledWith("users/user-1", expect.any(Function));
  expect(getDoc).toHaveBeenCalledExactlyOnceWith("users/user-1");
  expect(onSnapshot.mock.invocationCallOrder[0]).toBeLessThan(getDoc.mock.invocationCallOrder[0]);
  expect(store.getState().auth.userDataIsLoading).toBe(true);

  const liveData = {
    categoriesById: { checkpoint: [{ id: "c", name: "Models" }] },
    imageCategories: [{ id: "i", name: "Images" }],
    presets: { positive: [{ id: "p", name: "Portrait", words: "portrait" }], negative: [] },
    baseModels: ["SDXL", "FLUX"],
  };
  onSnapshot.mock.calls[0][1]({ data: () => liveData });
  expect(store.getState().tabs).toMatchObject({ categoriesData: liveData.categoriesById, baseModels: ["FLUX", "SDXL"] });
  expect(store.getState().images.categories).toEqual(liveData.imageCategories);
  expect(store.getState().prompt.presets).toEqual(liveData.presets);
  expect(events).toEqual([
    "auth/setUserDataLoadError", "auth/setUserDataIsLoading",
    "tabs/setCategories", "images/setImageCategories", "prompt/setPresets", "tabs/setBaseModels",
  ]);

  pending.resolve({ exists: () => false });
  await request;
  expect(store.getState().auth).toMatchObject({ userDataIsLoading: false, userDataLoadError: "" });
});

it("hydrates stored preferences and guide data in the existing order", async () => {
  const events = [];
  const store = makeStore(events);
  const guide = { ...guideSlice.getInitialState(), introDisabled: true };
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({
    sfwValue: "PG", nsfwValue: "X", nsfwMode: true,
    uiState: { previewFullView: true, sidePanelCardfullView: true },
    guide, tester: true,
  }) });
  await store.dispatch(getUserData("user-1"));
  expect(store.getState().general).toMatchObject({ sfwValue: "PG", nsfwValue: "X", nsfwMode: true, nsfwLevel: "X" });
  expect(store.getState().tabs.previewFullView).toBe(true);
  expect(store.getState().used.fullCardView).toBe(true);
  expect(store.getState().guide).toEqual(guide);
  expect(store.getState().auth).toMatchObject({ tester: true, userDataIsLoading: false });
  expect(events).toEqual([
    "auth/setUserDataLoadError", "auth/setUserDataIsLoading",
    "general/setSfwValue", "general/setNsfwValue", "general/setNsfwMode",
    "tabs/setPreviewFullView", "used/cardViewState", "guide/setGuideInitialState",
    "auth/setTester", "auth/setUserDataIsLoading",
  ]);
});

it("preserves truthy guards for stored values and accepts false view preferences", async () => {
  const store = makeStore();
  store.dispatch(generalActions.setNsfwMode(true));
  store.dispatch(authActions.setTester(true));
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({
    sfwValue: "", nsfwValue: "", nsfwMode: false, tester: false,
    uiState: { previewFullView: false, sidePanelCardfullView: false },
  }) });
  await store.dispatch(getUserData("user-1"));
  expect(store.getState().general).toMatchObject({ sfwValue: "None", nsfwValue: "X", nsfwMode: true });
  expect(store.getState().auth.tester).toBe(true);
  expect(store.getState().tabs.previewFullView).toBe(false);
  expect(store.getState().used.fullCardView).toBe(false);
});

it("keeps live updates working after the initial read and ignores missing fields", async () => {
  const store = makeStore();
  await store.dispatch(getUserData("user-1"));
  const callback = onSnapshot.mock.calls[0][1];
  callback({ data: () => ({ baseModels: ["SDXL"] }) });
  callback({ data: () => undefined });
  callback({ data: () => ({}) });
  expect(store.getState().tabs.baseModels).toEqual(["SDXL"]);
  callback({ data: () => ({ baseModels: [] }) });
  expect(store.getState().tabs.baseModels).toEqual([]);
});

it.each(["subscription", "read"])("preserves error handling after a %s failure", async (stage) => {
  const store = makeStore();
  const error = new Error("User data unavailable");
  vi.spyOn(console, "error").mockImplementation(() => {});
  const unsubscribe = vi.fn();
  onSnapshot.mockReturnValue(unsubscribe);
  if (stage === "subscription") onSnapshot.mockImplementation(() => { throw error; });
  else getDoc.mockRejectedValue(error);

  await expect(store.dispatch(getUserData("user-1"))).resolves.toBeUndefined();
  expect(store.getState().auth).toMatchObject({ userDataLoadError: ERROR_MESSAGE_USER_DATA_LOAD, userDataIsLoading: false });
  expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ original: error }));
  expect(onSnapshot).toHaveBeenCalledOnce();
  if (stage === "subscription") expect(getDoc).not.toHaveBeenCalled();
  else {
    expect(getDoc).toHaveBeenCalledOnce();
    expect(unsubscribe).not.toHaveBeenCalled();
    stopUserDataSubscription();
    expect(unsubscribe).toHaveBeenCalledOnce();
  }
});

it("keeps the latest subscription handle without introducing automatic replacement cleanup", () => {
  const first = vi.fn();
  const second = vi.fn();
  onSnapshot.mockReturnValueOnce(first).mockReturnValueOnce(second);
  startUserDataSubscription("first-user", () => {});
  startUserDataSubscription("second-user", () => {});
  expect(first).not.toHaveBeenCalled();
  expect(second).not.toHaveBeenCalled();
  stopUserDataSubscription();
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledOnce();
});

it("starts sign-out, unsubscribes, then resets slices without waiting for sign-out", async () => {
  const events = [];
  const store = makeStore(events);
  const pending = deferred();
  signOut.mockImplementation(() => { events.push("signOut"); return pending.promise; });
  onSnapshot.mockReturnValue(() => events.push("unsubscribe"));
  await store.dispatch(getUserData("user-1"));
  events.length = 0;
  store.dispatch(authActions.logout());
  expect(signOut).toHaveBeenCalledExactlyOnceWith(auth);
  expect(events).toEqual([
    "auth/logout", "signOut", "unsubscribe",
    "images/resetCollectionListState", "images/setImageCategories",
    "model/resetModelData", "model/setActiveCarouselData",
    "prompt/clearPrompt", "prompt/setPromptIsOpen",
    "tabs/resetActiveTabs", "tabs/reset", "tabs/resetModelsData",
    "used/clearPanel", "used/panelState",
  ]);
  pending.resolve();
  await pending.promise;
});

it("initializes App Check with automatic token refresh on each login action", () => {
  const store = makeStore();
  const user = { uid: "user-1", accessToken: "", refreshToken: "", email: null, displayName: null, emailVerified: false };
  store.dispatch(authActions.login(user));
  store.dispatch(authActions.login(user));
  expect(initializeAppCheck).toHaveBeenCalledTimes(2);
  expect(initializeAppCheck).toHaveBeenCalledWith({}, {
    provider: expect.objectContaining({ key: import.meta.env.VITE_FIREBASE_REC }),
    isTokenAutoRefreshEnabled: true,
  });
});
