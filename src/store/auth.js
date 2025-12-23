import { createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
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
} from "firebase/auth";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import firebaseApp from "../firebase-config";
import { uploadPanelStateFromStorage, usedModelsActions } from "./usedModels";
import { promptActions, uploadPromptFromStorage } from "./prompt";
import { tabActions } from "./tabs";
import { modelActions } from "./model";
import {
  ERROR_MESSAGE_DEFAULT,
  ERROR_MESSAGE_USER_DATA_LOAD,
} from "../variables/constants";
import { guideActions } from "./guide";
import { generalActions } from "./general";
import { imagesActions } from "./images";
import { getAppInfo } from "./notification";

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();
let unsubUserData;

const authInitialState = {
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
  categories: [],
  user: {
    idToken: "",
    refreshToken: "",
    uid: "",
    email: "",
    userName: "",
    emailVerified: false,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.user = {
        idToken: action.payload.accessToken,
        uid: action.payload.uid,
        email: action.payload.email,
        userName: action.payload.displayName,
        emailVerified: action.payload.emailVerified,
      };

      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_REC),

        // Optional argument. If true, the SDK automatically refreshes App Check
        // tokens as needed.
        isTokenAutoRefreshEnabled: true,
      });
    },
    logout(state) {
      state.isLoggedIn = false;
      state.user = Object.fromEntries(
        Object.keys(state.user).map((key) => [key, ""])
      );

      signOut(auth);

      if (unsubUserData) {
        unsubUserData();
      }
    },
    openAuthForm(state) {
      state.authFormIsOpen = true;
    },
    setInitialAuth(state, action) {
      state.initialAuth = action.payload;
    },
    closeAuthForm(state) {
      state.authFormIsOpen = false;
    },
    setReauthFormIsOpen(state, action) {
      state.reAuthFormIsOpen = action.payload;
    },
    setShowResetPassword(state, action) {
      state.showResetPassword = action.payload;
    },
    setErrorMessage(state, action) {
      state.errorMessage = action.payload;
    },
    setSuccessMessage(state, action) {
      state.successMessage = action.payload;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setUserDataIsLoading(state, action) {
      state.userDataIsLoading = action.payload;
    },
    setUserDataLoadError(state, action) {
      state.userDataLoadError = action.payload;
    },
  },
});

/**
 * Initializes initial user authentication state by listening to the authentication status.
 * When a user is authenticated, it dispatches actions to:
 * - Log the user in and store authentication details (access token, user ID, email, etc.)
 * - Retrieve and store application settings and state from session storage
 * - Fetch user data from the database
 * Finally, it sets the initial authentication state.
 * @returns
 */
export const initAuth = () => {
  return (dispatch) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          authActions.login({
            accessToken: user.accessToken,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
          })
        );
        dispatch(getAppInfo());
        dispatch(uploadPanelStateFromStorage(user.uid));
        dispatch(uploadPromptFromStorage(user.uid));
        dispatch(getUserData(user.uid));
      }
      dispatch(authActions.setInitialAuth(true));
    });
  };
};

/**
 * Makes a firebase authentication request and authorizes the user.
 * @param {boolean} isLogin - Type of request. If false, create new user. If true, authorizes the user.
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns
 */
export const authRequest = (isLogin, email, password) => {
  return async (dispatch) => {
    dispatch(authActions.setIsLoading(true));
    try {
      let userCredential = {};
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await sendEmailVerification(auth.currentUser);
      }

      const user = userCredential.user;

      dispatch(
        authActions.login({
          accessToken: user.accessToken,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        })
      );
      // dispatch(authActions.setGuide({ topPanel: false, image: false }));
      if (user.emailVerified) {
        dispatch(authActions.closeAuthForm());
      }
    } catch (error) {
      let errMessage;
      switch (error.code) {
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
          errMessage = error.message;
      }

      dispatch(authActions.setErrorMessage(errMessage));
    } finally {
      dispatch(authActions.setIsLoading(false));
    }
  };
};

/**
 * Initializes user authentication via Google sign-in and dispatches the login action with user information (access token, user ID, email, etc.)
 * @returns
 */
