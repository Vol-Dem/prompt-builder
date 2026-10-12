import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "./store";
import type { ModelSavedImagesData } from "../types/models.types";

/** Expose the saved-image view without storing a second writable ID map. */
export const selectModelSavedImages = createSelector(
  [
    (state: RootState) => state.model.model?.id || null,
    (state: RootState) => state.model.model?.savedImages,
  ],
  (modelId, data): ModelSavedImagesData | null => data ? { modelId, data } : null,
);
