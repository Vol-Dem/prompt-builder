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
 * Saved post/image IDs live in model.savedImages. Consumers use the derived
 * selectModelSavedImages wrapper to mark saved Civitai posts/images.
 * @property {Array<Object>} modelPreview - List of model previews.
 * @property {boolean} isLoading - Model loading state.
 * @property {string} errorMessage - Model error message.
 * @property {Object} curVersion - Active model version data.
 * @property {Object} activeCarouselData - Active carousel data.
 */
const initialModelState: ModelsState = {
  model: null,
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
     * Replaces model data, including its canonical saved-image IDs.
     */
    setModelData(state, action: PayloadAction<ModelData | null>) {
      state.model = action.payload;
    },
    updateModelDataField(state, action: PayloadAction<Partial<ModelData>>) {
      if (!state.model) return;
      if (action.payload.id && action.payload.id !== state.model.id) {
        delete state.model.savedImages;
      }
      Object.assign(state.model, action.payload);
    },
    setSavedImages(state, action: PayloadAction<ModelSavedImagesData>) {
      if (state.model && state.model.id === action.payload.modelId) {
        state.model.savedImages = action.payload.data;
      }
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

      if (!state.model || !modelId || !versionId || state.model.id !== modelId) return;

      const savedImages = (state.model.savedImages ??= {});
      const posts = (savedImages[versionId] ??= []);
      const existedPostIndex = posts.findIndex((post) => post.postId === postId);
      if (existedPostIndex !== -1) {
        posts[existedPostIndex] = action.payload.data;
      } else {
        posts.push(action.payload.data);
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

      const posts = state.model?.savedImages?.[versionId];
      if (posts) {
        const existedPostIndex = posts.findIndex(
          (post) => post.postId === postId,
        );
        if (existedPostIndex !== -1) {
          posts.splice(existedPostIndex, 1);
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
