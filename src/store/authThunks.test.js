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
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";
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
  auth.currentUser = makeUser();
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
  ["auth/unknown", "Provider failure"],
])("preserves the %s message and clears loading after failure", async (code, message) => {
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

it("updates the password when no old password is supplied", async () => {
  const store = makeStore();
  await store.dispatch(changeUserPassword("new-password", ""));
  expect(updatePassword).toHaveBeenCalledExactlyOnceWith(auth.currentUser, "new-password");
  expect(store.getState().auth.successMessage).toBe("Password changed successfully");
});

it("finishes initial authentication when the observer reports a signed-out user", async () => {
  const store = makeStore();
  store.dispatch(initAuth());
  expect(onAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function));
  expect(store.getState().auth.initialAuth).toBe(false);
  await onAuthStateChanged.mock.calls[0][1](null);
  expect(store.getState().auth).toMatchObject({ initialAuth: true, isLoggedIn: false });
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
    isLoggedIn: false, isLoading: false, errorMessage: "Verification failed",
  });
});

it("keeps login failures from token mapping inside the auth request error flow", async () => {
  const store = makeStore();
  signInWithEmailAndPassword.mockResolvedValue({ user: auth.currentUser });
  auth.currentUser.getIdToken.mockRejectedValue(new Error("Token unavailable"));
  await store.dispatch(authRequest(true, auth.currentUser.email, "password"));
  expect(store.getState().auth).toMatchObject({
    isLoggedIn: false, isLoading: false, errorMessage: "Token unavailable",
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
  ["auth/invalid-credential", "Provider failure"],
])("preserves the reauthentication message for %s", async (code, message) => {
  reauthenticateWithPopup.mockRejectedValue(new FirebaseError(code, "Provider failure"));
  await expect(makeStore().dispatch(reAuthUser("popup", ""))).rejects.toThrow(message);
});

it("preserves credential-construction errors and skips reauthentication after failure", async () => {
  vi.spyOn(EmailAuthProvider, "credential").mockImplementation(() => {
    throw new FirebaseError("auth/invalid-login-credentials", "Provider failure");
  });
  await expect(makeStore().dispatch(reAuthUser("pass", "password")))
    .rejects.toThrow("The current password you entered did not match our records");
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
