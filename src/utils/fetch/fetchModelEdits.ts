import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import type { ModelVersionsCustomData } from "../../../shared/types/model";

const firestore = getFirestore(firebaseApp);

/** Persists the prepared form data without normalizing its field values. */
export const saveModelVersionChanges = async (
  uid: string,
  modelId: number,
  version: number | "default",
  data: Record<string, unknown>,
  previewFields?: {
    mainTags: (string | undefined)[];
    customFileNames: string[];
  },
): Promise<void> => {
  const modelRef = doc(firestore, "users", uid, "models", modelId + "");
  const previewRef = doc(firestore, "users", uid, "preview", modelId + "");
  const versionPath = version === "default"
    ? "defaultCustomData"
    : `modelVersionsCustomData.${version}`;

  // Keep the existing model-first sequence and partial-failure behavior.
  await updateDoc(modelRef, { [versionPath]: data });
  await updateDoc(previewRef, { [versionPath]: data, ...previewFields });
};

/** Tag-set edits replace version data only in the model document. */
export const saveModelTagSets = async (
  uid: string,
  modelId: number,
  versionId: number,
  data: Record<string, unknown>,
): Promise<void> => {
  const modelRef = doc(firestore, "users", uid, "models", modelId + "");
  await updateDoc(modelRef, { [`modelVersionsCustomData.${versionId}`]: data });
};

export const saveModelVersionStatuses = async (
  uid: string,
  modelId: number,
  versions: ModelVersionsCustomData,
  previewImg: string,
): Promise<void> => {
  const modelRef = doc(firestore, "users", uid, "models", modelId + "");
  const previewRef = doc(firestore, "users", uid, "preview", modelId + "");

  await updateDoc(modelRef, { modelVersionsCustomData: versions });
  await updateDoc(previewRef, {
    imgUrl: previewImg,
    modelVersionsCustomData: versions,
  });
};
