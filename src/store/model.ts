import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ActiveCarousel,
  ModelData,
  ModelSavedImagesData,
  ModelsState,
  UpdateSavedImagesData,
} from "../types/models.types";
import type { ModelPreviewDoc } from "../../shared/types/firestore";
import type { ModelVersion } from "../../shared/types/model";

/**
 * Model settings state.
 *
 * Controls:
 * - Model preview list
 * - Model data
 * - Model version data
 * - Model saved images data
 * - Opened carousel data
 *
 * State:
 * @property {object} model - Model data.
 * @property {{modelId: number | null, data: Object}} savedImages - Saved post/image IDs for the active model.
 * Map of model version → saved posts and image IDs, used to mark which Civitai posts/images
 * are already saved for the active model.
 * @property {Array<Object>} modelPreview - List of model previews.
 * @property {boolean} isLoading - Model loading state.
 * @property {string} errorMessage - Model error message.
 * @property {Object} curVersion - Active model version data.
 * @property {Object} activeCarouselData - Active carousel data.
 */
const initialModelState: ModelsState = {
  model: null,
  savedImages: null,
  modelPreview: [],
  isLoading: true,
  errorMessage: "",
  curVersion: null,
  activeCarouselData: null,
};

const modelSlice = createSlice({
  name: "model",
  initialState: initialModelState,
  reducers: {
    /**
     * Sets and merges model data.
     * Also sets or resets `savedImages` depending on whether the model contains saved images.
     */
    setModelData(state, action: PayloadAction<ModelData | null>) {
      state.model = action.payload;

      if (action?.payload?.savedImages) {
        state.savedImages = {
          modelId: action.payload.id || null,
          data: action?.payload?.savedImages,
        };
      } else if (action?.payload?.id && !action?.payload?.savedImages) {
        state.savedImages = null;
      }
    },
    updateModelDataField(state, action: PayloadAction<Partial<ModelData>>) {
      if (state.model) Object.assign(state.model, action.payload);

      if (action?.payload?.savedImages) {
        state.savedImages = {
          modelId: action.payload.id || null,
          data: action?.payload?.savedImages,
        };
      } else if (action?.payload?.id && !action?.payload?.savedImages) {
        state.savedImages = null;
      }
    },
    setSavedImages(state, action: PayloadAction<ModelSavedImagesData>) {
      state.savedImages = action.payload;
    },
    /**
     * Updates or adds saved images for a post.
     *
     * @param {{
     *   data: Object,
     *   postInfo: { versionId: number, postId: number, modelId: number }
     * }} action.payload
     */
    updateSavedImages(state, action: PayloadAction<UpdateSavedImagesData>) {
      const { versionId, postId, modelId } = action.payload.postInfo;

      if (!modelId || !versionId || state.model?.id !== modelId) return;

      if (
        state?.savedImages?.data &&
        Object.hasOwn(state.savedImages.data, `${versionId}`)
      ) {
        const existedPostIndex = state.savedImages.data[versionId].findIndex(
          (post) => post.postId === postId,
        );
        if (existedPostIndex !== -1) {
          const updatedSavedImages = [...state.savedImages.data[versionId]];
          updatedSavedImages[existedPostIndex] = action.payload.data;

          state.savedImages.data[versionId] = updatedSavedImages;
        } else {
          const updatedSavedImages = [
            ...state.savedImages.data[versionId],
            action.payload.data,
          ];
          state.savedImages.data[versionId] = updatedSavedImages;
        }
      } else {
        const updatedSavedImages = [action.payload.data];
        state.savedImages = {
          modelId: modelId,
          data: {
            ...state.savedImages?.data,
            [`${versionId}`]: updatedSavedImages,
          },
        };
      }
    },
    /**
     * Deletes savedImages entry.
     * @param {{
     *   data: Object,
     *   postInfo: { versionId: number, postId: number, modelId: number }
     * }} action.payload
     */
    deleteSavedImages(state, action) {
      const { versionId, postId, modelId } = action.payload.postInfo;

      if (state.model?.id !== modelId) return;

      if (
        state?.savedImages?.data &&
        Object.hasOwn(state.savedImages.data, `${versionId}`)
      ) {
        const existedPostIndex = state.savedImages.data[versionId].findIndex(
          (post) => post.postId === postId,
        );
        if (existedPostIndex !== -1) {
          state.savedImages.data[versionId].splice(existedPostIndex, 1);
        }
      }
    },
    resetModelData(state) {
      state.model = null;
      state.modelPreview = [];
      state.errorMessage = "";
      state.curVersion = null;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setCurVersion(state, action: PayloadAction<ModelVersion | null>) {
      state.curVersion = action.payload;
    },
    setModelPreview(state, action: PayloadAction<ModelPreviewDoc[]>) {
      state.modelPreview = action.payload;
    },
    setErrorMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
    },
    setActiveCarouselData(state, action: PayloadAction<ActiveCarousel | null>) {
      state.activeCarouselData = action.payload;
    },
  },
});

export const modelActions = modelSlice.actions;

export default modelSlice;
