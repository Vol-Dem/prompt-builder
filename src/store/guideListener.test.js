import { configureStore, isDraft } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getDoc, onSnapshot, setDoc } from "firebase/firestore";

import guideSlice, { guideActions } from "./guide";
import { guideListener } from "./guideListener";
import appStore from "./store";
import { getUserData } from "./authThunks";

const { auth } = vi.hoisted(() => ({ auth: { currentUser: null } }));
vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", async (importOriginal) => ({
  ...await importOriginal(),
  getAuth: () => auth,
}));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));
vi.mock("firebase/app-check", () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: class {},
}));

const makeStore = () => configureStore({
  reducer: {
    guide: guideSlice.reducer,
    auth: () => ({ user: { uid: "redux-user" } }),
  },
  middleware: (getDefault) => getDefault().prepend(guideListener.middleware),
});
const initial = guideSlice.getInitialState();

beforeEach(() => {
  vi.resetAllMocks();
  auth.currentUser = { uid: "firebase-user" };
  setDoc.mockResolvedValue(undefined);
  onSnapshot.mockReturnValue(vi.fn());
  appStore.dispatch(guideActions.setGuideInitialState(initial));
});
afterEach(() => {
  auth.currentUser = null;
  vi.restoreAllMocks();
});

it.each([
  { name: "guide activation", action: () => guideActions.setGuideIsActive(true), changes: { active: true } },
  { name: "intro preference", action: () => guideActions.setIntroDisabled(true), changes: { introDisabled: true } },
  { name: "outro activation", action: () => guideActions.setOutroIsActive(true), changes: { outroIsActive: true } },
  { name: "next step", action: () => guideActions.guideNextStep({ type: "model" }), changes: { model: { active: true, step: 2 } } },
  { name: "previous step", action: () => guideActions.guidePrevStep({ type: "home" }), changes: { home: { active: true, step: 0 } } },
  { name: "section activation", action: () => guideActions.setGuideActive({ type: "edit", value: true }), changes: { edit: { active: true, step: 1 } } },
  { name: "specific step", action: () => guideActions.setGuideStep({ type: "home", value: 4 }), changes: { home: { active: true, step: 4 } } },
])("persists completed state for $name using the Firebase uid and merge option", ({ action, changes }) => {
  const store = makeStore();
  const update = action();
  expect(store.dispatch(update)).toBe(update);
  const expected = { ...initial, ...changes };
  expect(store.getState().guide).toEqual(expected);
  expect(setDoc).toHaveBeenCalledExactlyOnceWith("users/firebase-user", { guide: expected }, { merge: true });
  const saved = setDoc.mock.calls[0][1].guide;
  expect(isDraft(saved)).toBe(false);
  expect(saved).toBe(store.getState().guide);
});

it("restores guide state without saving it back", () => {
  const store = makeStore();
  const restored = { ...initial, active: true, model: { active: false, step: 5 } };
  store.dispatch(guideActions.setGuideInitialState(restored));
  expect(store.getState().guide).toEqual(restored);
  expect(setDoc).not.toHaveBeenCalled();
});

it("retains the existing action-prefix matching and restoration-prefix exclusion", () => {
  const store = makeStore();
  store.dispatch({ type: "unrelated/action" });
  store.dispatch({ type: "guide/setGuideInitialState/custom" });
  expect(setDoc).not.toHaveBeenCalled();
  store.dispatch({ type: "guide/custom" });
  expect(setDoc).toHaveBeenCalledExactlyOnceWith("users/firebase-user", { guide: initial }, { merge: true });
});

it("skips saves while signed out but still updates guide state", () => {
  auth.currentUser = null;
  const store = makeStore();
  store.dispatch(guideActions.guideNextStep({ type: "model" }));
  expect(store.getState().guide.model.step).toBe(2);
  expect(setDoc).not.toHaveBeenCalled();
});

it("checks the current Firebase account for each action", () => {
  const store = makeStore();
  store.dispatch(guideActions.setGuideIsActive(true));
  auth.currentUser = { uid: "second-user" };
  store.dispatch(guideActions.setIntroDisabled(true));
  auth.currentUser = null;
  store.dispatch(guideActions.setOutroIsActive(true));
  expect(setDoc.mock.calls.map(([path]) => path)).toEqual(["users/firebase-user", "users/second-user"]);
});

it("starts every save immediately and keeps each state snapshot stable while writes are pending", async () => {
  const pending = [];
  setDoc.mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
  const store = makeStore();
  store.dispatch(guideActions.guideNextStep({ type: "model" }));
  store.dispatch(guideActions.guideNextStep({ type: "model" }));
  expect(setDoc).toHaveBeenCalledTimes(2);
  const snapshots = setDoc.mock.calls.map(([, data]) => data.guide);
  expect(snapshots.map((guide) => guide.model.step)).toEqual([2, 3]);
  pending[1]();
  pending[0]();
  await Promise.resolve();
  expect(snapshots.map((guide) => guide.model.step)).toEqual([2, 3]);
  expect(store.getState().guide.model.step).toBe(3);
});

it("retains the save helper's error logging without rejecting dispatch, retrying, or reverting state", async () => {
  const error = new Error("Write failed");
  vi.spyOn(console, "error").mockImplementation(() => {});
  setDoc.mockRejectedValue(error);
  const store = makeStore();
  const action = guideActions.setGuideIsActive(true);
  expect(store.dispatch(action)).toBe(action);
  await vi.waitFor(() => expect(console.error).toHaveBeenCalledExactlyOnceWith("Write failed"));
  expect(store.getState().guide.active).toBe(true);
  expect(setDoc).toHaveBeenCalledOnce();
});

it("keeps direct reducer calls free of persistence", () => {
  const state = guideSlice.reducer(undefined, guideActions.guideNextStep({ type: "home" }));
  expect(state.home.step).toBe(2);
  expect(setDoc).not.toHaveBeenCalled();
});

it("registers the guide listener once in the application store", () => {
  appStore.dispatch(guideActions.setIntroDisabled(true));
  expect(setDoc).toHaveBeenCalledExactlyOnceWith("users/firebase-user", {
    guide: { ...initial, introDisabled: true },
  }, { merge: true });
});

it("does not write back guide data loaded by the authentication workflow", async () => {
  const restored = { ...initial, model: { active: false, step: 4 } };
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ guide: restored }) });
  await appStore.dispatch(getUserData("firebase-user"));
  expect(appStore.getState().guide).toEqual(restored);
  expect(setDoc).not.toHaveBeenCalled();
});
