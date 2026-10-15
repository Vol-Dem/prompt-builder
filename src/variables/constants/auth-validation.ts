import type { ValidationTypes } from "../../types/general.types";
import {
  VALIDATION_EMAIL_MAX_LENGTH,
  VALIDATION_PASSWORD_MAX_LENGTH,
  VALIDATION_USERNAME_MAX_LENGTH,
} from "./validation.js";

const emailRules = {
  required: true,
  email: true,
  maxLength: VALIDATION_EMAIL_MAX_LENGTH,
};
const newPasswordRules = { required: true, password: true };

/** Workflow-specific policies consumed by authentication inputs. */
export const AUTH_VALIDATION = {
  login: {
    email: { ...emailRules, disableErrorOnBlur: true },
    password: { required: true, password: false, disableErrorOnBlur: true },
  },
  signup: {
    email: { ...emailRules, disableErrorOnBlur: false },
    password: { ...newPasswordRules, disableErrorOnBlur: false },
  },
  reauthentication: {
    password: { required: true, maxLength: VALIDATION_PASSWORD_MAX_LENGTH },
  },
  reset: { email: emailRules },
  profile: {
    name: {
      disableErrorOnBlur: true,
      required: true,
      maxLength: VALIDATION_USERNAME_MAX_LENGTH,
    },
    email: emailRules,
    currentPassword: { disableErrorOnBlur: true },
    newPassword: {
      ...newPasswordRules,
      maxLength: VALIDATION_PASSWORD_MAX_LENGTH,
      disableErrorOnBlur: true,
    },
  },
} satisfies Record<string, Record<string, ValidationTypes>>;
