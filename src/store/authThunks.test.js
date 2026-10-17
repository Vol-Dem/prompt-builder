import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";

import authSlice, { authActions } from "./auth";
import { AUTH_ERROR_MESSAGES, ERROR_MESSAGE_DEFAULT } from "../variables/constants";
import { getAppInfo } from "./notification";
import { uploadPanelStateFromStorage } from "./usedModels";
import { uploadPromptFromStorage } from "./prompt";
import { fetchUserData } from "../utils/fetch/fetchUser";
import { startUserDataSubscription } from "./authSession";
import {
  authRequest,
  authWithGoogle,
  changeUserEmail,
  changeUserName,
  changeUserPassword,
  initAuth,
  reAuthUser,
  resetUserPassword,
} from "./authThunks";

const { auth } = vi.hoisted(() => ({ auth: { currentUser: null } }));
vi.mock("../firebase-config", () => ({ default: {} }));
vi.mock("firebase/auth", async (importOriginal) => ({
  ...await importOriginal(),
  getAuth: () => auth,
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  reauthenticateWithPopup: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal(),
  getFirestore: () => ({}),
}));
vi.mock("./notification", async (importOriginal) => ({
  ...await importOriginal(),
  getAppInfo: vi.fn(),
}));
vi.mock("./usedModels", async (importOriginal) => ({
  ...await importOriginal(),
  uploadPanelStateFromStorage: vi.fn(),
}));
vi.mock("./prompt", async (importOriginal) => ({
  ...await importOriginal(),
  uploadPromptFromStorage: vi.fn(),
}));
vi.mock("../utils/fetch/fetchUser", async (importOriginal) => ({
  ...await importOriginal(),
  fetchUserData: vi.fn(),
}));
vi.mock("./authSession", () => ({ startUserDataSubscription: vi.fn() }));

const makeStore = () => configureStore({ reducer: { auth: authSlice.reducer } });
const makeUser = (emailVerified = true) => ({
  uid: "user-1",
  email: "user@example.test",
  displayName: "User",
  emailVerified,
  refreshToken: "refresh-token",
  getIdToken: vi.fn().mockResolvedValue("id-token"),
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  auth.currentUser = makeUser();
  onAuthStateChanged.mockReturnValue(vi.fn());
  getAppInfo.mockReturnValue({ type: "test/appInfo" });
  uploadPanelStateFromStorage.mockReturnValue({ type: "test/sidebarRestored" });
  uploadPromptFromStorage.mockReturnValue({ type: "test/promptRestored" });
  fetchUserData.mockResolvedValue(undefined);
});
afterEach(() => vi.restoreAllMocks());

it.each([
  [true, true],
  [true, false],
  [false, false],
])("preserves login/signup and form state for isLogin=%s, verified=%s", async (isLogin, verified) => {
  const store = makeStore();
  store.dispatch(authActions.openAuthForm());
  const user = makeUser(verified);
  auth.currentUser = user;
  const request = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
  let finish;
  request.mockReturnValue(new Promise((resolve) => { finish = resolve; }));

  const pending = store.dispatch(authRequest(isLogin, user.email, "password"));
  expect(store.getState().auth.isLoading).toBe(true);
  expect(store.getState().auth.isLoggedIn).toBe(false);
  expect(request).toHaveBeenCalledExactlyOnceWith(auth, user.email, "password");
  finish({ user });
  await pending;

  expect(store.getState().auth).toMatchObject({
    isLoading: false,
    isLoggedIn: true,
    authFormIsOpen: !verified,
    user: {
      idToken: "id-token", refreshToken: "refresh-token", uid: user.uid,
      email: user.email, userName: user.displayName, emailVerified: verified,
    },
  });
  if (isLogin) expect(sendEmailVerification).not.toHaveBeenCalled();
  else expect(sendEmailVerification).toHaveBeenCalledExactlyOnceWith(user);
});

