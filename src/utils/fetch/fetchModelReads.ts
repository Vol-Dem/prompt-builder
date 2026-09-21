import { doc, getFirestore, onSnapshot } from "firebase/firestore";

import firebaseApp from "../../firebase-config";
import type { ModelData } from "../../types/models.types";
import type { CivitaiModelDoc } from "../../../shared/types/firestore";
import { fetchDataFromFirestore } from "./fetchUtils";

const firestore = getFirestore(firebaseApp);

export const subscribeToUserModel = (
  uid: string,
  modelId: string,
  onModelChanged: (model: ModelData | undefined) => void,
): (() => void) =>
  onSnapshot(doc(firestore, "users", uid, "models", modelId), (snapshot) => {
    onModelChanged(snapshot.data() as ModelData | undefined);
  });

export const fetchPublicModel = (modelId: string) =>
  fetchDataFromFirestore<CivitaiModelDoc>("models", modelId);
