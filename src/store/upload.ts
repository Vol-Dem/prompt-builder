import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  filterDuplicates,
  normalizeError,
  throwCustomError,
} from "../utils/generalUtils";
import { modelActions } from "./model";
import { savePostToCollections } from "./images";
import {
  ERROR_MESSAGE_INVALID_POST_ID,
  SETTINGS_UPLOADING_COMPLETED_AMOUNT,
} from "../variables/constants";
import { updateImagePostData } from "../utils/fetch/fetchImages";
import { transformImageData } from "../../shared/utils";
import type { UploadingItem, UploadState } from "../types/upload.types";
import type { AppThunk } from "./store";
import type { Image } from "../../shared/types/image";
// import { transformImageData } from "../utils/transformUtils";

/**
 * Upload state.
 *
 * Controls:
 * - Uploading
 *
 * State:
 * @property {Array<Object>} queue - List of posts being uploaded.
 * @property {Array<Object>} rejected - List of rejected posts.
 * @property {Array<Object>} completed - List of the last completed posts.
 * @property {number} completedAmount - Total number of uploaded posts.
 * @property {number|null} curPostId - Post ID of the currently uploading post.
 * @property {boolean} isUploading - Whether uploading is in progress.
 */
const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    queue: [],
    rejected: [],
    completed: [],
    completedAmount: 0,
    curPostId: null,
    isUploading: false,
  } as UploadState,
  reducers: {
    addToQueue(state, action: PayloadAction<UploadingItem>) {
      state.queue.push(action.payload);
    },
    /**
     * Removes post from uploading queue.
     */
    removeFromQueue(
      state,
      action: PayloadAction<{ postId: number; versionId: number }>,
    ) {
      const newQueue = state.queue.filter((item) => {
        return item.postId !== action.payload.postId;
      });

      state.queue = [...newQueue];
    },
    setCurPostId(state, action: PayloadAction<number | null>) {
      state.curPostId = action.payload;
    },
    /**
     * Adds post to rejected list.
     */
    addToRejected(state, action: PayloadAction<UploadingItem>) {
      const itemExists = state.rejected.find(
        (item) => item.postId === action.payload.postId,
      );
      if (!itemExists) {
        state.rejected.push(action.payload);
      }
    },
    /**
     * Adds post to completed list.
     * Increases completedAmount.
     * Sets last 10 posts.
     */
    addToCompleted(state, action: PayloadAction<UploadingItem>) {
      state.completedAmount = state.completedAmount + 1;
      state.completed = [action.payload, ...state.completed].slice(
        0,
        SETTINGS_UPLOADING_COMPLETED_AMOUNT,
      );
    },
    setIsUploading(state, action: PayloadAction<boolean>) {
      state.isUploading = action.payload;
    },
    /**
     * Retries uploading of all rejected posts.
     */
    retryUploadingAll(state) {
      state.queue = [...state.queue, ...state.rejected];
      state.rejected = [];
    },
    clearRejected(state) {
      state.rejected = [];
    },
    clearCompleted(state) {
      state.completed = [];
      state.completedAmount = 0;
    },
  },
});

/**
 * Saves an image post.
 *
 * Side effects:
 * - Fetches post images if no images are provided.
 * - Saves the post to Firestore.
 * - Adds or updates a post in a collection if location is "collections".
 * - Updates saved images if location is "models".
 *
 * @param {Object} postInfo - Post information.
 * @param {number} postInfo.modelId - Model ID.
 * @param {number} postInfo.postId - Post ID.
 * @param {number} postInfo.versionId - Model version ID.
 * @param {boolean} postInfo.nsfwMode - Whether NSFW mode is enabled.
 * @param {Array<Object>} [postInfo.images] - Optional list of images. If omitted, images are fetched from the API.
 * @param {Array<number>} [postInfo.ids] - Optional list of image IDs to include.
 * @param {'models'|'collections'} postInfo.location - Where the post should be saved.
 * @param {Object} [postInfo.collectionData] - Collection data (required when location is "collections").
 * @param {Object} postInfo.postData - Post metadata.
 *
 * @returns {Function} Redux thunk.
 */
export const savePost = (postInfo: UploadingItem): AppThunk => {
  return async (dispatch) => {
    try {
      const {
        modelId,
        postId,
        versionId,
        nsfwMode,
        images,
        location,
        collectionData,
        postData,
      } = postInfo;
      if (!postId) {
        throwCustomError(ERROR_MESSAGE_INVALID_POST_ID);
      }

      dispatch(uploadActions.setIsUploading(true));
      dispatch(uploadActions.setCurPostId(postId));

      let data: { items: Image[] } = { items: [] };

      if (!images?.length) {
        const imgExampleResponse = await fetch(
          `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}${
            nsfwMode ? `&nsfw=X` : `&nsfw=None`
          }`,
        );
        data = await imgExampleResponse.json();
      } else {
        data = { items: filterDuplicates(images, "id") };
      }

      if (!data?.items?.length) {
        throw new Error("0 items");
      }

      const examplesDataWithRes = data.items
        .filter((image) =>
          postInfo?.ids?.length ? postInfo.ids.includes(image?.id) : true,
        )
        .sort((a, b) => {
          return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        })
        .map((imageData) => {
          return transformImageData(imageData);
        });

      const newPostData = await updateImagePostData(
        postInfo,
        examplesDataWithRes,
      );

      if (location === "collections" && collectionData) {
        const imageIds = data.items.map((image) => image.id);
        await dispatch(
          savePostToCollections({
            ...collectionData,
            imageIds,
            postId,
            postData,
            images: data.items,
          }),
        );
      }

      if (location === "models") {
        dispatch(
          modelActions.updateSavedImages({ postInfo, data: newPostData }),
        );
      }

      dispatch(uploadActions.setCurPostId(null));
      dispatch(uploadActions.removeFromQueue({ postId, versionId }));
      dispatch(uploadActions.addToCompleted(postInfo));
      dispatch(uploadActions.setIsUploading(false));
    } catch (error) {
      dispatch(uploadActions.addToRejected(postInfo));
      dispatch(
        uploadActions.removeFromQueue({
          postId: postInfo.postId,
          versionId: postInfo.versionId,
        }),
      );
      dispatch(uploadActions.setCurPostId(null));
      dispatch(uploadActions.setIsUploading(false));

      throw normalizeError(error);
    }
  };
};

export const uploadActions = uploadSlice.actions;

export default uploadSlice;
