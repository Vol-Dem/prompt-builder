import { createSlice } from "@reduxjs/toolkit";
import { db } from "../firebase-config";
import { get, onValue, ref, set } from "firebase/database";
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
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
      console.log(actions.payload);
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

export const getModel = (modelId) => {
  return async (dispatch, getState) => {
    dispatch(modelActions.setIsLoading(true));
    const uid = getState().auth.user.uid;

    // const modelRef = doc(firestore, "users", uid, "models", modelId);
    // const modelSnap = await getDoc(modelRef);

    const unsub = onSnapshot(
      doc(firestore, "users", uid, "models", modelId),
      (doc) => {
        const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source);
        const data = doc.data();
        console.log(data);
        if (!data) return;
        dispatch(modelActions.setModelData(data));

        // const curVersionId = Object.values(data?.modelVersionsCustomData).find(
        //   (version) => version.downloadStatus === true
        // )?.versionId;
        const curVersionId = data.data.modelVersions.find(
          (version) =>
            data?.modelVersionsCustomData.hasOwnProperty(version.id) &&
            data?.modelVersionsCustomData[version.id].downloadStatus
        )?.versionId;
        const curVersionData = curVersionId
          ? data.data.modelVersions.find(
              (version) => version.id === curVersionId
            )
          : data.data.modelVersions[0];
        dispatch(modelActions.setModelPreview({}));
        dispatch(modelActions.setIsLoading(false));
        dispatch(modelActions.setCurVersion(curVersionData));
      }
    );

    // if (modelSnap.exists()) {
    //   const data = modelSnap.data();
    //   console.log(data);

    //   dispatch(modelActions.setModelData(data));

    //   const curVersionId = data.modelVersionsCustomData?.find(
    //     (version) => version.downloadStatus === true
    //   )?.versionId;
    //   const curVersionData = curVersionId
    //     ? data.data.modelVersions.find((version) => version.id === curVersionId)
    //     : data.data.modelVersions[0];
    //   dispatch(modelActions.setModelPreview({}));
    //   dispatch(modelActions.setIsLoading(false));
    //   dispatch(modelActions.setCurVersion(curVersionData));
    // }

    // const modelRef = ref(db, `models/` + modelId);

    // onValue(modelRef, (snapshot) => {
    //   const data = snapshot.val();
    //   console.log(data);
    //   console.log("CUR", id);

    //   dispatch(modelActions.setModelData(data));
    //   console.log(id, data.id);
    //   const curVersionId = data.modelVersionsCustomData?.find(
    //     (version) => version.downloadStatus === true
    //   )?.versionId;
    //   const curVersionData = curVersionId
    //     ? data.data.modelVersions.find((version) => version.id === curVersionId)
    //     : data.data.modelVersions[0];
    //   dispatch(modelActions.setModelPreview({}));
    //   dispatch(modelActions.setIsLoading(false));
    //   dispatch(modelActions.setCurVersion(curVersionData));
    // });
  };
};

export const setPreviewImg = (url, isNsfw = false, type = "model") => {
  return async (dispatch, getState) => {
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

    console.log(url);
    console.log(modelType);
    console.log(id);
    console.log(type);
    // const id = getState().model.model.id;
    // const category = getState().model.model.main;
    // console.log(id);
    // let modelsPrevRef;
    // if (type === "Checkpoint") {
    //   modelsPrevRef = ref(db, "checkpoint preview/" + category);
    // } else {
    //   modelsPrevRef = ref(db, "models preview/" + category);
    // }

    // get(modelsPrevRef).then((snapshot) => {
    //   console.log(snapshot.val());
    //   if (snapshot.exists()) {
    //     const curData = snapshot.val();
    //     const curPrevIndex = curData.findIndex((prev) => prev.id === id);
    //     console.log(curPrevIndex);
    //     if (isNsfw) {
    //       curData[curPrevIndex].nsfwPreviewImgUrl = url;
    //     } else {
    //       curData[curPrevIndex].customPreviewImgUrl = url;
    //     }

    //     console.log(curData[curPrevIndex]);
    //     set(modelsPrevRef, [...curData]);
    //   } else {
    //     // set(modelsPrevRef, [loraPrevData]);
    //   }
    // });
  };
};

export const modelActions = modelSlice.actions;

export default modelSlice;
