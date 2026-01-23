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
    activeAboutSectionId: "",
  },
  reducers: {
    setIsMobile(state, action) {
      state.isMobile = action.payload;
    },
    setHeaderIsFixed(state, action) {
      state.headerIsFixed = action.payload;
    },
    setNsfwMode(state, action) {
      state.nsfwMode = action.payload;
      if (action.payload) {
        state.nsfwLevel = state.nsfwValue;
      } else {
        state.nsfwLevel = state.sfwValue;
      }
    },
    setNsfwLevel(state, action) {
      state.nsfwLevel = action.payload;
    },
    setActiveAboutSectionId(state, action) {
      state.activeAboutSectionId = action.payload;
    },
    setSfwValue(state, action) {
      state.sfwValue = action.payload;
      if (!state.nsfwMode) {
        state.nsfwLevel = action.payload;
      }
    },
    setNsfwValue(state, action) {
      state.nsfwValue = action.payload;
      if (state.nsfwMode) {
        state.nsfwLevel = action.payload;
      }
    },
  },
});

/**
 * Switches nsfw mode and saves current setting to user data
 * @param {boolean} nsfw - Is nsfw
 * @returns
 */
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
      },
    );
  };
};

/**
 * Sets values for sfw and nsfw modes and saves current settings to user data
 * @param {boolean} sfw - SFW value
 * @param {boolean} nsfw - NSFW value
 * @returns
 */
export const setNsfwValues = (sfw, nsfw) => {
  return async (dispatch, getState) => {
    dispatch(generalActions.setSfwValue(sfw));
    dispatch(generalActions.setNsfwValue(nsfw));

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
      },
    );
  };
};

export const generalActions = generalSlice.actions;

export default generalSlice;
