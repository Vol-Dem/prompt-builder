import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  updateEmail,
  reauthenticateWithPopup,
  EmailAuthProvider,
  type Unsubscribe,
  type UserCredential,
  AuthCredential,
} from "firebase/auth";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";

import firebaseApp from "../firebase-config";
import { uploadPanelStateFromStorage, usedModelsActions } from "./usedModels";
import { promptActions, uploadPromptFromStorage } from "./prompt";
import { tabActions } from "./tabs";
import {
  ERROR_MESSAGE_DEFAULT,
  ERROR_MESSAGE_USER_DATA_LOAD,
} from "../variables/constants";
import { guideActions } from "./guide";
import { generalActions } from "./general";
import { imagesActions } from "./images";
import { getAppInfo } from "./notification";
import { handleErrors, normalizeError } from "../utils/generalUtils";
import { authActions } from "./auth";
import type { AppThunk } from "./store";
import type { UserDoc } from "../../shared/types/firestore";

type ReAuthType = "pass" | "popup";

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();
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
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch(
          authActions.login({
            accessToken: await user.getIdToken(),
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            refreshToken: user.refreshToken,
          }),
        );
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
      let userCredential: UserCredential;

      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        if (auth.currentUser) await sendEmailVerification(auth.currentUser);
      }

      const user = userCredential.user;

      dispatch(
        authActions.login({
          accessToken: await user.getIdToken(),
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          refreshToken: user.refreshToken,
        }),
      );

      if (user.emailVerified) {
        dispatch(authActions.closeAuthForm());
      }
    } catch (error) {
      const err = normalizeError(error);
      let errMessage;
      switch (err.code) {
        case "auth/invalid-login-credentials":
          errMessage = "Invalid login credentials";
          break;
        case "auth/invalid-credential":
          errMessage = "Invalid login credentials";
          break;
        case "auth/invalid-email":
          errMessage = "Invalid email";
          break;
        case "auth/wrong-password":
          errMessage = "Wrong password";
          break;
        case "auth/missing-password":
          errMessage = "Missing password";
          break;
        case "auth/user-not-found":
          errMessage = "User not found";
          break;
        case "auth/too-many-requests":
          errMessage =
            "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later";
          break;
        default:
          errMessage = err.message;
      }

      dispatch(authActions.setErrorMessage(errMessage));
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
      const userCredential = await signInWithPopup(auth, provider);

      const user = userCredential.user;

      dispatch(
        authActions.login({
          accessToken: await user.getIdToken(),
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          refreshToken: user.refreshToken,
        }),
      );
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
      const user = auth.currentUser;

      if (!user) throw new Error(ERROR_MESSAGE_DEFAULT);

      await updateEmail(user, email);

      dispatch(
        authActions.login({
          accessToken: await user.getIdToken(),
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          refreshToken: user.refreshToken,
        }),
      );
      dispatch(authActions.setSuccessMessage("Email changed successfully"));
    } catch (error) {
      const err = normalizeError(error);

      if (err.code === "auth/requires-recent-login") {
        dispatch(authActions.setReauthFormIsOpen(true));
      } else if (err.code === "auth/operation-not-allowed") {
        dispatch(
          authActions.setErrorMessage(
            "Please verify the new email before changing email",
          ),
        );
      } else {
        dispatch(authActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
      }
    }
  };
};

export const promptForCredentials = async (
  password: string,
): Promise<AuthCredential> => {
  try {
    if (!auth.currentUser?.email) throw new Error(ERROR_MESSAGE_DEFAULT);

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password,
    );

    return credential;
  } catch (error) {
    const err = normalizeError(error);
    if (err.code === "auth/invalid-login-credentials") {
      throw new Error(
        "The current password you entered did not match our records",
      );
    } else if (err.code === "auth/too-many-requests") {
      throw new Error(
        "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later",
      );
    } else {
      throw new Error(err.message);
    }
  }
};

export const reAuthUser = (type: ReAuthType, password: string): AppThunk => {
  return async () => {
    try {
      const user = auth.currentUser;

      if (!user) throw new Error(ERROR_MESSAGE_DEFAULT);

      if (type === "pass") {
        const credential = await promptForCredentials(password);

        if (!credential) throw new Error(ERROR_MESSAGE_DEFAULT);

        await reauthenticateWithCredential(user, credential);
      }
      if (type === "popup") {
        await reauthenticateWithPopup(user, provider);
      }
    } catch (error) {
      const err = normalizeError(error);

      if (err.code === "auth/invalid-login-credentials") {
        throw new Error(
          "The current password you entered did not match our records",
        );
      } else if (err.code === "auth/too-many-requests") {
        throw new Error(
          "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later",
        );
      } else {
        throw new Error(err.message);
      }
    }
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
      const user = auth.currentUser;

      if (!user) throw new Error(ERROR_MESSAGE_DEFAULT);

      if (!oldPassword) {
        await updatePassword(user, password);
      } else {
        await reAuthUser("pass", oldPassword);
        await updatePassword(user, password);
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
      await sendPasswordResetEmail(auth, email);

      dispatch(authActions.setSuccessMessage("Password reset email sent!"));
    } catch (error) {
      const err = normalizeError(error);

      if (err.code === "auth/invalid-email") {
        dispatch(authActions.setErrorMessage("Invalid email"));
      } else {
        dispatch(authActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
      }
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
      const user = auth.currentUser;

      if (!user) throw new Error(ERROR_MESSAGE_DEFAULT);

      await updateProfile(user, { displayName: name });

      dispatch(
        authActions.login({
          accessToken: await user.getIdToken(),
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          refreshToken: user.refreshToken,
        }),
      );
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
