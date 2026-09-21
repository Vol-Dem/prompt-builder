import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
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
  type AuthCredential,
  type User,
} from "firebase/auth";

import firebaseApp from "../../firebase-config";
import { getReauthErrorMessage } from "../authErrors";
import { AppError } from "../generalUtils";
import { mapFirebaseUser } from "../transformUtils";
import { ERROR_MESSAGE_AUTH, ERROR_MESSAGE_DEFAULT } from "../../variables/constants";

export type ReAuthType = "pass" | "popup";

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

export const observeAuthState = (onChange: (user: User | null) => void) =>
  onAuthStateChanged(auth, onChange);

export const requireAuthUser = (): User => {
  const user = auth.currentUser;
  if (!user) throw new Error(ERROR_MESSAGE_DEFAULT);
  return user;
};

export const signInWithPassword = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(user);
};

export const registerWithPassword = async (email: string, password: string) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  return mapFirebaseUser(user);
};

export const signInWithGoogle = async () => {
  const { user } = await signInWithPopup(auth, provider);
  return mapFirebaseUser(user);
};

export const updateAuthEmail = async (email: string) => {
  const user = requireAuthUser();
  await updateEmail(user, email);
  return mapFirebaseUser(user);
};

export const updateAuthName = async (name: string) => {
  const user = requireAuthUser();
  await updateProfile(user, { displayName: name });
  return mapFirebaseUser(user);
};

// Accept the captured user so a pending workflow keeps its original target.
export const updateAuthPassword = (user: User, password: string) =>
  updatePassword(user, password);

export const sendAuthPasswordResetEmail = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const sendAuthVerificationEmail = async () => {
  if (!auth.currentUser) throw new AppError(ERROR_MESSAGE_AUTH);
  await sendEmailVerification(auth.currentUser);
};

const promptForCredentials = async (password: string): Promise<AuthCredential> => {
  try {
    if (!auth.currentUser?.email) throw new Error(ERROR_MESSAGE_DEFAULT);
    return EmailAuthProvider.credential(auth.currentUser.email, password);
  } catch (error) {
    throw new Error(getReauthErrorMessage(error));
  }
};

export const reauthenticateUser = async (type: ReAuthType, password: string) => {
  try {
    const user = requireAuthUser();
    if (type === "pass") {
      const credential = await promptForCredentials(password);
      if (!credential) throw new Error(ERROR_MESSAGE_DEFAULT);
      await reauthenticateWithCredential(user, credential);
    }
    if (type === "popup") {
      await reauthenticateWithPopup(user, provider);
    }
  } catch (error) {
    throw new Error(getReauthErrorMessage(error));
  }
};
