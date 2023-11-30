import { createSlice } from "@reduxjs/toolkit";
import { db } from "../firebase-config";
import { get, onValue, ref, set } from "firebase/database";

const initialModelState = {
  model: [],
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
    setNsfwMode(state, actions) {
      state.nsfwMode = actions.payload;
    },
  },
});

export const getModel = (modelId, type) => {
  return async (dispatch, getSate) => {
    dispatch(modelActions.setIsLoading(true));

    let modelRef;
    if (type === "Checkpoint") {
      modelRef = ref(db, `checkpoint/` + modelId);
    } else {
      modelRef = ref(db, `models/` + modelId);
    }

    onValue(modelRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);

      dispatch(modelActions.setModelData(data));
      dispatch(modelActions.setCurVersion(data?.data?.modelVersions[0]));
      dispatch(modelActions.setIsLoading(false));
    });
  };
};

export const setPreviewImg = (url, isNsfw = false) => {
  return async (dispatch, getState) => {
    console.log(url);
    const id = getState().model.model.id;
    const category = getState().model.model.main;
    console.log(id);
    const modelsPrevRef = ref(db, "models preview/" + category);
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
