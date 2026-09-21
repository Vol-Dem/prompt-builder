import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

import firebaseApp from "../../firebase-config";
import type { Preset, Presets } from "../../../shared/types/user";
import type { PromptType } from "../../types/prompt.types";

const firestore = getFirestore(firebaseApp);

export const saveUserNsfwMode = (uid: string, nsfwMode: boolean) =>
  updateDoc(doc(firestore, "users", uid), { nsfwMode });

export const saveUserNsfwValues = (
  uid: string,
  sfwValue: string,
  nsfwValue: string,
) => updateDoc(doc(firestore, "users", uid), { sfwValue, nsfwValue });

export const saveUserPreviewFullView = (uid: string, isFullView: boolean) =>
  updateDoc(doc(firestore, "users", uid), {
    "uiState.previewFullView": isFullView,
  });

export const saveUserSidePanelFullView = (uid: string, isFullView: boolean) =>
  updateDoc(doc(firestore, "users", uid), {
    "uiState.sidePanelCardfullView": isFullView,
  });

export const saveUserPresets = (
  uid: string,
  presetType: PromptType,
  presets: Preset[],
) => updateDoc(doc(firestore, "users", uid), {
  [`presets.${presetType}`]: presets,
});

export const fetchUserPresets = async (uid: string): Promise<Presets | undefined> => {
  const snapshot = await getDoc(doc(firestore, "users", uid));
  return snapshot.exists() ? snapshot.data()?.presets : undefined;
};