it.each([
  ["auth/invalid-login-credentials", "Invalid login credentials"],
  ["auth/invalid-credential", "Invalid login credentials"],
  ["auth/invalid-email", "Invalid email"],
  ["auth/wrong-password", "Wrong password"],
  ["auth/missing-password", "Missing password"],
  ["auth/user-not-found", "User not found"],
  ["auth/too-many-requests", "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later"],
  ["auth/email-already-in-use", "This email address is already in use"],
  ["auth/weak-password", "Password is too weak"],
  ["auth/unknown", ERROR_MESSAGE_DEFAULT],
])("maps the %s message and clears loading after failure", async (code, message) => {
  const store = makeStore();
  signInWithEmailAndPassword.mockRejectedValue(new FirebaseError(code, "Provider failure"));
  await store.dispatch(authRequest(true, "user@example.test", "password"));
  expect(store.getState().auth).toMatchObject({
    isLoading: false, isLoggedIn: false, errorMessage: message,
  });
});

it("logs in through Google and closes the auth form", async () => {
  const store = makeStore();
  store.dispatch(authActions.openAuthForm());
  signInWithPopup.mockResolvedValue({ user: auth.currentUser });
  await store.dispatch(authWithGoogle());
  expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.objectContaining({ providerId: "google.com" }));
  expect(store.getState().auth).toMatchObject({
    isLoggedIn: true, authFormIsOpen: false, user: { uid: "user-1", idToken: "id-token" },
  });
});

it.each([
  ["auth/popup-blocked", "Sign-in popup was blocked. Allow popups and try again"],
  ["auth/unknown", ERROR_MESSAGE_DEFAULT],
])("keeps Google sign-in open and uses a safe message for %s", async (code, message) => {
  const store = makeStore();
  store.dispatch(authActions.openAuthForm());
  signInWithPopup.mockRejectedValue(new FirebaseError(code, "Internal provider details"));

  await store.dispatch(authWithGoogle());

  expect(store.getState().auth).toMatchObject({
    isLoggedIn: false, authFormIsOpen: true, errorMessage: message,
  });
});

it.each([
  [changeUserEmail, "new@example.test", "Email changed successfully"],
  [changeUserName, "New name", "Name changed successfully"],
])("refreshes Redux user data after a profile update", async (change, value, message) => {
  const store = makeStore();
  updateEmail.mockImplementation(async (user, email) => { user.email = email; });
  updateProfile.mockImplementation(async (user, profile) => { Object.assign(user, profile); });
  await store.dispatch(change(value));
  expect(store.getState().auth).toMatchObject({
    successMessage: message,
    user: { email: auth.currentUser.email, userName: auth.currentUser.displayName },
  });
  if (change === changeUserEmail) expect(updateEmail).toHaveBeenCalledExactlyOnceWith(auth.currentUser, value);
  else expect(updateProfile).toHaveBeenCalledExactlyOnceWith(auth.currentUser, { displayName: value });
});

it("opens reauthentication when an email change requires a recent login", async () => {
  const store = makeStore();
  updateEmail.mockRejectedValue(new FirebaseError("auth/requires-recent-login", "Recent login required"));
  await store.dispatch(changeUserEmail("new@example.test"));
  expect(store.getState().auth).toMatchObject({ reAuthFormIsOpen: true, successMessage: "" });
});

it("sends a reset email and preserves the success message", async () => {
  const store = makeStore();
  await store.dispatch(resetUserPassword("user@example.test"));
  expect(sendPasswordResetEmail).toHaveBeenCalledExactlyOnceWith(auth, "user@example.test");
  expect(store.getState().auth.successMessage).toBe("Password reset email sent!");
});

it.each(["pass", "popup"])("executes %s reauthentication without changing Redux state", async (type) => {
  const store = makeStore();
  const before = store.getState();
  const credential = { providerId: "password" };
  vi.spyOn(EmailAuthProvider, "credential").mockReturnValue(credential);
  await store.dispatch(reAuthUser(type, "old-password"));
  if (type === "pass") {
    expect(EmailAuthProvider.credential).toHaveBeenCalledExactlyOnceWith(auth.currentUser.email, "old-password");
    expect(reauthenticateWithCredential).toHaveBeenCalledExactlyOnceWith(auth.currentUser, credential);
    expect(reauthenticateWithPopup).not.toHaveBeenCalled();
  } else {
    expect(reauthenticateWithPopup).toHaveBeenCalledWith(auth.currentUser, expect.objectContaining({ providerId: "google.com" }));
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  }
  expect(store.getState()).toBe(before);
});

