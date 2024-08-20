import { createSlice } from "@reduxjs/toolkit";
import { transformImageData } from "../utils/generalUtils";
import { updateImagePostData } from "../utils/fetchUtils";

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    queue: [],
    rejected: [],
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
  },
});

export const savePost = (postInfo) => {
  return async (dispatch, getState) => {
    try {
      const { postId, modelId, versionId, nsfwMode, images } = postInfo;

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
        data = { items: images };
      }

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

      await updateImagePostData(postInfo, examplesDataWithRes);

      dispatch(uploadActions.setCurPostId(null));
      dispatch(uploadActions.removeFromQueue({ postId, versionId }));
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
    }
  };
};

export const uploadActions = uploadSlice.actions;

export default uploadSlice;
