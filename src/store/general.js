import { createSlice } from "@reduxjs/toolkit";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../firebase-config";
import { modelActions } from "./model";

const firestore = getFirestore(firebaseApp);

const generalSlice = createSlice({
  name: "general",
  initialState: {
    isMobile: false,
    headerIsFixed: false,
    nsfwMode: false,
    nsfwLevel: "None",
    sfwValue: "None",
    nsfwValue: "X",
  },
  reducers: {
    setIsMobile(state, actions) {
      state.isMobile = actions.payload;
    },
    setHeaderIsFixed(state, actions) {
      state.headerIsFixed = actions.payload;
    },
    setNsfwMode(state, actions) {
      state.nsfwMode = actions.payload;
    },
    setNsfwLevel(state, actions) {
      state.nsfwLevel = actions.payload;
    },
    setSfwValue(state, actions) {
      state.sfwValue = actions.payload;
      if (!state.nsfwMode) {
        state.nsfwLevel = actions.payload;
      }
    },
    setNsfwValue(state, actions) {
      state.nsfwValue = actions.payload;
      if (state.nsfwMode) {
        state.nsfwLevel = actions.payload;
      }
    },
  },
});

export const switchNsfwMode = (nsfw) => {
  return async (dispatch, getState) => {
    const sfwValue = getState().general.sfwValue;
    const nsfwValue = getState().general.nsfwValue;
    const nsfwLevel = nsfw ? nsfwValue : sfwValue;

    dispatch(generalActions.setNsfwMode(nsfw));
    dispatch(modelActions.setNsfwMode(nsfw));
    dispatch(generalActions.setNsfwLevel(nsfwLevel));

    const uid = getState().auth.user.uid;

    const userRef = doc(firestore, "users", uid);
    await updateDoc(
      userRef,
      {
        nsfwMode: nsfw,
      },
      {
        merge: true,
      }
    );
  };
};

export const setNsfwValues = (sfw, nsfw) => {
  return async (dispatch, getState) => {
    // console.log("SET", sfw, nsfw);
    // const nsfwMode = getState().general.nsfwMode;
    // const nsfwLevel = nsfwMode ? nsfw : sfw;
    dispatch(generalActions.setSfwValue(sfw));
    dispatch(generalActions.setNsfwValue(nsfw));
    // dispatch(generalActions.setNsfwLevel(nsfwLevel));

    const uid = getState().auth.user.uid;

    const userRef = doc(firestore, "users", uid);
    await updateDoc(
      userRef,
      {
        sfwValue: sfw,
        nsfwValue: nsfw,
      },
      {
        merge: true,
      }
    );
  };
};

export const generalActions = generalSlice.actions;

export default generalSlice;