it("rejects failed reauthentication with the existing password message", async () => {
  reauthenticateWithCredential.mockRejectedValue(new FirebaseError("auth/invalid-login-credentials", "Invalid credentials"));
  await expect(makeStore().dispatch(reAuthUser("pass", "wrong-password")))
    .rejects.toThrow("The current password you entered did not match our records");
});

it.each([
  ["pass", "auth/invalid-credential", "The current password you entered did not match our records"],
  ["popup", "auth/unknown", ERROR_MESSAGE_DEFAULT],
])("retains the provider code and cause after %s reauthentication fails", async (type, code, message) => {
  const original = new FirebaseError(code, "Internal provider details");
  const operation = type === "pass" ? reauthenticateWithCredential : reauthenticateWithPopup;
  operation.mockRejectedValue(original);

  const error = await makeStore().dispatch(reAuthUser(type, "password")).catch((error) => error);

  expect(error).toMatchObject({ name: "AppError", code, message, isCustom: true });
  expect(error.original).toBe(original);
  expect(error.cause).toBe(original);
  expect(console.error).toHaveBeenCalledTimes(code === "auth/unknown" ? 1 : 0);
});

it("updates the password when no old password is supplied", async () => {
  const store = makeStore();
  await store.dispatch(changeUserPassword("new-password", ""));
  expect(updatePassword).toHaveBeenCalledExactlyOnceWith(auth.currentUser, "new-password");
  expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  expect(reauthenticateWithPopup).not.toHaveBeenCalled();
  expect(store.getState().auth.successMessage).toBe("Password changed successfully");
});

it("waits for reauthentication before updating the password and reports success after the update", async () => {
  const store = makeStore();
  const user = auth.currentUser;
  const credential = { providerId: "password" };
  vi.spyOn(EmailAuthProvider, "credential").mockReturnValue(credential);
  let finishReauth;
  let finishUpdate;
  reauthenticateWithCredential.mockReturnValue(new Promise((resolve) => { finishReauth = resolve; }));
  updatePassword.mockReturnValue(new Promise((resolve) => { finishUpdate = resolve; }));

  const pending = store.dispatch(changeUserPassword("new-password", "old-password"));
  await vi.waitFor(() => expect(reauthenticateWithCredential).toHaveBeenCalledExactlyOnceWith(user, credential));
  expect(EmailAuthProvider.credential).toHaveBeenCalledExactlyOnceWith(user.email, "old-password");
  expect(updatePassword).not.toHaveBeenCalled();
  expect(store.getState().auth.successMessage).toBe("");

  finishReauth();
  await vi.waitFor(() => expect(updatePassword).toHaveBeenCalledExactlyOnceWith(user, "new-password"));
  expect(store.getState().auth.successMessage).toBe("");
  finishUpdate();
  await pending;
  expect(store.getState().auth).toMatchObject({ successMessage: "Password changed successfully", errorMessage: "" });
});

it.each([
  ["auth/invalid-login-credentials", "The current password you entered did not match our records"],
  ["auth/too-many-requests", "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later"],
])("prevents a password update when reauthentication fails with %s", async (code, message) => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const store = makeStore();
  reauthenticateWithCredential.mockRejectedValue(new FirebaseError(code, "Reauthentication failed"));

  await expect(store.dispatch(changeUserPassword("new-password", "wrong-password"))).resolves.toBeUndefined();
  expect(reauthenticateWithCredential).toHaveBeenCalledOnce();
  expect(updatePassword).not.toHaveBeenCalled();
  expect(store.getState().auth).toMatchObject({ successMessage: "", errorMessage: message });
  expect(console.error).not.toHaveBeenCalled();
});

it("handles an update failure after successful reauthentication without reporting success", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const store = makeStore();
  const error = new FirebaseError("auth/weak-password", "Password is too weak");
  reauthenticateWithCredential.mockResolvedValue({ user: auth.currentUser });
  updatePassword.mockRejectedValue(error);

  await store.dispatch(changeUserPassword("new-password", "old-password"));
  expect(reauthenticateWithCredential).toHaveBeenCalledOnce();
  expect(updatePassword).toHaveBeenCalledExactlyOnceWith(auth.currentUser, "new-password");
  expect(store.getState().auth).toMatchObject({ successMessage: "", errorMessage: ERROR_MESSAGE_DEFAULT });
  expect(console.error).toHaveBeenCalledWith(error);
});

