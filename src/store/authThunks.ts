import type { Unsubscribe } from "firebase/auth";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";

import firebaseApp from "../firebase-config";
import { uploadPanelStateFromStorage, usedModelsActions } from "./usedModels";
import { promptActions, uploadPromptFromStorage } from "./prompt";
import { tabActions } from "./tabs";
import { ERROR_MESSAGE_USER_DATA_LOAD } from "../variables/constants";
import { guideActions } from "./guide";
import { generalActions } from "./general";
import { imagesActions } from "./images";
import { getAppInfo } from "./notification";
import { handleErrors, normalizeError } from "../utils/generalUtils";
import { authActions } from "./auth";
import type { AppThunk } from "./store";
import type { UserDoc } from "../../shared/types/firestore";
import { mapFirebaseUser } from "../utils/transformUtils";
import {
  getAuthRequestErrorMessage,
  getChangeEmailErrorMessage,
  getResetPasswordErrorMessage,
} from "../utils/authErrors";
import {
  observeAuthState,
  reauthenticateUser,
  registerWithPassword,
  requireAuthUser,
  sendAuthPasswordResetEmail,
  signInWithGoogle,
  signInWithPassword,
  updateAuthEmail,
  updateAuthName,
  updateAuthPassword,
  type ReAuthType,
} from "../utils/fetch/fetchAuth";

const firestore = getFirestore(firebaseApp);
export let unsubUserData: Unsubscribe | null = null;

/**
 * Initializes initial user authentication state by listening to the authentication status.
 * When a user is authenticated, it dispatches actions to:
 * - Log the user in and store authentication details (access token, user ID, email, etc.)
 * - Retrieve and store application settings and state from session storage
 * - Fetch user data from the database
 * Finally, it sets the initial authentication state.
 * @returns Redux thunk.
 */
export const initAuth = (): AppThunk => {
  return (dispatch) => {
    observeAuthState(async (user) => {
      if (user) {
        dispatch(authActions.login(await mapFirebaseUser(user)));
        dispatch(getAppInfo());
        dispatch(uploadPanelStateFromStorage());
        dispatch(uploadPromptFromStorage());
        dispatch(getUserData(user.uid));
      }
      dispatch(authActions.setInitialAuth(true));
    });
  };
};

/**
 * Makes a firebase authentication request and authorizes the user.
 * @param isLogin - Type of request. If false, create new user. If true, authorizes the user.
 * @param email - User email
 * @param password - User password
 * @returns Redux thunk.
 */
export const authRequest = (
  isLogin: boolean,
  email: string,
  password: string,
): AppThunk => {
  return async (dispatch) => {
    dispatch(authActions.setIsLoading(true));
    try {
      const user = isLogin
        ? await signInWithPassword(email, password)
        : await registerWithPassword(email, password);
      dispatch(authActions.login(user));

      if (user.emailVerified) {
        dispatch(authActions.closeAuthForm());
      }
    } catch (error) {
      dispatch(authActions.setErrorMessage(getAuthRequestErrorMessage(error)));
    } finally {
      dispatch(authActions.setIsLoading(false));
    }
  };
};

/**
 * Initializes user authentication via Google sign-in and dispatches the login action with user information (access token, user ID, email, etc.)
 * @returns Redux thunk.
 */
export const authWithGoogle = (): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(authActions.login(await signInWithGoogle()));
      dispatch(authActions.closeAuthForm());
    } catch (error) {
      const errorMeassage = handleErrors(normalizeError(error));
      dispatch(authActions.setErrorMessage(errorMeassage));
    }
  };
};

/**
 * Changes the user's email and dispatches appropriate actions based on the result.
 * If the email change is successful, the function updates the user state and displays a success message.
 * In case of errors, the function handles different scenarios such as requiring reauthentication or verifying the new email before change.
 * @param email - The new email address to update
 * @returns Redux thunk.
 */
export const changeUserEmail = (email: string): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(authActions.login(await updateAuthEmail(email)));
      dispatch(authActions.setSuccessMessage("Email changed successfully"));
    } catch (error) {
      const err = normalizeError(error);

      if (err.code === "auth/requires-recent-login") {
        dispatch(authActions.setReauthFormIsOpen(true));
      } else {
        dispatch(authActions.setErrorMessage(getChangeEmailErrorMessage(err)));
      }
    }
  };
};

