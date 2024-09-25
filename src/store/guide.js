import { createSlice } from "@reduxjs/toolkit";
import firebaseApp from "../firebase-config";
import { getAuth } from "firebase/auth";
import { saveGuideData } from "../utils/fetchUtils";

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
    setGuideIsActive(state, actions) {
      state.active = actions.payload;
    },
    setIntroDisabled(state, actions) {
      state.introDisabled = actions.payload;
    },
    setOutroIsActive(state, actions) {
      state.outroIsActive = actions.payload;
    },
    setGuideState(state, actions) {
      state[actions.type] = actions.payload;
    },
    switchGuideState(state, actions) {
      state[actions.type].active = actions.payload;
    },
    guideNextStep(state, actions) {
      const type = actions.payload?.type;
      if (type) {
        state[type].step = state[type].step + 1;
      }
    },
    guidePrevStep(state, actions) {
      const type = actions.payload?.type;
      if (type && state[type]?.step > 0) {
        state[type].step = state[type].step - 1;
      }
    },
    setGuideActive(state, actions) {
      state[actions.payload.type].active = actions.payload.value;
    },
    setGuideStep(state, actions) {
      state[actions.payload.type].step = actions.payload.value;
    },
    setGuideInitialState(state, actions) {
      if (actions.payload) {
        state.active = actions.payload.active;
        state.introDisabled = actions.payload.introDisabled;
        state.outroIsActive = actions.payload.outroIsActive;
        state.step = actions.payload.step;
        state.home = actions.payload.home;
        state.model = actions.payload.model;
        state.edit = actions.payload.edit;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) =>
        action.type.startsWith("guide/") &&
        !action.type.startsWith("guide/setGuideInitialState"),
      (state, action) => {
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
