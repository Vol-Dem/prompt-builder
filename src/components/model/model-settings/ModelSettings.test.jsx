// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import ModelSettings from "./ModelSettings";
import { deleteModelDoc } from "../../../utils/fetch/fetchModel";
import { ERROR_MESSAGE_MODEL_DELETE } from "../../../variables/constants";

const { dispatch, navigate, state } = vi.hoisted(() => ({ dispatch: vi.fn(), navigate: vi.fn(), state: {} }));
vi.mock("../../../store/hooks/hooks", () => ({
  useAppDispatch: () => dispatch, useAppSelector: (selector) => selector(state),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));
vi.mock("../../../utils/fetch/fetchModel", () => ({
  deleteModelDoc: vi.fn(), fetchModelUpdates: vi.fn(), updateUserCustomModelData: vi.fn(),
}));
vi.mock("../../../store/model", () => ({ modelActions: { resetModelData: () => ({ type: "model/resetModelData" }) } }));
vi.mock("../../../store/tabs", () => ({ tabActions: {
  resetModelsData: () => ({ type: "tabs/resetModelsData" }),
  resetActiveTabs: () => ({ type: "tabs/resetActiveTabs" }),
} }));
vi.mock("../../forms/update-model-form/UpdateModelForm", () => ({ default: () => null }));
vi.mock("../../forms/version-form/VersionForm", () => ({ default: () => null }));
vi.mock("../../forms/version-status-form/VersionStatusForm", () => ({ default: () => null }));
vi.mock("../../general-elements/guide/edit/EditPageGuide", () => ({ default: () => null }));
vi.mock("../../layout/left-sidebar/LeftSidebar", () => ({ default: ({ children }) => <aside>{children}</aside> }));
vi.mock("../../ui/Modal", () => ({ default: ({ children, onClose }) => (
  <div role="dialog">{children}<button onClick={onClose}>Close</button></div>
) }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal(), AnimatePresence: ({ children }) => children,
}));

const model = { id: 42, savedImages: { 9: [{ postId: 7, imagesId: [1] }] } };
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((finish, fail) => { resolve = finish; reject = fail; });
  return { promise, resolve, reject };
};
let pending;
beforeEach(() => {
  vi.resetAllMocks();
  state.model = { model };
  state.auth = { user: { uid: "user-1" } };
  state.tabs = { baseModels: [] };
  state.guide = { active: false, edit: { active: false } };
  pending = deferred();
  deleteModelDoc.mockImplementation(() => pending.promise);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const openConfirmation = () => {
  render(<ModelSettings />);
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  return screen.getByRole("dialog");
};

it("waits for the entire deletion before resetting state or navigating and keeps the pending dialog open", async () => {
  const dialog = openConfirmation();
  expect(deleteModelDoc).not.toHaveBeenCalled();
  const confirm = within(dialog).getByRole("button", { name: "Delete" });
  fireEvent.click(confirm);
  expect(deleteModelDoc).toHaveBeenCalledExactlyOnceWith("user-1", model);
  expect(dispatch).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  expect(within(dialog).getByText("Don't close this window until the deletion is complete")).toBeTruthy();
  fireEvent.click(confirm);
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(deleteModelDoc).toHaveBeenCalledOnce();

  await act(async () => { pending.resolve(); });
  expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
    "model/resetModelData", "tabs/resetModelsData", "tabs/resetActiveTabs",
  ]);
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/");
});

it("shows cleanup failure inside the confirmation, retains state, and lets the user retry", async () => {
  const dialog = openConfirmation();
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  const original = new Error("Private cleanup failure details");
  await act(async () => { pending.reject(original); });
  expect(within(dialog).getByTestId("error-message").textContent).toBe(ERROR_MESSAGE_MODEL_DELETE);
  expect(screen.queryByText(original.message)).toBeNull();
  expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  expect(dispatch).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeTruthy();

  pending = deferred();
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  expect(deleteModelDoc).toHaveBeenCalledTimes(2);
  expect(screen.queryByTestId("error-message")).toBeNull();
  expect(navigate).not.toHaveBeenCalled();
  await act(async () => { pending.resolve(); });
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/");
});

it("allows cancelling after cleanup failure and clears that error when reopened", async () => {
  let dialog = openConfirmation();
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  await act(async () => { pending.reject(new Error("Cleanup failed")); });
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  dialog = screen.getByRole("dialog");
  expect(within(dialog).queryByTestId("error-message")).toBeNull();
  expect(navigate).not.toHaveBeenCalled();
});
