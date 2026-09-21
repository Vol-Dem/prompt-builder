// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDoc, onSnapshot } from "firebase/firestore";

import ModelEdit from "./Edit";
import { DEFAULT_PAGE_TITLE, ERROR_MESSAGE_DEFAULT } from "../variables/constants";

const { dispatch, state } = vi.hoisted(() => ({
  dispatch: vi.fn(),
  state: { auth: { user: { uid: "user-1" } }, guide: {} },
}));

vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({}) }));
vi.mock("firebase/firestore", () => ({
  getFirestore: () => ({}),
  doc: (_, ...parts) => parts.join("/"),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
}));
vi.mock("../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector) => selector(state),
}));
vi.mock("../store/model", () => ({
  modelActions: Object.fromEntries(
    [
      "setModelData", "setModelPreview", "updateModelDataField",
      "setErrorMessage", "setCurVersion", "setActiveCarouselData",
    ].map((name) => [name, (payload) => ({ type: `model/${name}`, payload })]),
  ),
}));
vi.mock("../store/guide", () => ({ guideActions: {} }));
vi.mock("../components/model/model-settings/ModelSettings", () => ({
  default: () => <div>Model settings</div>,
}));
vi.mock("../components/ui/Spinner", () => ({
  default: () => <div role="status">Loading</div>,
}));
vi.mock("../components/ui/ErrorMessage", () => ({
  default: ({ children }) => <div role="alert">{children}</div>,
}));
vi.mock("../components/ui/Modal", () => ({ default: () => null }));
vi.mock("../components/general-elements/guide/OutroGuide", () => ({
  default: () => null,
}));

let subscriptions;

const renderEdit = () => {
  const router = createMemoryRouter(
    [{ path: "/edit/:modelId", element: <ModelEdit title="Edit model" /> }],
    { initialEntries: ["/edit/42"] },
  );
  return { router, ...render(<RouterProvider router={router} />) };
};

const emitModel = async (data, index = 0) => {
  await act(async () => subscriptions[index].callback({ data: () => data }));
};

beforeEach(() => {
  vi.resetAllMocks();
  subscriptions = [];
  state.auth.user.uid = "user-1";
  document.title = DEFAULT_PAGE_TITLE;
  onSnapshot.mockImplementation((path, callback) => {
    const unsubscribe = vi.fn();
    subscriptions.push({ path, callback, unsubscribe });
    return unsubscribe;
  });
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ name: "Public model" }) });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("edit-page model data access", () => {
  it("subscribes before the public read and keeps loading until the user model arrives", async () => {
    renderEdit();

    await waitFor(() => expect(document.title).toBe("Edit - Public model"));
    expect(subscriptions[0].path).toBe("users/user-1/models/42");
    expect(getDoc).toHaveBeenCalledWith("models/42");
    expect(onSnapshot.mock.invocationCallOrder[0]).toBeLessThan(getDoc.mock.invocationCallOrder[0]);
    expect(dispatch).toHaveBeenCalledWith({
      type: "model/updateModelDataField", payload: { data: { name: "Public model" } },
    });
    expect(screen.getByRole("status").textContent).toBe("Loading");

    const model = { id: 42, name: "My model" };
    await emitModel(model);
    expect(screen.getByText("Model settings")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({ type: "model/setModelData", payload: model });
    expect(dispatch).toHaveBeenCalledWith({ type: "model/setModelPreview", payload: [] });

    dispatch.mockClear();
    const updatedModel = { ...model, name: "Updated in another tab" };
    await emitModel(updatedModel);
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
      { type: "model/setModelData", payload: updatedModel },
      { type: "model/setModelPreview", payload: [] },
    ]);
  });

  it("shows the existing error and unsubscribes when the user model is missing", async () => {
    renderEdit();
    await emitModel(undefined);

    expect(screen.getByRole("alert").textContent).toBe("Failed to load model");
    expect(screen.queryByText("Model settings")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(subscriptions[0].unsubscribe).toHaveBeenCalledOnce();
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "model/setModelData" }));
  });

  it("retains null public data and the fallback title when the public model is missing", async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    renderEdit();
    await emitModel({ id: 42 });

    await waitFor(() => expect(document.title).toBe("Edit model"));
    expect(dispatch).toHaveBeenCalledWith({ type: "model/updateModelDataField", payload: { data: null } });
    expect(screen.getByText("Model settings")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("cleans up on model navigation and unmount", async () => {
    const { router, unmount } = renderEdit();
    await emitModel({ id: 42 });
    dispatch.mockClear();

    await act(async () => { await router.navigate("/edit/43"); });

    expect(subscriptions[0].unsubscribe).toHaveBeenCalledOnce();
    expect(subscriptions[1].path).toBe("users/user-1/models/43");
    expect(getDoc).toHaveBeenLastCalledWith("models/43");
    expect(dispatch.mock.calls.slice(0, 3).map(([action]) => action)).toEqual([
      { type: "model/setCurVersion", payload: null },
      { type: "model/setModelData", payload: null },
      { type: "model/setActiveCarouselData", payload: null },
    ]);
    expect(screen.getByRole("status")).toBeTruthy();
    await emitModel({ id: 43 }, 1);
    expect(screen.getByText("Model settings")).toBeTruthy();

    dispatch.mockClear();
    unmount();
    expect(subscriptions[1].unsubscribe).toHaveBeenCalledOnce();
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
      { type: "model/setCurVersion", payload: null },
      { type: "model/setModelData", payload: null },
      { type: "model/setActiveCarouselData", payload: null },
    ]);
    expect(document.title).toBe(DEFAULT_PAGE_TITLE);
  });

  it("preserves the public-read error presentation and cleans up the subscription", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    getDoc.mockRejectedValue(new Error("Read failed"));
    const { unmount } = renderEdit();

    expect((await screen.findByRole("alert")).textContent).toBe("Failed to load model");
    expect(dispatch).toHaveBeenCalledWith({ type: "model/setErrorMessage", payload: ERROR_MESSAGE_DEFAULT });
    expect(screen.queryByRole("status")).toBeNull();
    expect(subscriptions[0].unsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(subscriptions[0].unsubscribe).toHaveBeenCalledOnce();
  });

  it("handles subscription setup failures without starting the public read", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    onSnapshot.mockImplementation(() => { throw new Error("Subscription failed"); });
    const { unmount } = renderEdit();

    expect((await screen.findByRole("alert")).textContent).toBe("Failed to load model");
    expect(dispatch).toHaveBeenCalledWith({ type: "model/setErrorMessage", payload: ERROR_MESSAGE_DEFAULT });
    expect(getDoc).not.toHaveBeenCalled();
    expect(() => unmount()).not.toThrow();
  });

  it("does not access model documents without a signed-in user", () => {
    state.auth.user.uid = "";
    renderEdit();

    expect(onSnapshot).not.toHaveBeenCalled();
    expect(getDoc).not.toHaveBeenCalled();
  });
});