export const authWithGoogle = () => {
  return (dispatch, getState) => {
    // signInWithRedirect(auth, provider);
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // console.log(user);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
        dispatch(
          authActions.login({
            accessToken: user.accessToken,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
          })
        );
        dispatch(authActions.closeAuthForm());
      })
      .catch((error) => {
        // Handle Errors here.
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        dispatch(authActions.setErrorMessage(error.message));
      });
  };
};

// export const authFromRedirect = () => {
//   return async (dispatch, getState) => {
//     // const result = await getRedirectResult(auth);
//     // const user = result?.user;
//     // getRedirectResult(auth)
//     //   .then((result) => {
//     //     // This gives you a Google Access Token. You can use it to access Google APIs.
//     //     // const credential = GoogleAuthProvider.credentialFromResult(result);
//     //     // const token = credential.accessToken;

//     //     // The signed-in user info.
//     //     const user = result?.user;
//     //     console.log(user);
//     //     // IdP data available using getAdditionalUserInfo(result)
//     //     // ...
//     //     if (result?.user) {
//     //       dispatch(
//     //         authActions.login({
//     //           accessToken: user.accessToken,
//     //           uid: user.uid,
//     //           email: user.email,
//     //           displayName: user.displayName,
//     //         })
//     //       );
//     //       // dispatch(authActions.closeAuthForm());
//     //     }
//     //   })
//     //   .catch((error) => {
//     //     // Handle Errors here.
//     //     console.log(error);
//     //     console.log(error.message);
//     //     const errorCode = error.code;
//     //     const errorMessage = error.message;
//     //     // The email of the user's account used.
//     //     const email = error?.customData?.email;
//     //     // The AuthCredential type that was used.
//     //     const credential = GoogleAuthProvider.credentialFromError(error);
//     //     console.log(credential);
//     //     // ...
//     //     dispatch(authActions.setErrorMessage(error.message));
//     //   });
//   };
// };

/**
 * Changes the user's email and dispatches appropriate actions based on the result.
 * If the email change is successful, the function updates the user state and displays a success message.
 * In case of errors, the function handles different scenarios such as requiring reauthentication or verifying the new email before change.
 * @param {String} email - The new email address to update
 */
export const changeUserEmail = (email) => {
  return async (dispatch) => {
    try {
      const user = auth.currentUser;
      await updateEmail(user, email);
      dispatch(
        authActions.login({
          accessToken: user.accessToken,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        })
      );
      dispatch(authActions.setSuccessMessage("Email changed successfully"));
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        dispatch(authActions.setReauthFormIsOpen(true));
      } else if (error.code === "auth/operation-not-allowed") {
        dispatch(
          authActions.setErrorMessage(
            "Please verify the new email before changing email"
          )
        );
      } else {
        dispatch(authActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
      }
    }
  };
};

export const promptForCredentials = async (password) => {
  try {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );

    return credential;
  } catch (error) {
    if (error.code === "auth/invalid-login-credentials") {
      throw new Error(
        "The current password you entered did not match our records"
      );
    } else if (error.code === "auth/too-many-requests") {
      throw new Error(
        "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later"
      );
    } else {
      throw new Error(error.message);
    }
  }
};

export const reAuthUser = async (type, password) => {
  try {
    const user = auth.currentUser;

    if (type === "pass") {
      const credential = await promptForCredentials(password);
      await reauthenticateWithCredential(user, credential);
    }
    if (type === "popup") {
      await reauthenticateWithPopup(user, provider);
    }
  } catch (error) {
    if (error.code === "auth/invalid-login-credentials") {
      throw new Error(
        "The current password you entered did not match our records"
      );
    } else if (error.code === "auth/too-many-requests") {
      throw new Error(
        "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later"
      );
    } else {
      throw new Error(error.message);
    }
  }
};
// export const reAuthUser = (type, password) => {
//   return async (dispatch, getState) => {
//     try {
//       const user = auth.currentUser;

//       if (type === "pass") {
//         const credential = await promptForCredentials(password);
//         console.log(credential);
//         const result = await reauthenticateWithCredential(user, credential);
//       }
//       if (type === "popup") {
//         const resultPopup = await reauthenticateWithPopup(user, provider);
//       }

//       dispatch(authActions.setReauthFormIsOpen(false));
//     } catch (error) {
//       dispatch(authActions.setErrorMessage(error.message));
//       console.log(error.message);
//     }
//   };
// };