it("finishes initial authentication when the observer reports a signed-out user", async () => {
  const store = makeStore();
  store.dispatch(initAuth());
  expect(onAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function));
  expect(store.getState().auth.initialAuth).toBe(false);
  await onAuthStateChanged.mock.calls[0][1](null);
  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: false });
});

it("maps the initial user before login, restoration, and loading user data", async () => {
  const store = makeStore();
  let finishToken;
  auth.currentUser.getIdToken.mockReturnValue(new Promise((resolve) => { finishToken = resolve; }));
  store.dispatch(initAuth());
  const pending = onAuthStateChanged.mock.calls[0][1](auth.currentUser);

  expect(store.getState().auth).toMatchObject({ initialAuth: false, isLoggedIn: false });
  expect(getAppInfo).not.toHaveBeenCalled();
  expect(fetchUserData).not.toHaveBeenCalled();
  finishToken("initial-token");
  await pending;

  expect(store.getState().auth).toMatchObject({
    initialAuth: true, isLoggedIn: true, errorMessage: "",
    user: { uid: "user-1", idToken: "initial-token", refreshToken: "refresh-token" },
  });
  expect(getAppInfo).toHaveBeenCalledOnce();
  expect(uploadPanelStateFromStorage).toHaveBeenCalledOnce();
  expect(uploadPromptFromStorage).toHaveBeenCalledOnce();
  expect(startUserDataSubscription).toHaveBeenCalledExactlyOnceWith("user-1", expect.any(Function), expect.any(Function));
  expect(fetchUserData).toHaveBeenCalledExactlyOnceWith("user-1");
  expect(uploadPanelStateFromStorage.mock.invocationCallOrder[0]).toBeLessThan(uploadPromptFromStorage.mock.invocationCallOrder[0]);
  expect(uploadPromptFromStorage.mock.invocationCallOrder[0]).toBeLessThan(fetchUserData.mock.invocationCallOrder[0]);
});

it.each([
  { code: "auth/network-request-failed", message: AUTH_ERROR_MESSAGES.request["auth/network-request-failed"] },
  { code: "auth/unknown", message: ERROR_MESSAGE_DEFAULT },
])("finishes initialization with safe feedback when token mapping fails with $code", async ({ code, message }) => {
  const store = makeStore();
  const original = new FirebaseError(code, "Internal provider details");
  auth.currentUser.getIdToken.mockRejectedValue(original);
  store.dispatch(initAuth());

  await expect(onAuthStateChanged.mock.calls[0][1](auth.currentUser)).resolves.toBeUndefined();

  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: false, errorMessage: message });
  expect(getAppInfo).not.toHaveBeenCalled();
  expect(fetchUserData).not.toHaveBeenCalled();
  if (code === "auth/unknown") expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
});

it("handles a later successful auth event through the same observer after an initialization failure", async () => {
  const store = makeStore();
  auth.currentUser.getIdToken.mockRejectedValueOnce(new Error("Token unavailable"));
  store.dispatch(initAuth());
  const onChange = onAuthStateChanged.mock.calls[0][1];
  await onChange(auth.currentUser);
  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: false });

  await onChange(auth.currentUser);

  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: true, user: { uid: "user-1" } });
  expect(onAuthStateChanged).toHaveBeenCalledOnce();
  expect(fetchUserData).toHaveBeenCalledExactlyOnceWith("user-1");
});

it("finishes initialization when synchronous restoration fails after login", async () => {
  const store = makeStore();
  const original = new Error("Restoration failed");
  uploadPanelStateFromStorage.mockImplementationOnce(() => { throw original; });
  store.dispatch(initAuth());

  await expect(onAuthStateChanged.mock.calls[0][1](auth.currentUser)).resolves.toBeUndefined();

  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: true, errorMessage: ERROR_MESSAGE_DEFAULT });
  expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
});

