import { createSlice } from "@reduxjs/toolkit";
import {
  filterDuplicates,
  handleErrors,
  throwCustomError,
  transformImageData,
} from "../utils/generalUtils";
import { updateImagePostData } from "../utils/fetchUtils";
import { modelActions } from "./model";
import { savePostToCollections } from "./images";
import { ERROR_MESSAGE_INVALID_POST_ID } from "../variables/constants";

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    queue: [],
    rejected: [],
    completed: [],
    completedAmount: 0,
    curPostId: null,
    isUploading: false,
  },
  reducers: {
    addToQueue(state, actions) {
      state.queue.push(actions.payload);
    },
    removeFromQueue(state, actions) {
      const newQueue = state.queue.filter((item) => {
        return item.postId !== actions.payload.postId;
      });

      state.queue = [...newQueue];
    },
    setCurPostId(state, actions) {
      state.curPostId = actions.payload;
    },
    addToRejected(state, actions) {
      const itemExists = state.rejected.find(
        (item) => item.postId === actions.payload.postId
      );
      if (!itemExists) {
        state.rejected.push(actions.payload);
      }
    },
    addToCompleted(state, actions) {
      state.completedAmount = state.completedAmount + 1;
      state.completed = [actions.payload, ...state.completed].slice(0, 10);
    },
    setIsUploading(state, actions) {
      state.isUploading = actions.payload;
    },
    retryUploadingAll(state, actions) {
      state.queue = [...state.queue, ...state.rejected];
      state.rejected = [];
    },
    clearRejected(state, actions) {
      state.rejected = [];
    },
    clearCompleted(state, actions) {
      state.completed = [];
      state.completedAmount = 0;
    },
  },
});

export const savePost = (postInfo) => {
  return async (dispatch, getState) => {
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
      // console.log(location);
      // console.log(postInfo);
      if (!postId) {
        throwCustomError(ERROR_MESSAGE_INVALID_POST_ID);
      }

      dispatch(uploadActions.setIsUploading(true));
      dispatch(uploadActions.setCurPostId(postId));

      let data = { items: [] };

      if (!images?.length) {
        const imgExampleResponse = await fetch(
          `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}${
            nsfwMode ? `&nsfw=X` : `&nsfw=None`
          }`
        );

        data = await imgExampleResponse.json();
      } else {
        data = { items: filterDuplicates(images, "id") };
      }

      // console.log(images);
      // console.log(data);
      if (!data?.items?.length) {
        throw new Error("0 items");
      }

      const examplesDataWithRes = data.items
        .filter((image) =>
          !!postInfo?.ids?.length ? postInfo.ids.includes(image?.id) : true
        )
        .sort((a, b) => {
          return b.createdAt - a.createdAt;
        })
        .map((imageData) => {
          return transformImageData(imageData);
        });

      const newPostData = await updateImagePostData(
        postInfo,
        examplesDataWithRes
      );

      if (location === "collections") {
        const imageIds = data.items.map((image) => image.id);
        await dispatch(
          savePostToCollections({
            ...collectionData,
            imageIds,
            postId,
            postData,
            images: data.items,
          })
        );
      }

      if (location === "models") {
        dispatch(
          modelActions.updateSavedImages({ postInfo, data: newPostData })
        );
      }

      dispatch(uploadActions.setCurPostId(null));
      dispatch(uploadActions.removeFromQueue({ postId, versionId }));
      dispatch(uploadActions.addToCompleted(postInfo));
      dispatch(uploadActions.setIsUploading(false));
    } catch (err) {
      dispatch(uploadActions.addToRejected(postInfo));
      dispatch(
        uploadActions.removeFromQueue({
          postId: postInfo.postId,
          versionId: postInfo.versionId,
        })
      );
      dispatch(uploadActions.setCurPostId(null));
      dispatch(uploadActions.setIsUploading(false));
      console.error(err.message);
      throw new Error(err);
      // handleErrors(err);
    }
  };
};

export const uploadActions = uploadSlice.actions;

export default uploadSlice;
