import { normalizeError, reportError } from "./generalUtils";
import { AUTH_ERROR_MESSAGES, ERROR_MESSAGE_DEFAULT } from "../variables/constants";

const getWorkflowErrorMessage = (
  error: unknown,
  messages: Readonly<Record<string, string>>,
): string => {
  const err = normalizeError(error);
  if (err.isCustom) return err.message;
  if (err.code && Object.hasOwn(messages, err.code)) {
    return messages[err.code];
  }

  reportError(err);
  return ERROR_MESSAGE_DEFAULT;
};

export const getAuthRequestErrorMessage = (error: unknown): string =>
  getWorkflowErrorMessage(error, AUTH_ERROR_MESSAGES.request);

export const getReauthErrorMessage = (error: unknown): string =>
  getWorkflowErrorMessage(error, AUTH_ERROR_MESSAGES.reauthentication);

export const getChangeEmailErrorMessage = (error: unknown): string =>
  getWorkflowErrorMessage(error, AUTH_ERROR_MESSAGES.emailChange);

export const getResetPasswordErrorMessage = (error: unknown): string =>
  getWorkflowErrorMessage(error, AUTH_ERROR_MESSAGES.passwordReset);
