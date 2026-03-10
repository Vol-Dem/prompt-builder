import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";

import firebaseApp from "../firebase-config";
import { saveGuideData } from "../utils/fetch/fetchUtils";
import type {
  GuideState,
  SetGuideIsActivePayload,
  SetStepPayload,
  SwitchStepPayload,
} from "../types/guide.types";

const auth = getAuth(firebaseApp);

/**
 * Guide settings state.
 *
 * Controls:
 * - User onboarding / guide flow state
 *
 * State:
 * @property {boolean} active - Whether the guide system is active.
 * @property {boolean} introDisabled - Whether the guide intro is disabled.
 * @property {boolean} outroIsActive - Whether the guide outro is enabled.
 * @property {{ active: boolean, step: number }} home - Home page guide state.
 * @property {{ active: boolean, step: number }} model - Model page guide state.
 * @property {{ active: boolean, step: number }} edit - Edit page guide state.
 */
const guideSlice = createSlice({
  name: "guide",
  initialState: {
    active: false,
    introDisabled: false,
    outroIsActive: false,
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
  } as GuideState,
  reducers: {
    setGuideIsActive(state, action: PayloadAction<boolean>) {
      state.active = action.payload;
    },
    setIntroDisabled(state, action: PayloadAction<boolean>) {
      state.introDisabled = action.payload;
    },
    setOutroIsActive(state, action: PayloadAction<boolean>) {
      state.outroIsActive = action.payload;
    },
    /**
     * Advances the guide to the next step for the given section.
     * @param {SwitchStepPayload} action.payload
     */
    guideNextStep(state, action: PayloadAction<SwitchStepPayload>) {
      const type = action.payload?.type;
      if (type) {
        state[type].step = state[type].step + 1;
      }
    },
    /**
     * Advances the guide to the previous step for the given section.
     * @param {SwitchStepPayload} action.payload
     */
    guidePrevStep(state, action: PayloadAction<SwitchStepPayload>) {
      const type = action.payload?.type;
      if (type && state[type]?.step > 0) {
        state[type].step = state[type].step - 1;
      }
    },
    setGuideActive(state, action: PayloadAction<SetGuideIsActivePayload>) {
      state[action.payload.type].active = action.payload.value;
    },
    setGuideStep(state, action: PayloadAction<SetStepPayload>) {
      state[action.payload.type].step = action.payload.value;
    },
    /**
     * Replaces the entire guide state with persisted user data.
     *
     * Used when restoring the guide from the database on app start.
     *
     * @param {GuideState} action.payload
     */
    setGuideInitialState(state, action: PayloadAction<GuideState>) {
      if (action.payload) {
        state.active = action.payload.active;
        state.introDisabled = action.payload.introDisabled;
        state.outroIsActive = action.payload.outroIsActive;
        state.home = action.payload.home;
        state.model = action.payload.model;
        state.edit = action.payload.edit;
      }
    },
  },
  extraReducers: (builder) => {
    /**
     * Automatically persists guide state changes to the database.
     *
     * Listens to all actions from this slice (guide/*),
     * except `setGuideInitialState`, and saves the current
     * guide state for the authenticated user.
     */
    builder.addMatcher(
      (action) =>
        action.type.startsWith("guide/") &&
        !action.type.startsWith("guide/setGuideInitialState"),
      (state) => {
        const uid = auth?.currentUser?.uid;
        if (uid) {
          // Persist updated guide state
          saveGuideData(state, uid);
        }
      },
    );
  },
});

export const guideActions = guideSlice.actions;

export default guideSlice;
