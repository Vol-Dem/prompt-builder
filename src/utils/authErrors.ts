import { normalizeError } from "./generalUtils";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";

const tooManyRequestsMessage =
  "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later";

export const getAuthRequestErrorMessage = (error: unknown): string => {
  const err = normalizeError(error);
  switch (err.code) {
    case "auth/invalid-login-credentials":
    case "auth/invalid-credential":
      return "Invalid login credentials";
    case "auth/invalid-email":
      return "Invalid email";
    case "auth/wrong-password":
      return "Wrong password";
    case "auth/missing-password":
      return "Missing password";
    case "auth/user-not-found":
      return "User not found";
    case "auth/too-many-requests":
      return tooManyRequestsMessage;
    default:
      return err.message;
  }
};

export const getReauthErrorMessage = (error: unknown): string => {
  const err = normalizeError(error);
  if (err.code === "auth/invalid-login-credentials") {
    return "The current password you entered did not match our records";
  }
  if (err.code === "auth/too-many-requests") return tooManyRequestsMessage;
  return err.message;
};

export const getChangeEmailErrorMessage = (error: unknown): string =>
  normalizeError(error).code === "auth/operation-not-allowed"
    ? "Please verify the new email before changing email"
    : ERROR_MESSAGE_DEFAULT;

export const getResetPasswordErrorMessage = (error: unknown): string =>
  normalizeError(error).code === "auth/invalid-email"
    ? "Invalid email"
    : ERROR_MESSAGE_DEFAULT;
