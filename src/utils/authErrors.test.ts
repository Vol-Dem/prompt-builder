import { FirebaseError } from "firebase/app";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAuthRequestErrorMessage,
  getChangeEmailErrorMessage,
  getReauthErrorMessage,
  getResetPasswordErrorMessage,
} from "./authErrors";
import { AppError } from "./generalUtils";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

it.each([
  ["auth/invalid-login-credentials", "Invalid login credentials"],
  ["auth/invalid-credential", "Invalid login credentials"],
  ["auth/invalid-email", "Invalid email"],
  ["auth/wrong-password", "Wrong password"],
  ["auth/missing-password", "Missing password"],
  ["auth/user-not-found", "User not found"],
  ["auth/email-already-in-use", "This email address is already in use"],
  ["auth/weak-password", "Password is too weak"],
  ["auth/user-disabled", "This account has been disabled"],
  ["auth/popup-blocked", "Sign-in popup was blocked. Allow popups and try again"],
  ["auth/popup-closed-by-user", "Sign-in was cancelled"],
])("maps the authentication code %s independently of provider wording", (code, message) => {
  expect(getAuthRequestErrorMessage(new FirebaseError(code, "Internal provider details"))).toBe(message);
});

it.each(["auth/invalid-login-credentials", "auth/invalid-credential", "auth/wrong-password"])(
  "uses the current-password message specifically for reauthentication: %s", (code) => {
    expect(getReauthErrorMessage(new FirebaseError(code, "Internal provider details")))
      .toBe("The current password you entered did not match our records");
  },
);

it("preserves the email-change guidance without applying it to other workflows", () => {
  const error = new FirebaseError("auth/operation-not-allowed", "Provider failure");

  expect(getChangeEmailErrorMessage(error)).toBe("Please verify the new email before changing email");
  expect(getAuthRequestErrorMessage(error)).toBe(ERROR_MESSAGE_DEFAULT);
  expect(getReauthErrorMessage(error)).toBe(ERROR_MESSAGE_DEFAULT);
  expect(getResetPasswordErrorMessage(error)).toBe(ERROR_MESSAGE_DEFAULT);
});

it.each([getChangeEmailErrorMessage, getResetPasswordErrorMessage])(
  "retains invalid-email feedback in email-change and reset workflows", (getMessage) => {
    expect(getMessage(new FirebaseError("auth/invalid-email", "Provider failure"))).toBe("Invalid email");
  },
);

const workflows = [
  { name: "authentication", getMessage: getAuthRequestErrorMessage },
  { name: "reauthentication", getMessage: getReauthErrorMessage },
  { name: "email change", getMessage: getChangeEmailErrorMessage },
  { name: "password reset", getMessage: getResetPasswordErrorMessage },
];

describe.each(workflows)("$name error policy", ({ getMessage }) => {
  it.each(["auth/unknown", "toString", "constructor"])("uses the generic fallback for an unmapped code: %s", (code) => {
    const original = new FirebaseError(code, "Internal provider details");

    expect(getMessage(original)).toBe(ERROR_MESSAGE_DEFAULT);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  });

  it("does not infer a trusted message from JavaScript error text", () => {
    const original = new Error("Wrong password");

    expect(getMessage(original)).toBe(ERROR_MESSAGE_DEFAULT);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  });

  it("preserves an intentional application message", () => {
    const error = new AppError("Sign in again to continue", "auth/unknown");

    expect(getMessage(error)).toBe("Sign in again to continue");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("maps already-normalized provider errors without changing their cause", () => {
    const original = new FirebaseError("auth/network-request-failed", "Provider transport details");
    const error = new AppError(original.message, original.code, original, false);

    expect(getMessage(error)).toBe("Unable to connect. Check your connection and try again");
    expect(error.original).toBe(original);
    expect(error.cause).toBe(original);
  });
});