export const reAuthUser = (type: ReAuthType, password: string): AppThunk => {
  return async () => {
    await reauthenticateUser(type, password);
  };
};

/**
 * Changes user password.
 *
 * @param password - User password
 * @param oldPassword - Old user password
 * @returns Redux thunk.
 */
export const changeUserPassword = (
  password: string,
  oldPassword: string,
): AppThunk => {
  return async (dispatch) => {
    try {
      const user = requireAuthUser();

      if (!oldPassword) {
        await updateAuthPassword(user, password);
      } else {
        await reAuthUser("pass", oldPassword);
        await updateAuthPassword(user, password);
      }

      dispatch(authActions.setSuccessMessage("Password changed successfully"));
    } catch (error) {
      const err = normalizeError(error);
      dispatch(authActions.setErrorMessage(handleErrors(err)));
    }
  };
};

/**
 * Sends a password reset email to the given email address.
 *
 * @param email - User email.
 * @returns Redux thunk.
 */
export const resetUserPassword = (email: string): AppThunk => {
  return async (dispatch) => {
    try {
      await sendAuthPasswordResetEmail(email);

      dispatch(authActions.setSuccessMessage("Password reset email sent!"));
    } catch (error) {
      dispatch(authActions.setErrorMessage(getResetPasswordErrorMessage(error)));
    }
  };
};

/**
 * Changes the current user name.
 * Updates a user's profile data.
 *
 * @param name - User name.
 * @returns Redux thunk.
 */
export const changeUserName = (name: string): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(authActions.login(await updateAuthName(name)));
      dispatch(authActions.setSuccessMessage("Name changed successfully"));
    } catch (error) {
      const errorMeassage = handleErrors(normalizeError(error));
      dispatch(authActions.setErrorMessage(errorMeassage));
    }
  };
};

/**
 * Fetches the current user data.
 * Creates a listener for the current user data.
 *
 * @param uid - User ID.
 * @returns Redux thunk.
 */
export const getUserData = (uid: string): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(authActions.setUserDataLoadError(""));
      dispatch(authActions.setUserDataIsLoading(true));

      unsubUserData = onSnapshot(doc(firestore, "users", uid), (doc) => {
        const data = doc.data() as UserDoc;
        if (data?.categoriesById) {
          dispatch(tabActions.setCategories(data.categoriesById));
        }
        if (data?.imageCategories)
          dispatch(imagesActions.setImageCategories(data.imageCategories));
        if (data?.presets) dispatch(promptActions.setPresets(data.presets));
        if (data?.baseModels)
          dispatch(tabActions.setBaseModels(data.baseModels));
      });

      const userRef = doc(firestore, "users", uid);

      const userDataDoc = await getDoc(userRef);
      if (userDataDoc.exists()) {
        const userData = userDataDoc.data();

        if (userData?.sfwValue)
          dispatch(generalActions.setSfwValue(userData.sfwValue));
        if (userData?.nsfwValue)
          dispatch(generalActions.setNsfwValue(userData.nsfwValue));
        if (userData?.nsfwMode) {
          dispatch(generalActions.setNsfwMode(userData.nsfwMode));
        }
        if (userData?.uiState) {
          dispatch(
            tabActions.setPreviewFullView(userData.uiState?.previewFullView),
          );
          dispatch(
            usedModelsActions.cardViewState(
              userData.uiState?.sidePanelCardfullView,
            ),
          );
        }

        if (userData?.guide) {
          dispatch(guideActions.setGuideInitialState(userData.guide));
        }
        if (userData?.tester) {
          dispatch(authActions.setTester(userData.tester));
        }
      }
      dispatch(authActions.setUserDataIsLoading(false));
    } catch (error) {
      handleErrors(normalizeError(error));
      dispatch(authActions.setUserDataLoadError(ERROR_MESSAGE_USER_DATA_LOAD));
      dispatch(authActions.setUserDataIsLoading(false));
    }
  };
};
