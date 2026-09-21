import { createListenerMiddleware } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";

import firebaseApp from "../firebase-config";
import { saveGuideData } from "../utils/fetch/fetchUtils";
import type { GuideState } from "../types/guide.types";

const auth = getAuth(firebaseApp);

export const guideListener = createListenerMiddleware<{ guide: GuideState }>();

guideListener.startListening({
  predicate: (action) =>
    action.type.startsWith("guide/") &&
    !action.type.startsWith("guide/setGuideInitialState"),
  effect: (_, api) => {
    const uid = auth?.currentUser?.uid;
    if (uid) {
      // Save each completed state; the existing helper handles failures.
      void saveGuideData(api.getState().guide, uid);
    }
  },
});
