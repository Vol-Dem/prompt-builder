// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useProfileEditingController from "./use-profile-editing-controller";
import Profile from "../pages/Profile";
import authSlice, { authActions } from "../store/auth";
import { changeUserEmail, changeUserName, changeUserPassword } from "../store/authThunks";
import { DEFAULT_PAGE_TITLE, ERROR_MESSAGE_AUTH, ERROR_MESSAGE_INPUT_DEF, ERROR_MESSAGE_OFFLINE, VALIDATION_USERNAME_MAX_LENGTH } from "../variables/constants";

// Keep real inputs, validation and Redux; replace the request and modal boundaries.
vi.mock("../store/authThunks", () => ({
  changeUserEmail: vi.fn(), changeUserName: vi.fn(), changeUserPassword: vi.fn(),
}));
vi.mock("../components/ui/Modal", () => ({
  default: ({ children, onClose }) => <div role="dialog">{children}<button onClick={onClose}>Close dialog</button></div>,
}));
vi.mock("../components/forms/ReAuth/ReAuthForm", () => ({ default: () => <div>Reauthenticate</div> }));
vi.mock("../components/general-elements/verify-email-message/VerifyEmailMessage", () => ({ default: () => <div>Verify email</div> }));

let online;
beforeEach(() => {
  online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  for (const request of [changeUserEmail, changeUserName, changeUserPassword]) {
    request.mockReset().mockReturnValue({ type: "test/request" });
  }
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const makeStore = (user = {}) => {
  const store = configureStore({ reducer: { auth: authSlice.reducer } });
  store.dispatch(authActions.login({
    accessToken: "token", refreshToken: "refresh", uid: "user-1",
    email: "reader@example.com", displayName: "Reader", emailVerified: true, ...user,
  }));
  return store;
};
const wrapperFor = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;
const mountProfile = (store = makeStore()) => ({ store, ...render(<Profile title="Your profile" />, { wrapper: wrapperFor(store) }) });
const openName = () => {
  fireEvent.click(screen.getByRole("button", { name: "Change", exact: true }));
  return screen.getByRole("textbox");
};
const openPassword = () => {
  fireEvent.click(screen.getByRole("button", { name: "Change password" }));
  return screen.getByLabelText("New password");
};
const change = (input, value) => fireEvent.change(input, { target: { value } });
const submit = (input) => fireEvent.submit(input.closest("form"));

it("forwards the name and closes immediately while the save is pending, then reopens blank", async () => {
  let finish;
  changeUserName.mockImplementation(() => async (dispatch) => {
    await new Promise((resolve) => { finish = resolve; });
    dispatch(authActions.setErrorMessage("Name save failed"));
  });
  mountProfile();
  const input = openName();
  expect(input.value).toBe("");
  change(input, "New name");
  submit(input);
  expect(changeUserName).toHaveBeenCalledExactlyOnceWith("New name");
  expect(screen.queryByRole("textbox")).toBeNull();
  await act(async () => finish());
  expect(screen.getByText("Name save failed")).toBeTruthy();
  expect(openName().value).toBe("");
});

it.each(["", "x".repeat(VALIDATION_USERNAME_MAX_LENGTH + 1)])("rejects an invalid name %j before checking connectivity", (value) => {
  online.mockReturnValue(false);
  mountProfile();
  const input = openName();
  change(input, value);
  submit(input);
  expect(screen.getByText(ERROR_MESSAGE_INPUT_DEF)).toBeTruthy();
  expect(screen.queryByText(ERROR_MESSAGE_OFFLINE)).toBeNull();
  expect(changeUserName).not.toHaveBeenCalled();
});

it("clears earlier server messages and reports offline for a valid name, then clears the local error on retry", () => {
  const { store } = mountProfile();
  act(() => {
    store.dispatch(authActions.setErrorMessage("Old error"));
    store.dispatch(authActions.setSuccessMessage("Old success"));
  });
  const input = openName();
  expect(screen.getByText("Old error")).toBeTruthy();
  change(input, "New name");
  online.mockReturnValue(false);
  submit(input);
  expect(store.getState().auth).toMatchObject({ errorMessage: "", successMessage: "" });
  expect(screen.getByText(ERROR_MESSAGE_OFFLINE)).toBeTruthy();
  expect(changeUserName).not.toHaveBeenCalled();
  online.mockReturnValue(true);
  submit(input);
  expect(screen.queryByText(ERROR_MESSAGE_OFFLINE)).toBeNull();
  expect(changeUserName).toHaveBeenCalledExactlyOnceWith("New name");
});

it.each(["", "short", "lowercasepassword"])("rejects invalid new password %j", (value) => {
  mountProfile();
  const input = openPassword();
  change(input, value);
  submit(input);
  expect(screen.getByText(ERROR_MESSAGE_INPUT_DEF)).toBeTruthy();
  expect(changeUserPassword).not.toHaveBeenCalled();
});

it("clears both passwords immediately while saving and keeps the editor open after failure", async () => {
  let finish;
  changeUserPassword.mockImplementation(() => async (dispatch) => {
    await new Promise((resolve) => { finish = resolve; });
    dispatch(authActions.setErrorMessage("Password save failed"));
  });
  mountProfile();
  const input = openPassword();
  change(screen.getByLabelText("Current password"), "old");
  change(input, "ValidPassword1");
  submit(input);
  expect(changeUserPassword).toHaveBeenCalledExactlyOnceWith("ValidPassword1", "old");
  expect(screen.getByLabelText("Current password").value).toBe("");
  expect(screen.getByLabelText("New password").value).toBe("");
  await act(async () => finish());
  expect(screen.getByText("Password save failed")).toBeTruthy();
  expect(screen.getByLabelText("New password")).toBeTruthy();
});

it("does not add a current-password requirement", () => {
  mountProfile();
  const input = openPassword();
  change(input, "ValidPassword1");
  submit(input);
  expect(changeUserPassword).toHaveBeenCalledExactlyOnceWith("ValidPassword1", "");
});

it("retains current password but clears the new password when canceling and reopening", () => {
  mountProfile();
  const input = openPassword();
  change(screen.getByLabelText("Current password"), "old");
  change(input, "ValidPassword1");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(openPassword().value).toBe("");
  expect(screen.getByLabelText("Current password").value).toBe("old");
});

it("keeps name and password editors independent and preserves drafts when offline", () => {
  mountProfile();
  const name = openName();
  change(name, "New name");
  const password = openPassword();
  change(password, "ValidPassword1");
  change(screen.getByLabelText("Current password"), "old");
  online.mockReturnValue(false);
  submit(password);
  expect(screen.getByText(ERROR_MESSAGE_OFFLINE)).toBeTruthy();
  expect(changeUserPassword).not.toHaveBeenCalled();
  expect(name.value).toBe("New name");
  expect(password.value).toBe("ValidPassword1");
  expect(screen.getByLabelText("Current password").value).toBe("old");
});

it("keeps email editing unavailable in the page", () => {
  const { container } = mountProfile();
  expect(screen.getByText("reader@example.com")).toBeTruthy();
  expect(container.querySelector('input[type="email"]')).toBeNull();
  expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Change", "Change password"]);
});

it("preserves the inactive email workflow, including its validation and existing editor reset", () => {
  const { result } = renderHook(useProfileEditingController, { wrapper: wrapperFor(makeStore()) });
  const event = { preventDefault: vi.fn() };
  act(() => { result.current.email.onToggle(); result.current.password.onToggle(); });
  act(() => { result.current.email.onSubmit(event); });
  expect(result.current.status.errorMessage).toBe(ERROR_MESSAGE_INPUT_DEF);
  expect(changeUserEmail).not.toHaveBeenCalled();
  act(() => result.current.email.input.onChange({ target: { value: "new@example.com" } }, true));
  online.mockReturnValue(false);
  act(() => { result.current.email.onSubmit(event); });
  expect(result.current.status.errorMessage).toBe(ERROR_MESSAGE_OFFLINE);
  expect(changeUserEmail).not.toHaveBeenCalled();
  online.mockReturnValue(true);
  act(() => { result.current.email.onSubmit(event); });
  expect(changeUserEmail).toHaveBeenCalledExactlyOnceWith("new@example.com");
  expect(result.current.email.isActive).toBe(true);
  expect(result.current.password.isActive).toBe(false);
  expect(result.current.status.errorMessage).toBe("");
  act(() => result.current.email.onToggle());
  expect(result.current.email.input).toMatchObject({ value: "", isValid: false });
});

it("normalizes null validity for all fields", () => {
  const { result } = renderHook(useProfileEditingController, { wrapper: wrapperFor(makeStore()) });
  act(() => {
    for (const field of [result.current.name.input, result.current.email.input, result.current.password.current, result.current.password.next]) {
      field.onChange({ target: { value: "value" } }, null);
    }
  });
  for (const field of [result.current.name.input, result.current.email.input, result.current.password.current, result.current.password.next]) {
    expect(field).toMatchObject({ value: "value", isValid: true });
  }
});

it("retains page title, email-name fallback, verification notice and modal ownership", () => {
  const store = makeStore({ displayName: null, emailVerified: false });
  store.dispatch(authActions.setReauthFormIsOpen(true));
  const { unmount } = mountProfile(store);
  expect(document.title).toBe("Your profile");
  expect(screen.getByText("reader")).toBeTruthy();
  expect(screen.getByText("Verify email")).toBeTruthy();
  expect(screen.getByRole("dialog").textContent).toContain("Reauthenticate");
  fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
  expect(store.getState().auth.reAuthFormIsOpen).toBe(false);
  expect(screen.queryByRole("dialog")).toBeNull();
  act(() => store.dispatch(authActions.setSuccessMessage("Saved")));
  expect(screen.getByText("Saved")).toBeTruthy();
  unmount();
  expect(document.title).toBe(DEFAULT_PAGE_TITLE);
  expect(store.getState().auth.successMessage).toBe("Saved");
});

it("shows the authentication fallback when logged out", () => {
  const store = makeStore();
  store.dispatch(authActions.logout());
  mountProfile(store);
  expect(screen.getByText(ERROR_MESSAGE_AUTH)).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Profile" })).toBeNull();
});