/**
 * Change user password
 * @param {string} password - User password
 * @returns
 */
export const changeUserPassword = (password, oldPassword) => {
  return async (dispatch) => {
    try {
      const user = auth.currentUser;
      if (!oldPassword) {
        await updatePassword(user, password);
      } else {
        await reAuthUser("pass", oldPassword);
        await updatePassword(user, password);
      }

      dispatch(authActions.setSuccessMessage("Password changed successfully"));
    } catch (error) {
      // if (error.code === "auth/requires-recent-login") {
      //   dispatch(authActions.setReauthFormIsOpen(true));
      // } else {
      //   dispatch(authActions.setErrorMessage(error.message));
      // }
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
    }
  };
};

export const resetUserPassword = (email) => {
  return async (dispatch) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        dispatch(authActions.setSuccessMessage("Password reset email sent!"));
      })
      .catch((error) => {
        if (error.code === "auth/invalid-email") {
          dispatch(authActions.setErrorMessage("Invalid email"));
        } else {
          dispatch(authActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
        }
        // ..
      });
    // try {
    //   const user = auth.currentUser;
    //   await updatePassword(user, password);
    // } catch (error) {
    //   dispatch(authActions.setErrorMessage(error.message));
    //   console.log(error.message);
    // }
  };
};

/**
 * Change user name
 * @param {string} name - User name
 * @returns
 */
export const changeUserName = (name) => {
  return async (dispatch) => {
    try {
      const user = auth.currentUser;
      await updateProfile(user, { displayName: name });
      dispatch(
        authActions.login({
          accessToken: user.accessToken,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        })
      );
      dispatch(authActions.setSuccessMessage("Name changed successfully"));
    } catch (error) {
      dispatch(authActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
    }
  };
};

export const getUserData = (uid) => {
  return async (dispatch, getState) => {
    try {
      dispatch(authActions.setUserDataLoadError(""));
      dispatch(authActions.setUserDataIsLoading(true));

      unsubUserData = onSnapshot(doc(firestore, "users", uid), (doc) => {
        const data = doc.data();
        if (data?.categoriesById) {
          dispatch(tabActions.setCategories(data?.categoriesById));
        }
        if (data?.imageCategories)
          dispatch(imagesActions.setImageCategories(data.imageCategories));
        if (data?.presets) dispatch(promptActions.setPresets(data.presets));
      });

      const userRef = doc(firestore, "users", uid);

      const userDataDoc = await getDoc(userRef);
      if (userDataDoc.exists()) {
        const userData = userDataDoc.data();
        if (userData?.categoriesById)
          dispatch(tabActions.setCategories(userData.categoriesById));
        if (userData?.imageCategories)
          dispatch(imagesActions.setImageCategories(userData.imageCategories));
        if (userData?.baseModels)
          dispatch(tabActions.setBaseModels(userData.baseModels));
        if (userData?.presets)
          dispatch(promptActions.setPresets(userData.presets));
        if (userData?.sfwValue)
          dispatch(generalActions.setSfwValue(userData.sfwValue));
        if (userData?.nsfwValue)
          dispatch(generalActions.setNsfwValue(userData.nsfwValue));
        if (userData?.nsfwMode) {
          dispatch(modelActions.setNsfwMode(userData.nsfwMode));
          dispatch(generalActions.setNsfwMode(userData.nsfwMode));
        }
        if (userData?.uiState) {
          dispatch(
            tabActions.setPreviewFullView(userData.uiState?.previewFullView)
          );
          dispatch(
            usedModelsActions.cardViewState(
              userData.uiState?.sidePanelCardfullView
            )
          );
        }
        if (userData?.guide && userData?.guide?.newGuide) {
          // console.log(userData.guide);
          dispatch(guideActions.setGuideInitialState(userData.guide));
        } else {
          // dispatch(authActions.setGuide({ topPanel: false, image: false }));
        }
      }
      dispatch(authActions.setUserDataIsLoading(false));
    } catch (err) {
      console.error(err.message);
      dispatch(authActions.setUserDataLoadError(ERROR_MESSAGE_USER_DATA_LOAD));
      dispatch(authActions.setUserDataIsLoading(false));
    }
  };
};

export const authActions = authSlice.actions;

export default authSlice;
