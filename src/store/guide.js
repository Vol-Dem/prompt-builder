import { createSlice } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";

import firebaseApp from "../firebase-config";
import { saveGuideData } from "../utils/fetch/fetchUtils";

const auth = getAuth(firebaseApp);

const guideSlice = createSlice({
  name: "guide",
  initialState: {
    newGuide: true,
    active: false,
    introDisabled: false,
    outroIsActive: false,
    step: 1,
    home: {
      active: true,
      step: 1,
    },
    model: {
      active: true,
      step: 1,
    },
    edit: {
      active: false,
      step: 1,
    },
  },
  reducers: {
    setGuideIsActive(state, action) {
      state.active = action.payload;
    },
    setIntroDisabled(state, action) {
      state.introDisabled = action.payload;
    },
    setOutroIsActive(state, action) {
      state.outroIsActive = action.payload;
    },
    setGuideState(state, action) {
      state[action.type] = action.payload;
    },
    switchGuideState(state, action) {
      state[action.type].active = action.payload;
    },
    guideNextStep(state, action) {
      const type = action.payload?.type;
      if (type) {
        state[type].step = state[type].step + 1;
      }
    },
    guidePrevStep(state, action) {
      const type = action.payload?.type;
      if (type && state[type]?.step > 0) {
        state[type].step = state[type].step - 1;
      }
    },
    setGuideActive(state, action) {
      state[action.payload.type].active = action.payload.value;
    },
    setGuideStep(state, action) {
      state[action.payload.type].step = action.payload.value;
    },
    setGuideInitialState(state, action) {
      if (action.payload) {
        state.active = action.payload.active;
        state.introDisabled = action.payload.introDisabled;
        state.outroIsActive = action.payload.outroIsActive;
        state.step = action.payload.step;
        state.home = action.payload.home;
        state.model = action.payload.model;
        state.edit = action.payload.edit;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) =>
        action.type.startsWith("guide/") &&
        !action.type.startsWith("guide/setGuideInitialState"),
      (state) => {
        const uid = auth?.currentUser?.uid;
        if (uid) {
          saveGuideData(state, uid);
        }
      }
    );
  },
});

export const guideActions = guideSlice.actions;

export default guideSlice;
