import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthState, LoginPayload } from "../types/auth.types";

const authInitialState: AuthState = {
  isLoggedIn: false,
  initialAuth: false,
  authFormIsOpen: false,
  reAuthFormIsOpen: false,
  showResetPassword: false,
  isLoading: false,
  userDataIsLoading: false,
  userDataLoadError: "",
  errorMessage: "",
  successMessage: "",
  tester: false,
  user: {
    idToken: "",
    refreshToken: "",
    uid: "",
    email: null,
    userName: null,
    emailVerified: false,
  },
};

/**
 * Auth state.
 *
 * Controls:
 * - Authentication
 *
 * State:
 * @property isLoggedIn - Whether user is logged in.
 * @property initialAuth - Whether initial authentication was finished.
 * @property authFormIsOpen - Whether auth form is shown.
 * @property reAuthFormIsOpen - Whether re-auth form is shown.
 * @property showResetPassword - Whether reset password form is shown.
 * @property isLoading - Auth request loading state.
 * @property userDataIsLoading - User data loading state.
 * @property userDataLoadError - User data error message.
 * @property errorMessage - Forms error message.
 * @property successMessage - Success message.
 * @property user - User data.
 */
const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    /**
     * Signs in a user.
     */
    login(state, action: PayloadAction<LoginPayload>) {
      state.isLoggedIn = true;
      state.user = {
        idToken: action.payload.accessToken,
        uid: action.payload.uid,
        email: action.payload.email,
        userName: action.payload.displayName,
        emailVerified: action.payload.emailVerified,
        refreshToken: action.payload.refreshToken,
      };
    },
    /**
     * Signs out the current user.
     */
    logout(state) {
      state.isLoggedIn = false;
      state.user = {
        idToken: "",
        refreshToken: "",
        uid: "",
        email: "",
        userName: "",
        emailVerified: false,
      };
    },
    openAuthForm(state) {
      state.authFormIsOpen = true;
    },
    setInitialAuth(state, action: PayloadAction<boolean>) {
      state.initialAuth = action.payload;
    },
    closeAuthForm(state) {
      state.authFormIsOpen = false;
    },
    setReauthFormIsOpen(state, action: PayloadAction<boolean>) {
      state.reAuthFormIsOpen = action.payload;
    },
    setShowResetPassword(state, action: PayloadAction<boolean>) {
      state.showResetPassword = action.payload;
    },
    setErrorMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
    },
    setSuccessMessage(state, action: PayloadAction<string>) {
      state.successMessage = action.payload;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setUserDataIsLoading(state, action: PayloadAction<boolean>) {
      state.userDataIsLoading = action.payload;
    },
    setUserDataLoadError(state, action: PayloadAction<string>) {
      state.userDataLoadError = action.payload;
    },
    setTester(state, action: PayloadAction<boolean>) {
      state.tester = action.payload;
    },
  },
});

export const authActions = authSlice.actions;

export default authSlice;
