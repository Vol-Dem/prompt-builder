import { createSlice } from "@reduxjs/toolkit";
import { db } from "../firebase-config";
import { get, onValue, ref, set } from "firebase/database";

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

export const getModel = (modelId, type) => {
  return async (dispatch, getState) => {
    dispatch(modelActions.setIsLoading(true));
    const id = getState().model.curVersion;

    const modelRef = ref(db, `models/` + modelId);
    // if (type === "Checkpoint") {
    //   modelRef = ref(db, `checkpoint/` + modelId);
    // } else {
    //   ;
    // }

    onValue(modelRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      console.log("CUR", id);

      dispatch(modelActions.setModelData(data));
      console.log(id, data.id);
      // if (id !== data.id) {
      //   dispatch(modelActions.setCurVersion(data?.data?.modelVersions[0]));
      // }
      const curVersionId = data.modelVersionsCustomData?.find(
        (version) => version.downloadStatus === true
      )?.versionId;
      const curVersionData = curVersionId
        ? data.data.modelVersions.find((version) => version.id === curVersionId)
        : data.data.modelVersions[0];
      dispatch(modelActions.setModelPreview({}));
      dispatch(modelActions.setIsLoading(false));
      dispatch(modelActions.setCurVersion(curVersionData));
    });
  };
};

export const setPreviewImg = (url, isNsfw = false, type = "model") => {
  return async (dispatch, getState) => {
    console.log(url);
    const id = getState().model.model.id;
    const category = getState().model.model.main;
    console.log(id);
    let modelsPrevRef;
    if (type === "Checkpoint") {
      modelsPrevRef = ref(db, "checkpoint preview/" + category);
    } else {
      modelsPrevRef = ref(db, "models preview/" + category);
    }

    get(modelsPrevRef).then((snapshot) => {
      console.log(snapshot.val());
      if (snapshot.exists()) {
        const curData = snapshot.val();
        const curPrevIndex = curData.findIndex((prev) => prev.id === id);
        console.log(curPrevIndex);
        if (isNsfw) {
          curData[curPrevIndex].nsfwPreviewImgUrl = url;
        } else {
          curData[curPrevIndex].customPreviewImgUrl = url;
        }

        console.log(curData[curPrevIndex]);
        set(modelsPrevRef, [...curData]);
      } else {
        // set(modelsPrevRef, [loraPrevData]);
      }
    });
  };
};

export const modelActions = modelSlice.actions;

export default modelSlice;
