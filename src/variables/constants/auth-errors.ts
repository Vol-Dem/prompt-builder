const CONNECTION_ERROR_MESSAGE =
  "Unable to connect. Check your connection and try again";
const TOO_MANY_REQUESTS_MESSAGE =
  "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later";
const CURRENT_PASSWORD_ERROR_MESSAGE =
  "The current password you entered did not match our records";

const commonMessages = {
  "auth/network-request-failed": CONNECTION_ERROR_MESSAGE,
  "auth/user-disabled": "This account has been disabled",
};
const popupMessages = {
  "auth/popup-blocked": "Sign-in popup was blocked. Allow popups and try again",
  "auth/popup-closed-by-user": "Sign-in was cancelled",
};

/** Provider messages are selected by code and authentication workflow. */
export const AUTH_ERROR_MESSAGES = {
  request: {
    ...commonMessages,
    ...popupMessages,
    "auth/invalid-login-credentials": "Invalid login credentials",
    "auth/invalid-credential": "Invalid login credentials",
    "auth/invalid-email": "Invalid email",
    "auth/wrong-password": "Wrong password",
    "auth/missing-password": "Missing password",
    "auth/user-not-found": "User not found",
    "auth/too-many-requests": TOO_MANY_REQUESTS_MESSAGE,
    "auth/email-already-in-use": "This email address is already in use",
    "auth/weak-password": "Password is too weak",
  },
  reauthentication: {
    ...commonMessages,
    ...popupMessages,
    "auth/invalid-login-credentials": CURRENT_PASSWORD_ERROR_MESSAGE,
    "auth/invalid-credential": CURRENT_PASSWORD_ERROR_MESSAGE,
    "auth/wrong-password": CURRENT_PASSWORD_ERROR_MESSAGE,
    "auth/too-many-requests": TOO_MANY_REQUESTS_MESSAGE,
  },
  emailChange: {
    ...commonMessages,
    "auth/operation-not-allowed": "Please verify the new email before changing email",
    "auth/invalid-email": "Invalid email",
    "auth/email-already-in-use": "This email address is already in use",
  },
  passwordReset: {
    ...commonMessages,
    "auth/invalid-email": "Invalid email",
  },
} satisfies Record<string, Record<string, string>>;
