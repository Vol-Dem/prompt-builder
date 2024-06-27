import { createSlice } from "@reduxjs/toolkit";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getFirestore,
  writeBatch,
} from "firebase/firestore";
import {
  addDelayPromise,
  clearObjectKeys,
  transformImageData,
} from "../utils/generalUtils";
import {
  getImagesInfo,
  makeBatchRequest,
  updateImagePostData,
} from "../utils/fetchUtils";
import firebaseApp from "../firebase-config";

const firestore = getFirestore(firebaseApp);

const delayTime = 1000;

// const myPromise = new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("foo");
//     }, 300);
//   });

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
      const { postId, modelId, versionId, nsfwMode, postData } = postInfo;

      dispatch(uploadActions.setIsUploading(true));
      dispatch(uploadActions.setCurPostId(postId));

      const imgExampleResponse = await fetch(
        `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}${
          nsfwMode ? `&nsfw=X` : `&nsfw=None`
        }`
      );

      const data = await imgExampleResponse.json();
      console.log(data);
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
      // const uid = getState().auth.user.uid;
      // const imgExampleResponse = await fetch(
      //   `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}${
      //     nsfwMode ? `&nsfw=X` : `&nsfw=None`
      //   }`
      // );

      // const data = await imgExampleResponse.json();
      // console.log(data);
      // if (!data.items.length) {
      //   throw new Error("0 items");
      // }

      // const examplesDataWithRes = data.items
      //   .filter((image) =>
      //     !!postInfo?.ids?.length ? postInfo.ids.includes(image?.id) : true
      //   )
      //   .sort((a, b) => {
      //     return b.createdAt - a.createdAt;
      //   })
      //   .map((imageData) => {
      //     return transformImageData(imageData);
      //   });

      // console.log(postInfo?.ids);
      // console.log(examplesDataWithRes);
      // // examplesDataWithRes.versionId = versionId;

      // const modelRef = doc(firestore, "users", uid, "models", modelId + "");
      // const modelImagesRef = doc(
      //   firestore,
      //   "users",
      //   uid,
      //   "models",
      //   modelId + "",
      //   "images",
      //   postId + ""
      // );

      // const newImgData = {
      //   postId: +postId,
      //   amount: examplesDataWithRes.length,
      // };
      // console.log("LENGTH");
      // console.log(examplesDataWithRes.length);

      // await addDelayPromise(delayTime);

      // const batch = writeBatch(firestore);

      // const nsfw = [...new Set(examplesDataWithRes.map((image) => image.nsfw))];

      // batch.set(
      //   modelImagesRef,
      //   {
      //     items: examplesDataWithRes,
      //     versionId,
      //     default: false,
      //     createdAt: examplesDataWithRes[0].createdAt,
      //     savedAt: new Date().toISOString(),
      //     nsfw: examplesDataWithRes[0].nsfw,
      //     nsfwTypes: nsfw,
      //     nsfwLevel: examplesDataWithRes[0]?.nsfwLevel || "",
      //   },
      //   { merge: true }
      // );

      // if (postData) {
      //   batch.update(modelRef, {
      //     [`savedImages.${versionId}`]: arrayRemove(postData),
      //   });
      // }

      // batch.set(
      //   modelRef,
      //   {
      //     savedImages: {
      //       [`${versionId}`]: arrayUnion(newImgData),
      //     },
      //   },
      //   { merge: true }
      // );

      // // Commit the batch
      // await batch.commit();

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
      console.log(err.message);
      console.log(err);
    }
  };
};

export const uploadActions = uploadSlice.actions;

export default uploadSlice;