it("settles a synchronous observer registration failure and returns a safe cleanup", () => {
  const store = makeStore();
  const original = new Error("Observer registration failed");
  onAuthStateChanged.mockImplementationOnce(() => { throw original; });

  const stop = store.dispatch(initAuth());

  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: false, errorMessage: ERROR_MESSAGE_DEFAULT });
  expect(console.error).toHaveBeenCalledExactlyOnceWith(original);
  expect(stop).toBeTypeOf("function");
  expect(() => { stop(); stop(); }).not.toThrow();
});

it("unsubscribes once and ignores callbacks queued after cleanup", async () => {
  const store = makeStore();
  const unsubscribe = vi.fn();
  onAuthStateChanged.mockReturnValue(unsubscribe);
  const stop = store.dispatch(initAuth());
  const before = store.getState();

  stop();
  stop();
  await onAuthStateChanged.mock.calls[0][1](auth.currentUser);

  expect(unsubscribe).toHaveBeenCalledOnce();
  expect(auth.currentUser.getIdToken).not.toHaveBeenCalled();
  expect(store.getState()).toBe(before);
});

it.each(["success", "failure"])("ignores a token %s that settles after cleanup", async (outcome) => {
  const store = makeStore();
  let resolveToken;
  let rejectToken;
  auth.currentUser.getIdToken.mockReturnValue(new Promise((resolve, reject) => {
    resolveToken = resolve;
    rejectToken = reject;
  }));
  const stop = store.dispatch(initAuth());
  const pending = onAuthStateChanged.mock.calls[0][1](auth.currentUser);
  const before = store.getState();
  stop();

  if (outcome === "success") resolveToken("stale-token");
  else rejectToken(new Error("Stale token failure"));
  await expect(pending).resolves.toBeUndefined();

  expect(store.getState()).toBe(before);
  expect(getAppInfo).not.toHaveBeenCalled();
  expect(fetchUserData).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it("does not log in a pending user after a newer signed-out event", async () => {
  const store = makeStore();
  let finishToken;
  auth.currentUser.getIdToken.mockReturnValue(new Promise((resolve) => { finishToken = resolve; }));
  store.dispatch(initAuth());
  const onChange = onAuthStateChanged.mock.calls[0][1];
  const pending = onChange(auth.currentUser);
  await onChange(null);
  finishToken("stale-token");
  await pending;

  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: false, user: { uid: "" } });
  expect(fetchUserData).not.toHaveBeenCalled();
});

it.each(["success", "failure"])("ignores an older user's token %s after a newer user initializes", async (outcome) => {
  const store = makeStore();
  let resolveToken;
  let rejectToken;
  const oldUser = auth.currentUser;
  oldUser.getIdToken.mockReturnValue(new Promise((resolve, reject) => {
    resolveToken = resolve;
    rejectToken = reject;
  }));
  const newUser = { ...makeUser(), uid: "user-2" };
  store.dispatch(initAuth());
  const onChange = onAuthStateChanged.mock.calls[0][1];
  const pending = onChange(oldUser);
  await onChange(newUser);

  if (outcome === "success") resolveToken("stale-token");
  else rejectToken(new Error("Stale token failure"));
  await pending;

  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: true, errorMessage: "", user: { uid: "user-2" } });
  expect(fetchUserData).toHaveBeenCalledExactlyOnceWith("user-2");
  expect(console.error).not.toHaveBeenCalled();
});

it("waits for signup verification before mapping and logging in the user", async () => {
  const store = makeStore();
  const user = auth.currentUser;
  createUserWithEmailAndPassword.mockResolvedValue({ user });
  let finish;
  sendEmailVerification.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
  const pending = store.dispatch(authRequest(false, user.email, "password"));
  await vi.waitFor(() => expect(sendEmailVerification).toHaveBeenCalledOnce());
  expect(user.getIdToken).not.toHaveBeenCalled();
  expect(store.getState().auth).toMatchObject({ isLoading: true, isLoggedIn: false });
  finish();
  await pending;
  expect(user.getIdToken).toHaveBeenCalledOnce();
  expect(store.getState().auth).toMatchObject({ isLoading: false, isLoggedIn: true });
});

