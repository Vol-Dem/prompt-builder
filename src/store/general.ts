import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

import firebaseApp from "../firebase-config";
import type { AppThunk } from "./store";
import type { CivitaiEnums, GeneralState } from "../types/general.types";
import type { SuggestedCollectionsSortType } from "../types/collections.types";
import { fetchData } from "../utils/fetch/fetchUtils";
import { URL_CIV_ENUMS } from "../variables/constants";
import { normalizeError } from "../utils/generalUtils";

const firestore = getFirestore(firebaseApp);

/**
 * General UI & app-wide settings state.
 *
 * Controls:
 * - Device flags (mobile)
 * - Header behavior
 * - NSFW mode and filtering
 * - About page navigation state
 *
 * State:
 * @property {boolean} isMobile - Whether the app runs on a mobile device.
 * @property {boolean} headerIsFixed - Whether the header is fixed.
 * @property {boolean} nsfwMode - Whether NSFW mode is enabled.
 * @property {string} nsfwLevel - Active NSFW filter value.
 * @property {string} sfwValue - Stored SFW filter value.
 * @property {string} nsfwValue - Stored NSFW filter value.
 * @property {string} activeAboutSectionId - Current About section id.
 */
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
    suggestedCollectionsSortBy: "name",
    civitaiEnums: null,
  } as GeneralState,
  reducers: {
    setIsMobile(state, action: PayloadAction<boolean>) {
      state.isMobile = action.payload;
    },
    setCivitaiEnums(state, action: PayloadAction<CivitaiEnums>) {
      state.civitaiEnums = action.payload;
    },
    setHeaderIsFixed(state, action: PayloadAction<boolean>) {
      state.headerIsFixed = action.payload;
    },
    /**
     * Enables or disables NSFW mode.
     * Automatically updates `nsfwLevel` based on the active mode.
     */
    setNsfwMode(state, action: PayloadAction<boolean>) {
      state.nsfwMode = action.payload;
      if (action.payload) {
        state.nsfwLevel = state.nsfwValue;
      } else {
        state.nsfwLevel = state.sfwValue;
      }
    },
    setNsfwLevel(state, action: PayloadAction<string>) {
      state.nsfwLevel = action.payload;
    },
    setActiveAboutSectionId(state, action: PayloadAction<string>) {
      state.activeAboutSectionId = action.payload;
    },
    /**
     * Updates SFW value.
     * If NSFW mode is disabled, also updates active `nsfwLevel`.
     */
    setSfwValue(state, action: PayloadAction<string>) {
      state.sfwValue = action.payload;
      if (!state.nsfwMode) {
        state.nsfwLevel = action.payload;
      }
    },
    /**
     * Updates NSFW value.
     * If NSFW mode is disabled, also updates active `nsfwLevel`.
     */
    setNsfwValue(state, action: PayloadAction<string>) {
      state.nsfwValue = action.payload;
      if (state.nsfwMode) {
        state.nsfwLevel = action.payload;
      }
    },
    setSuggestedCollectionsSortBy(
      state,
      action: PayloadAction<SuggestedCollectionsSortType>,
    ) {
      state.suggestedCollectionsSortBy = action.payload;
    },
  },
});

/**
 * Switches NSFW mode and persists the setting to Firestore.
 *
 * Side effects:
 * - Updates general slice
 * - Updates model slice
 * - Saves user preference in Firestore
 *
 * @param {boolean} nsfw - Whether to enable NSFW mode.
 * @returns {Function} Redux thunk.
 */
export const switchNsfwMode = (nsfw: boolean): AppThunk => {
  return async (dispatch, getState) => {
    const sfwValue = getState().general.sfwValue;
    const nsfwValue = getState().general.nsfwValue;
    const nsfwLevel = nsfw ? nsfwValue : sfwValue;

    dispatch(generalActions.setNsfwMode(nsfw));
    dispatch(generalActions.setNsfwLevel(nsfwLevel));

    const uid = getState().auth.user.uid;

    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      nsfwMode: nsfw,
    });
  };
};

/**
 * Sets values for sfw and nsfw modes and saves current settings to user data
 * @param {boolean} sfw - SFW value
 * @param {boolean} nsfw - NSFW value
 * @returns {Function} Redux thunk.
 */
export const setNsfwValues = (sfw: string, nsfw: string): AppThunk => {
  return async (dispatch, getState) => {
    dispatch(generalActions.setSfwValue(sfw));
    dispatch(generalActions.setNsfwValue(nsfw));

    const uid = getState().auth.user.uid;

    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      sfwValue: sfw,
      nsfwValue: nsfw,
    });
  };
};

export const fetchCivitaiEnums = (): AppThunk => {
  return async (dispatch) => {
    try {
      const civEnums = await fetchData<CivitaiEnums>(URL_CIV_ENUMS);
      dispatch(generalActions.setCivitaiEnums(civEnums));
    } catch (err) {
      throw normalizeError(err);
    }
  };
};

export const generalActions = generalSlice.actions;

export default generalSlice;
