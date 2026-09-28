// @vitest-environment jsdom
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import useAuthFormController from "./use-auth-form-controller";
import AuthForm from "../components/forms/Auth/AuthForm";
import authSlice, { authActions } from "../store/auth";
import { authRequest, authWithGoogle, resetUserPassword } from "../store/authThunks";
import { ERROR_MESSAGE_INPUT_DEF, ERROR_MESSAGE_OFFLINE, MESSAGE_AGREEMENT, VALIDATION_EMAIL_MAX_LENGTH } from "../variables/constants";

// Exercise the real reducer, inputs, validation and password-reset form.
vi.mock("../store/authThunks", () => ({ authRequest: vi.fn(), authWithGoogle: vi.fn(), resetUserPassword: vi.fn() }));
vi.mock("../components/ui/Spinner", () => ({ default: () => <div role="status">Loading</div> }));

let online;
beforeEach(() => {
  online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  for (const request of [authRequest, authWithGoogle, resetUserPassword]) {
    request.mockReset().mockImplementation(() => (dispatch) => {
      dispatch(authActions.setIsLoading(true));
    });
  }
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const makeStore = () => configureStore({ reducer: { auth: authSlice.reducer } });
const wrapperFor = (store) => ({ children }) => <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>;
const mountForm = (store = makeStore()) => ({ store, ...render(<AuthForm />, { wrapper: wrapperFor(store) }) });
const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const fill = (password = "ValidPassword1") => { change("Email", "reader@example.com"); change("Password", password); };
const submit = (container) => fireEvent.submit(container.querySelector("form"));
const signup = () => fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
const acceptAgreement = () => fireEvent.click(screen.getByRole("checkbox"));

it("allows an existing short password at login and exposes loading state", () => {
  const { store, container } = mountForm();
  fill("a");
  submit(container);
  expect(authRequest).toHaveBeenCalledExactlyOnceWith(true, "reader@example.com", "a");
  expect(store.getState().auth.isLoading).toBe(true);
  expect(screen.getByLabelText("Email").disabled).toBe(true);
  expect(screen.getByLabelText("Password").disabled).toBe(true);
  expect(screen.getByRole("button", { name: "Create Account" }).disabled).toBe(true);
  expect(screen.getByRole("button", { name: /Log in/ }).disabled).toBe(true);
  expect(screen.getByRole("status").textContent).toBe("Loading");
});

it.each(["", "short", "lowercasepassword"])("rejects invalid registration password %j after agreement", (password) => {
  const { container } = mountForm();
  signup();
  fill(password);
  acceptAgreement();
  submit(container);
  expect(screen.getByText(ERROR_MESSAGE_INPUT_DEF)).toBeTruthy();
  expect(authRequest).not.toHaveBeenCalled();
});

it("requires agreement before registering and forwards the accepted credentials", () => {
  const { container } = mountForm();
  signup();
  fill();
  submit(container);
  expect(screen.getByText(MESSAGE_AGREEMENT)).toBeTruthy();
  expect(authRequest).not.toHaveBeenCalled();
  acceptAgreement();
  submit(container);
  expect(authRequest).toHaveBeenCalledExactlyOnceWith(false, "reader@example.com", "ValidPassword1");
  expect(screen.queryByText(MESSAGE_AGREEMENT)).toBeNull();
});

it.each(["", "missing-at", `${"x".repeat(VALIDATION_EMAIL_MAX_LENGTH)}@example.com`])("rejects invalid email %j", (email) => {
  const { container } = mountForm();
  change("Email", email);
  change("Password", "a");
  submit(container);
  expect(screen.getByText(ERROR_MESSAGE_INPUT_DEF)).toBeTruthy();
  expect(authRequest).not.toHaveBeenCalled();
});

it("reports offline before agreement or input errors and clears earlier messages", () => {
  const { store, container } = mountForm();
  signup();
  act(() => {
    store.dispatch(authActions.setErrorMessage("Old error"));
    store.dispatch(authActions.setSuccessMessage("Old success"));
  });
  online.mockReturnValue(false);
  submit(container);
  expect(store.getState().auth).toMatchObject({ errorMessage: ERROR_MESSAGE_OFFLINE, successMessage: "" });
  expect(screen.getByText(ERROR_MESSAGE_OFFLINE)).toBeTruthy();
  expect(authRequest).not.toHaveBeenCalled();
});

it("clears fields and validation feedback when switching modes but retains agreement", () => {
  const { store, container } = mountForm();
  signup();
  fill("short");
  acceptAgreement();
  submit(container);
  expect(screen.getByText(ERROR_MESSAGE_INPUT_DEF)).toBeTruthy();
  act(() => store.dispatch(authActions.setSuccessMessage("Old success")));
  fireEvent.click(screen.getByRole("button", { name: "Log in" }));
  expect(screen.getByLabelText("Email").value).toBe("");
  expect(screen.getByLabelText("Password").value).toBe("");
  expect(store.getState().auth).toMatchObject({ errorMessage: "", successMessage: "", showResetPassword: false });
  expect(screen.queryByText(ERROR_MESSAGE_INPUT_DEF)).toBeNull();
  expect(screen.queryByText("This field is required")).toBeNull();
  signup();
  expect(screen.getByRole("checkbox").checked).toBe(true);
  fill();
  submit(container);
  expect(authRequest).toHaveBeenCalledExactlyOnceWith(false, "reader@example.com", "ValidPassword1");
});

it.each([false, true])("keeps email blur feedback specific to registration=%s", (register) => {
  mountForm();
  if (register) signup();
  change("Email", "invalid");
  fireEvent.blur(screen.getByLabelText("Email"));
  expect(!!screen.queryByText("Please enter a valid email address")).toBe(register);
});

it("forwards Google sign-in separately from email/password submission", () => {
  mountForm();
  fireEvent.click(screen.getByRole("button", { name: /Sign in with Google/ }));
  expect(authWithGoogle).toHaveBeenCalledExactlyOnceWith();
  expect(authRequest).not.toHaveBeenCalled();
});

it("opens the existing password-reset form with messages cleared and cleans up on unmount", () => {
  const { store, container, unmount } = mountForm();
  act(() => {
    store.dispatch(authActions.setErrorMessage("Old error"));
    store.dispatch(authActions.setSuccessMessage("Old success"));
  });
  fireEvent.click(screen.getByText("Forgot your password?"));
  expect(store.getState().auth).toMatchObject({ showResetPassword: true, errorMessage: "", successMessage: "" });
  expect(screen.queryByLabelText("Password")).toBeNull();
  expect(screen.getByRole("button", { name: "Reset password" })).toBeTruthy();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "reader@example.com" } });
  submit(container);
  expect(resetUserPassword).toHaveBeenCalledExactlyOnceWith("reader@example.com");
  expect(authRequest).not.toHaveBeenCalled();
  act(() => {
    store.dispatch(authActions.setErrorMessage("Reset error"));
    store.dispatch(authActions.setSuccessMessage("Reset success"));
  });
  unmount();
  expect(store.getState().auth).toMatchObject({ errorMessage: "", successMessage: "", showResetPassword: false });
});

it("preserves null-validity normalization and clears reset mode when switching", () => {
  const store = makeStore();
  const { result } = renderHook(useAuthFormController, { wrapper: wrapperFor(store) });
  act(() => {
    result.current.fields.email.onChange({ target: { value: "reader@example.com" } }, null);
    result.current.fields.password.onChange({ target: { value: "a" } }, null);
  });
  expect(result.current.fields.email.isValid).toBe(true);
  expect(result.current.fields.password.isValid).toBe(true);
  act(() => result.current.mode.openPasswordReset());
  expect(result.current.mode.showResetPassword).toBe(true);
  act(() => result.current.mode.onSwitch());
  expect(result.current.mode).toMatchObject({ isLogin: false, showResetPassword: false });
  expect(result.current.fields.email).toMatchObject({ value: "", isValid: false });
  expect(result.current.fields.password).toMatchObject({ value: "", isValid: false });
});