it("still maps the signup result when Firebase has no current user to verify", async () => {
  const store = makeStore();
  const user = makeUser(false);
  auth.currentUser = null;
  createUserWithEmailAndPassword.mockResolvedValue({ user });
  await store.dispatch(authRequest(false, user.email, "password"));
  expect(sendEmailVerification).not.toHaveBeenCalled();
  expect(store.getState().auth).toMatchObject({ isLoggedIn: true, user: { uid: user.uid } });
});

it("keeps signup logged out when verification fails", async () => {
  const store = makeStore();
  createUserWithEmailAndPassword.mockResolvedValue({ user: auth.currentUser });
  sendEmailVerification.mockRejectedValue(new Error("Verification failed"));
  await store.dispatch(authRequest(false, auth.currentUser.email, "password"));
  expect(auth.currentUser.getIdToken).not.toHaveBeenCalled();
  expect(store.getState().auth).toMatchObject({
    isLoggedIn: false, isLoading: false, errorMessage: ERROR_MESSAGE_DEFAULT,
  });
});

it("keeps login failures from token mapping inside the auth request error flow", async () => {
  const store = makeStore();
  signInWithEmailAndPassword.mockResolvedValue({ user: auth.currentUser });
  auth.currentUser.getIdToken.mockRejectedValue(new Error("Token unavailable"));
  await store.dispatch(authRequest(true, auth.currentUser.email, "password"));
  expect(store.getState().auth).toMatchObject({
    isLoggedIn: false, isLoading: false, errorMessage: ERROR_MESSAGE_DEFAULT,
  });
});

it.each([
  ["auth/operation-not-allowed", "Please verify the new email before changing email"],
  ["auth/unknown", ERROR_MESSAGE_DEFAULT],
])("preserves the email update message for %s", async (code, message) => {
  const store = makeStore();
  updateEmail.mockRejectedValue(new FirebaseError(code, "Provider failure"));
  await store.dispatch(changeUserEmail("new@example.test"));
  expect(store.getState().auth).toMatchObject({
    errorMessage: message, successMessage: "", reAuthFormIsOpen: false,
  });
});

it.each([
  ["auth/invalid-email", "Invalid email"],
  ["auth/unknown", ERROR_MESSAGE_DEFAULT],
])("preserves the password reset message for %s", async (code, message) => {
  const store = makeStore();
  sendPasswordResetEmail.mockRejectedValue(new FirebaseError(code, "Provider failure"));
  await store.dispatch(resetUserPassword("user@example.test"));
  expect(store.getState().auth).toMatchObject({ errorMessage: message, successMessage: "" });
});

it.each([
  ["auth/too-many-requests", "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later"],
  ["auth/invalid-credential", "The current password you entered did not match our records"],
  ["auth/unknown", ERROR_MESSAGE_DEFAULT],
])("maps the reauthentication message for %s", async (code, message) => {
  reauthenticateWithPopup.mockRejectedValue(new FirebaseError(code, "Provider failure"));
  await expect(makeStore().dispatch(reAuthUser("popup", ""))).rejects.toThrow(message);
});

it("preserves credential-construction errors and skips reauthentication after failure", async () => {
  const original = new FirebaseError("auth/invalid-login-credentials", "Provider failure");
  vi.spyOn(EmailAuthProvider, "credential").mockImplementation(() => {
    throw original;
  });
  const error = await makeStore().dispatch(reAuthUser("pass", "password")).catch((error) => error);
  expect(error.message).toBe("The current password you entered did not match our records");
  expect(error.code).toBe(original.code);
  expect(error.original).toBe(original);
  expect(error.cause).toBe(original);
  expect(reauthenticateWithCredential).not.toHaveBeenCalled();
});

it.each([
  [changeUserEmail, updateEmail, "new@example.test"],
  [changeUserName, updateProfile, "New name"],
  [changeUserPassword, updatePassword, "password"],
])("guards profile mutations when Firebase has no current user", async (change, operation, value) => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  auth.currentUser = null;
  const store = makeStore();
  await store.dispatch(change(value, ""));
  expect(operation).not.toHaveBeenCalled();
  expect(store.getState().auth).toMatchObject({ errorMessage: ERROR_MESSAGE_DEFAULT, successMessage: "" });
});
