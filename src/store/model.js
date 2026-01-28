import { createSlice } from "@reduxjs/toolkit";
import {
  arrayRemove,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import firebaseApp from "../firebase-config";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";
import { authActions } from "./auth";
import { deleteImagePostDocs } from "../utils/fetch/fetchImages";
import { makeBatchRequest } from "../utils/fetch/fetchUtils";

const firestore = getFirestore(firebaseApp);

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
const initialModelState = {
  model: {},
  savedImages: {
    modelId: null,
    data: {},
  },
  modelPreview: [],
  isLoading: true,
  errorMessage: "",
  curVersion: {},
  activeCarouselData: {},
};

const modelSlice = createSlice({
  name: "model",
  initialState: initialModelState,
  reducers: {
    /**
     * Sets and merges model data.
     * Also sets or resets `savedImages` depending on whether the model contains saved images.
     */
    setModelData(state, action) {
      state.model = { ...state.model, ...action.payload };

      if (action?.payload?.savedImages) {
        state.savedImages = {
          modelId: action.payload.id,
          data: action?.payload?.savedImages,
        };
      } else if (action?.payload?.id && !action?.payload?.savedImages) {
        state.savedImages = { modelId: null, data: {} };
      }
    },
    setSavedImages(state, action) {
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
    updateSavedImages(state, action) {
      const { versionId, postId, modelId } = action.payload.postInfo;

      if (state.model.id !== modelId) return;

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
            ...state.savedImages.data,
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

      if (state.model.id !== modelId) return;

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
      state.model = {};
      state.modelPreview = [];
      state.errorMessage = "";
      state.curVersion = {};
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setCurVersion(state, action) {
      state.curVersion = action.payload;
    },
    setModelPreview(state, action) {
      state.modelPreview = action.payload;
    },
    setErrorMessage(state, action) {
      state.errorMessage = action.payload;
    },
    setActiveCarouselData(state, action) {
      state.activeCarouselData = action.payload;
    },
  },
  extraReducers: (builder) => {
    /**
     * Resets model state on logout.
     *
     * Listens to the logout action and clears model-related state.
     */
    builder.addCase(authActions.logout, (state, action) => {
      modelSlice.caseReducers.resetModelData(state, action);
      state.activeCarouselData = {};
    });
  },
});

/**
 * Sets preview image for model or collection preview.
 *
 * Side effects:
 * - Sets SFW or NSFW preview image for model or collection preview.
 * - Updates preview data in Firestore
 *
 * @param {string} url - Image URL.
 * @param {boolean} [isNsfw=false] - Whether to set NSFW or SFW preview.
 * @param {'models' | 'collections'} location - Corresponding Firestore collection ("models" or "collections").
 * @param {number} locationId - Corresponding Firestore document ID.
 * @param {'image' | 'video'} [type='image'] - Src type.
 * @returns {Function} Redux thunk.
 */
export const setPreviewImg = (
  url,
  isNsfw = false,
  location,
  locationId,
  type = "image",
) => {
  return async (_, getState) => {
    try {
      const uid = getState().auth.user.uid;

      if (!url || !location || !locationId) {
        throw new Error(ERROR_MESSAGE_DEFAULT);
      }

      const urlField = isNsfw ? "nsfwPreviewImgUrl" : "customPreviewImgUrl";
      const typeField = isNsfw ? "nsfwPreviewImgType" : "customPreviewImgType";

      const dbCollectionName =
        location === "models" ? "preview" : "collectionPreviews";

      const locationPrevRef = doc(
        firestore,
        "users",
        uid,
        dbCollectionName,
        locationId + "",
      );

      await setDoc(
        locationPrevRef,
        {
          [`${urlField}`]: url,
          [`${typeField}`]: type,
        },
        { merge: true },
      );
    } catch (err) {
      console.log(err);
    }
  };
};

/**
 * Sets preview image for tag set.
 *
 * Side effects:
 * - Sets preview image for tag set.
 * - Updates tag sets data in Firestore
 * - Updates model state in Redux
 *
 * @param {number} versionId - Model version ID.
 * @param {object} tagSetData - Tag set data.
 * @returns {Function} Redux thunk.
 */
export const setTagSetPreviewImg = (versionId, tagSetData) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const id = getState().model.model.id;
    const model = getState().model.model;

    const urlField =
      versionId === "tsv-def"
        ? `defaultCustomData.tagSetsData`
        : `modelVersionsCustomData.${versionId}.tagSetsData`;

    const modelRef = doc(firestore, "users", uid, "models", id + "");
    await updateDoc(
      modelRef,
      {
        [`${urlField}`]: tagSetData,
      },
      { merge: true },
    );

    if (versionId === "tsv-def") {
      const updatedDefaultCustomData = {
        ...model.defaultCustomData,
        tagSetsData: tagSetData,
      };
      dispatch(
        modelActions.setModelData({
          defaultCustomData: updatedDefaultCustomData,
        }),
      );
    } else {
      const updatedVersionsCustomData = {
        ...model.modelVersionsCustomData,
        [versionId]: {
          ...model.modelVersionsCustomData[versionId],
          tagSetsData: tagSetData,
        },
      };
      dispatch(
        modelActions.setModelData({
          modelVersionsCustomData: updatedVersionsCustomData,
        }),
      );
    }
  };
};

/**
 * Deletes a saved post.
 *
 * Side effects:
 * - Removes the version ID from the post's version list in Firestore
 * - Deletes the post document if no versions remain
 * - Updates saved images in Redux
 *
 * @param {{ versionId: number, postId: number, modelId: number }} postInfo - Post info.
 * @param {object} postData - Post data.
 * @returns {Function} Redux thunk.
 */
export const deleteImgPost = (postInfo, postData) => {
  return async (dispatch, getState) => {
    try {
      const { versionId, postId } = postInfo;
      const uid = getState().auth.user.uid;
      const id = getState().model.model.id;
      const modelRef = doc(firestore, "users", uid, "models", id + "");

      const imgPostRef = doc(firestore, "users", uid, "images", postId + "");

      const docSnap = await getDoc(imgPostRef);

      if (docSnap.exists()) {
        const postVersions = docSnap.data()?.versionsId;

        if (postVersions?.length === 1) {
          await deleteDoc(imgPostRef);
        } else {
          await updateDoc(imgPostRef, {
            versionsId: arrayRemove(versionId),
          });
        }
      }

      await updateDoc(modelRef, {
        [`savedImages.${versionId}`]: arrayRemove(postData),
      });
      dispatch(modelActions.deleteSavedImages({ postInfo, data: postData }));
    } catch (err) {
      console.error(err.message);
    }
  };
};

/**
 * Deletes a model.
 *
 * Side effects:
 * - Deletes the model and its preview from Firestore
 * - Deletes all image posts saved for this model
 *
 * @returns {Function} Redux thunk.
 */
export const deleteModel = () => {
  return async (_, getState) => {
    const uid = getState().auth.user.uid;
    const model = getState().model.model;

    Object.values(model.savedImages).forEach(async (versionData) => {
      const postsData = versionData.map((post) => {
        return {
          ...post,
          uid,
          modelId: model.id,
        };
      });

      await makeBatchRequest(postsData, deleteImagePostDocs, 5, false);
    });

    const modelRef = doc(firestore, "users", uid, "models", model.id + "");
    const modelPreviewRef = doc(
      firestore,
      "users",
      uid,
      "preview",
      model.id + "",
    );

    await deleteDoc(modelRef);
    await deleteDoc(modelPreviewRef);
  };
};

/**
 * Updates model categories.
 *
 * Side effects:
 * - Saves model categories to Firestore
 *
 * @param {string} modelType - Model type (lora, checkpoint, etc.).
 * @param {Array<Object>} updatedCat - Updated category list.
 * @returns {Function} Redux thunk.
 */
export const updateCategories = (modelType, updatedCat) => {
  return async (_, getState) => {
    const uid = getState().auth.user.uid;
    if (uid) {
      const userRef = doc(firestore, "users", uid);
      const categoryField = `categoriesById.${modelType}`;

      await updateDoc(
        userRef,
        {
          [categoryField]: updatedCat,
        },
        { merge: true },
      );
    }
  };
};

export const modelActions = modelSlice.actions;

export default modelSlice;
