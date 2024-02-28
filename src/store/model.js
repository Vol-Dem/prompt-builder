import { createSlice } from "@reduxjs/toolkit";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import firebaseApp from "../firebase-config";

const firestore = getFirestore(firebaseApp);

const initialModelState = {
  model: {},
  modelPreview: [],
  isLoading: true,
  curVersion: {},
  curExampleImgsType: "saved",
  examplesPage: 1,
  examplesImages: [],
  nsfwMode: false,
};

const modelSlice = createSlice({
  name: "model",
  initialState: initialModelState,
  reducers: {
    setModelData(state, actions) {
      state.model = actions.payload;
    },
    setIsLoading(state, actions) {
      state.isLoading = actions.payload;
    },
    setCurVersion(state, actions) {
      state.curVersion = actions.payload;
    },
    setModelPreview(state, actions) {
      state.modelPreview = actions.payload;
    },
    setNsfwMode(state, actions) {
      state.nsfwMode = actions.payload;
    },
  },
});

// export const getModel = (modelId) => {
//   return async (dispatch, getState) => {
//     dispatch(modelActions.setIsLoading(true));
//     const uid = getState().auth.user.uid;

//     const unsub = onSnapshot(
//       doc(firestore, "users", uid, "models", modelId),
//       (doc) => {
//         const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
//         console.log(source);
//         const data = doc.data();
//         console.log(data);
//         if (!data) return;
//         dispatch(modelActions.setModelData(data));

//         const curVersionId = data.data.modelVersions.find(
//           (version) =>
//             data?.modelVersionsCustomData.hasOwnProperty(version.id) &&
//             data.modelVersionsCustomData[version.id].downloadStatus
//         )?.id;
//         const curVersionData = curVersionId
//           ? data.data.modelVersions.find(
//               (version) => version.id === curVersionId
//             )
//           : data.data.modelVersions[0];
//         dispatch(modelActions.setModelPreview({}));
//         dispatch(modelActions.setIsLoading(false));
//         dispatch(modelActions.setCurVersion(curVersionData));
//       }
//     );
//   };
// };

export const setPreviewImg = (url, isNsfw = false, type = "model") => {
  return async (__, getState) => {
    const uid = getState().auth.user.uid;
    const id = getState().model.model.id;
    const modelType =
      type === "Checkpoint" ? "checkpoints preview" : "models preview";
    const urlField = isNsfw ? "nsfwPreviewImgUrl" : "customPreviewImgUrl";

    const modelsPrevRef = doc(firestore, "users", uid, modelType, id + "");
    await setDoc(
      modelsPrevRef,
      {
        [`${urlField}`]: url,
      },
      { merge: true }
    );
  };
};

export const modelActions = modelSlice.actions;

export default modelSlice;
