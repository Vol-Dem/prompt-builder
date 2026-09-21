import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import generalSlice, { setNsfwValues, switchNsfwMode } from "./general";
import tabsSlice, { switchPreviewFullView } from "./tabs";
import usedModelsSlice, { switchSidePanelfullView } from "./usedModels";
import promptSlice, { getUserPresets, promptActions, updatePresets } from "./prompt";

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

const existingPresets = {
  positive: [{ id: "p", name: "Portrait", words: "portrait" }],
  negative: [{ id: "n", name: "Blur", words: "blurry" }],
};
const updatedPresets = [{ id: "new", name: "Lighting", words: "soft light" }];

const makeStore = (uid = "user-1") => configureStore({
  reducer: {
    auth: (state = { user: { uid } }) => state,
    general: generalSlice.reducer,
    tabs: tabsSlice.reducer,
    used: usedModelsSlice.reducer,
    prompt: promptSlice.reducer,
  },
});

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  vi.resetAllMocks();
  doc.mockImplementation((_, ...parts) => {
    if (parts.at(-1) === "") throw new Error("Empty document ID");
    return parts.join("/");
  });
  updateDoc.mockResolvedValue(undefined);
});

const preferences = [
  {
    name: "NSFW mode",
    request: switchNsfwMode,
    fields: (value) => ({ nsfwMode: value }),
    check: (state, value) => {
      expect(state.general.nsfwMode).toBe(value);
      expect(state.general.nsfwLevel).toBe(value ? "X" : "None");
    },
  },
  {
    name: "NSFW values",
    request: (value) => setNsfwValues(value ? "PG" : "None", value ? "R" : "X"),
    fields: (value) => ({ sfwValue: value ? "PG" : "None", nsfwValue: value ? "R" : "X" }),
    check: (state, value) => {
      expect(state.general.sfwValue).toBe(value ? "PG" : "None");
      expect(state.general.nsfwValue).toBe(value ? "R" : "X");
      expect(state.general.nsfwLevel).toBe(value ? "PG" : "None");
    },
  },
  {
    name: "preview view",
    request: switchPreviewFullView,
    fields: (value) => ({ "uiState.previewFullView": value }),
    check: (state, value) => expect(state.tabs.previewFullView).toBe(value),
  },
  {
    name: "sidebar view",
    request: switchSidePanelfullView,
    fields: (value) => ({ "uiState.sidePanelCardfullView": value }),
    check: (state, value) => expect(state.used.fullCardView).toBe(value),
  },
];

describe.each(preferences)("$name persistence", ({ request, fields, check }) => {
  it.each([true, false])("updates Redux before saving %s with the existing field paths", async (value) => {
    const store = makeStore();
    await store.dispatch(request(!value));
    updateDoc.mockClear();
    const pending = deferred();
    updateDoc.mockImplementation(() => {
      check(store.getState(), value);
      return pending.promise;
    });

    const result = store.dispatch(request(value));
    expect(updateDoc).toHaveBeenCalledExactlyOnceWith("users/user-1", fields(value));
    pending.resolve();
    await result;
    check(store.getState(), value);
  });

  it("propagates write failures without rolling back the local preference", async () => {
    const store = makeStore();
    const error = new Error("Write failed");
    updateDoc.mockRejectedValue(error);

    await expect(store.dispatch(request(true))).rejects.toBe(error);
    check(store.getState(), true);
  });

  it("preserves the local update and document-path failure when the uid is empty", async () => {
    const store = makeStore("");

    await expect(store.dispatch(request(true))).rejects.toThrow("Empty document ID");
    check(store.getState(), true);
    expect(updateDoc).not.toHaveBeenCalled();
  });
});

describe("preset persistence", () => {
  it.each(["positive", "negative"])("saves only %s presets and updates Redux after success", async (type) => {
    const store = makeStore();
    store.dispatch(promptActions.setPresets(existingPresets));
    const pending = deferred();
    updateDoc.mockReturnValue(pending.promise);

    const result = store.dispatch(updatePresets(type, updatedPresets));
    expect(updateDoc).toHaveBeenCalledExactlyOnceWith("users/user-1", {
      [`presets.${type}`]: updatedPresets,
    });
    expect(store.getState().prompt.presets).toEqual(existingPresets);
    pending.resolve();
    await result;
    expect(store.getState().prompt.presets).toEqual({ ...existingPresets, [type]: updatedPresets });
  });

  it("does not change presets when a save fails", async () => {
    const store = makeStore();
    store.dispatch(promptActions.setPresets(existingPresets));
    const error = new Error("Write failed");
    updateDoc.mockRejectedValue(error);

    await expect(store.dispatch(updatePresets("positive", updatedPresets))).rejects.toBe(error);
    expect(store.getState().prompt.presets).toEqual(existingPresets);
  });

  it("skips saving and updating presets without a signed-in user", async () => {
    const store = makeStore("");
    store.dispatch(promptActions.setPresets(existingPresets));

    await store.dispatch(updatePresets("positive", updatedPresets));
    expect(doc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(store.getState().prompt.presets).toEqual(existingPresets);
  });

  it("loads presets from the user document after the read resolves", async () => {
    const store = makeStore();
    const pending = deferred();
    getDoc.mockReturnValue(pending.promise);

    const result = store.dispatch(getUserPresets());
    expect(getDoc).toHaveBeenCalledExactlyOnceWith("users/user-1");
    expect(store.getState().prompt.presets).toEqual({ positive: [], negative: [] });
    pending.resolve({ exists: () => true, data: () => ({ presets: existingPresets }) });
    await result;
    expect(store.getState().prompt.presets).toEqual(existingPresets);
  });

  it.each([
    { name: "missing document", exists: false, data: undefined },
    { name: "missing presets", exists: true, data: {} },
    { name: "null presets", exists: true, data: { presets: null } },
  ])("leaves current presets unchanged for $name", async ({ exists, data }) => {
    const store = makeStore();
    store.dispatch(promptActions.setPresets(existingPresets));
    getDoc.mockResolvedValue({ exists: () => exists, data: () => data });

    await store.dispatch(getUserPresets());
    expect(store.getState().prompt.presets).toEqual(existingPresets);
  });

  it("normalizes read failures and leaves current presets unchanged", async () => {
    const store = makeStore();
    store.dispatch(promptActions.setPresets(existingPresets));
    const error = new Error("Read failed");
    getDoc.mockRejectedValue(error);

    await expect(store.dispatch(getUserPresets())).rejects.toMatchObject({
      name: "AppError", message: "Read failed", original: error,
    });
    expect(store.getState().prompt.presets).toEqual(existingPresets);
  });

  it("retains the normalized document-path failure when reading without a uid", async () => {
    const store = makeStore("");

    await expect(store.dispatch(getUserPresets())).rejects.toMatchObject({
      name: "AppError", message: "Empty document ID",
    });
    expect(getDoc).not.toHaveBeenCalled();
  });
});
