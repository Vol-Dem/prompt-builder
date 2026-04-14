import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

import firebaseApp from "../firebase-config";
import {
  normalizeError,
  saveToStorage,
  uploadStorage,
} from "../utils/generalUtils";
import {
  moveElementToPosition,
  createPromptItem,
  getTagWeight,
  markDuplicateTags,
} from "../utils/promptUtils";
import { splitTags } from "../utils/promptUtils";
import type { Presets } from "../../shared/types/user";
import type {
  PromptOpenState,
  PromptState,
  TextModeState,
} from "../types/prompt.types";
import type { AppThunk } from "./store";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

/**
 * @typedef {Object} PromptTag
 * @property {number} id
 * @property {string} tag
 * @property {string} weight
 * @property {number} position
 * @property {boolean} [duplicate]
 */

/**
 * Prompt state.
 *
 * Controls:
 * - Prompt
 * - Presets
 *
 * State:
 * @property {string} curPrompt - Current positive prompt value.
 * @property {Array<PromptTag>} curPromptArr - Current positive prompt array.
 * @property {string} curNegPrompt - Current negative prompt value.
 * @property {Array<PromptTag>} curNegPromptArr - Current negative prompt array.
 * @property {{ positive: Array<Object>, negative: Array<Object> }} presets - Presets data.
 * @property {boolean} promptIsOpen - Whether prompt is open.
 * @property {boolean} isTextMode - Whether prompt is in the text mode.
 * @property {number|null} headerHeight - Header height.
 * @property {number|null} promptBtnHeight - Open prompt button height.
 * @property {number|null} promptHeight - Prompt height.
 * @property {number|null} positivePromptHeight - Positive prompt field height.
 * @property {number|null} negativePromptHeight - Negative prompt field height.
 */
const promptSlice = createSlice({
  name: "prompt",
  initialState: {
    curPrompt: "",
    curPromptArr: [],
    curNegPrompt: "",
    curNegPromptArr: [],
    presets: { positive: [], negative: [] },
    promptIsOpen: false,
    isTextMode: false,
    headerHeight: null,
    promptBtnHeight: null,
    promptHeight: null,
    positivePromptHeight: null,
    negativePromptHeight: null,
  } as PromptState,
  reducers: {
    setCurrentPrompt(state, action) {
      state.curPrompt = action.payload;
    },
    setCurrentNegPrompt(state, action) {
      state.curNegPrompt = action.payload;
    },
    setCurPromptArr(state, action) {
      state.curPromptArr = markDuplicateTags(action.payload);
    },
    setCurNegPromptArr(state, action) {
      state.curNegPromptArr = markDuplicateTags(action.payload);
    },
    clearPrompt(state) {
      state.curPrompt = "";
      state.curNegPrompt = "";
      state.curPromptArr = [];
      state.curNegPromptArr = [];
    },
    setPresets(state, action) {
      if (action?.payload) state.presets = action.payload;
    },
    /**
     * Opens prompt dropdown.
     */
    setPromptIsOpen(state, action) {
      state.promptIsOpen = action.payload;
    },
    /**
     * Switches between text and tags mode.
     * Converts text prompt version to array of tags data.
     * Creates ID for each tag.
     * Marks duplicate tags.
     * Sets postive and negative prompt array states.
     */
    setTextMode(state, action) {
      const allIds: number[] = [];

      const promptArr = splitTags(state.curPrompt).map((tag, i) => {
        const newId = allIds[allIds.length - 1] + 1 || 0;
        allIds.push(newId);
        return createPromptItem(tag, newId, i);
      });

      const promptArrNeg = splitTags(state.curNegPrompt).map((tag, i) => {
        const newId = allIds[allIds.length - 1] + 1 || 0;
        allIds.push(newId);
        return createPromptItem(tag, newId, i);
      });

      const newPosPromptArrDuplicates = markDuplicateTags(promptArr);
      const newNegPromptArrDuplicates = markDuplicateTags(promptArrNeg);

      state.isTextMode = action.payload;
      state.curPromptArr = newPosPromptArrDuplicates;
      state.curNegPromptArr = newNegPromptArrDuplicates;
    },
    /**
     * Inserts tag to position and updates position field of all tags.
     * Marks duplicate tags.
     * @param {{ item: Object, type: string, dropTargetType: string, prevPosition: number }} action.payload
     */
    addTagToPosition(state, action) {
      const { dropTargetType } = action.payload;

      const curPromptArr =
        dropTargetType === "positive"
          ? state.curPromptArr
          : state.curNegPromptArr;

      const newPromptArr = moveElementToPosition({
        ...action.payload,
        curPromptArr,
      });

      const newPromptArrDuplicates = markDuplicateTags(newPromptArr);

      if (dropTargetType === "positive") {
        state.curPromptArr = newPromptArrDuplicates;
      } else {
        state.curNegPromptArr = newPromptArrDuplicates;
      }
    },
    /**
     * Inserts tag at the end of the prompt.
     * Creates tag ID for new tags.
     * Marks duplicate tags.
     */
    addTagToPrompt(state, action) {
      const allIds = [
        ...state.curPromptArr.map((tag) => tag.id),
        ...state.curNegPromptArr.map((tag) => tag.id),
      ].sort((a, b) => a - b);
      const promptPosPositions = state.curPromptArr
        .map((tag) => tag.position)
        .sort((a, b) => a - b);
      const promptPNegPositions = state.curNegPromptArr
        .map((tag) => tag.position)
        .sort((a, b) => a - b);

      const isPositive = action.payload.type === "positive";

      const curPrompt = isPositive ? state.curPromptArr : state.curNegPromptArr;
      const curPromptPositions = isPositive
        ? promptPosPositions
        : promptPNegPositions;

      const newId = !allIds.length ? 0 : allIds[allIds.length - 1] + 1;

      const tagweight = getTagWeight(action.payload.value);

      const newPromptArr = [
        ...curPrompt,
        {
          id: action.payload?.id ?? newId,
          tag: action.payload.value,
          weight: tagweight,
          position: !curPromptPositions.length
            ? 0
            : curPromptPositions[curPromptPositions.length - 1] + 1,
        },
      ];

      const newPromptArrDuplicates = markDuplicateTags(newPromptArr);

      if (isPositive) {
        state.curPromptArr = newPromptArrDuplicates;
      } else {
        state.curNegPromptArr = newPromptArrDuplicates;
      }
    },
    /**
     * Removes tag from prompt.
     * Updates position field of all tags.
     * @param {{ id: number, type: string, dropTargetType: string, value: string }} action.payload
     */
    removeTag(state, action) {
      const { id, type, dropTargetType, value } = action.payload;

      const promptArr =
        type === "positive" ? state.curPromptArr : state.curNegPromptArr;

      let delIndex: number | null = null;

      if (!dropTargetType && value) {
        delIndex = promptArr.findIndex((tag) => tag.tag === value);
      }
      if (Number.isFinite(id) && !value) {
        delIndex = promptArr.findIndex((tag) => tag.id === id);
      }

      if (delIndex && delIndex < 0) return;

      const newPromptArr = promptArr.flatMap((tag) => {
        if (tag.position === delIndex) {
          return [];
        }
        if (delIndex !== null && tag.position > delIndex) {
          return {
            ...tag,
            position: tag.position - 1,
          };
        }
        return tag;
      });

      const newPromptArrDuplicates = markDuplicateTags(newPromptArr);

      if (type === "positive") {
        state.curPromptArr = newPromptArrDuplicates;
      }
      if (type === "negative") {
        state.curNegPromptArr = newPromptArrDuplicates;
      }
    },
    /**
     * Inserts multiple tags at the end of the prompt.
     * Creates tag ID for new tags.
     * Marks duplicate tags.
     */
    addAllTagsToPrompt(
      state,
      action: PayloadAction<{ type: string; value: string[] }>,
    ) {
      const allIds = [
        ...state.curPromptArr.map((tag) => tag.id),
        ...state.curNegPromptArr.map((tag) => tag.id),
      ].sort((a, b) => a - b);
      const promptPosPositions = state.curPromptArr
        .map((tag) => tag.position)
        .sort((a, b) => a - b);
      const promptPNegPositions = state.curNegPromptArr
        .map((tag) => tag.position)
        .sort((a, b) => a - b);

      const isPositive = action.payload.type === "positive";

      const curPromptArr = isPositive
        ? state.curPromptArr
        : state.curNegPromptArr;

      const curPromptPositions = isPositive
        ? promptPosPositions
        : promptPNegPositions;

      const newTags = action.payload?.value?.filter((newWord) => {
        const isInPrompt = curPromptArr.find(
          (promptWord) => promptWord.tag === newWord,
        );
        return !isInPrompt;
      });

      if (newTags.length) {
        let newPromptArr = [...curPromptArr];

        newTags.forEach((newTag) => {
          const newId = allIds[allIds.length - 1] + 1 || 0;
          const newPosition =
            curPromptPositions[curPromptPositions.length - 1] + 1 || 0;
          allIds.push(newId);
          curPromptPositions.push(newPosition);
          const tagweight = getTagWeight(newTag);

          newPromptArr = moveElementToPosition({
            item: {
              id: newId,
              tag: newTag,
              weight: tagweight,
              position: newPosition,
            },
            type: action.payload.type,
            curPromptArr: newPromptArr,
          });
        });

        const newPromptArrDuplicates = markDuplicateTags(newPromptArr);

        if (isPositive) {
          state.curPromptArr = newPromptArrDuplicates;
        } else {
          state.curNegPromptArr = newPromptArrDuplicates;
        }
      }
    },
    /**
     * Removes multiple tags from prompt.
     * @param {{ type: string, value: Array }} action.payload
     */
    removeAllTags(state, action) {
      const promptArr =
        action.payload.type === "positive"
          ? state.curPromptArr
          : state.curNegPromptArr;

      const newPromptArr = promptArr.filter((tag) => {
        return !action.payload.value.includes(tag.tag);
      });

      const newPromptArrDuplicates = markDuplicateTags(newPromptArr);

      if (action.payload.type === "positive") {
        state.curPromptArr = newPromptArrDuplicates;
      } else {
        state.curNegPromptArr = newPromptArrDuplicates;
      }
    },
    /**
     * Changes weight of activation tag in prompt.
     * @param {{ newTag: string, prevTag: string, weight: string }} action.payload
     */
    changeActivationTag(state, action) {
      const promptArr = state.curPromptArr;

      const activationTagIndex = promptArr.findIndex((tag) => {
        return tag.tag.includes(action.payload.prevTag);
      });

      if (activationTagIndex < 0) return;

      const updatedPromptArr = promptArr.toSpliced(activationTagIndex, 1, {
        ...promptArr[activationTagIndex],
        tag: action.payload.newTag,
        weight: action.payload.weight,
      });

      state.curPromptArr = updatedPromptArr;
    },
    setHeaderHeight(state, action) {
      state.headerHeight = action.payload;
    },
    setPromptBtnHeight(state, action) {
      state.promptBtnHeight = action.payload;
    },
    setPromptHeight(state, action) {
      state.promptHeight = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /**
       * Automatically creates text version of the prompt.
       *
       * Listens to all actions from this slice (prompt/*),
       * except `setCurrentPrompt`, `setCurrentNegPrompt`, `setTextMode`, and creates
       * text version of the prompt.
       */
      .addMatcher(
        (action) =>
          action.type.startsWith("prompt/") &&
          !action.type.startsWith("prompt/setCurrentPrompt") &&
          !action.type.startsWith("prompt/setCurrentNegPrompt") &&
          !action.type.startsWith("prompt/setTextMode"),
        (state) => {
          const newPrompt = state.curPromptArr.map((tag) => tag.tag).join(", ");
          const newNegPrompt = state.curNegPromptArr
            .map((tag) => tag.tag)
            .join(", ");

          state.curPrompt = newPrompt;
          state.curNegPrompt = newNegPrompt;
        },
      )
      /**
       * Automatically creates array version of the prompt.
       *
       * Listens to all actions from this slice that start with `prompt/setCurrentPrompt*` or
       * `prompt/setCurrentNegPrompt*` and creates array version of the prompt.
       */
      .addMatcher(
        (action) =>
          action.type.startsWith("prompt/setCurrentPrompt") ||
          action.type.startsWith("prompt/setCurrentNegPrompt"),
        (state) => {
          const allIds: number[] = [];

          const promptArr = splitTags(state.curPrompt).map((tag, i) => {
            const newId = allIds[allIds.length - 1] + 1 || 0;
            allIds.push(newId);
            return createPromptItem(tag, newId, i);
          });

          const promptArrNeg = splitTags(state.curNegPrompt).map((tag, i) => {
            const newId = allIds[allIds.length - 1] + 1 || 0;
            allIds.push(newId);
            return createPromptItem(tag, newId, i);
          });

          const newPosPromptArrDuplicates = markDuplicateTags(promptArr);
          const newNegPromptArrDuplicates = markDuplicateTags(promptArrNeg);

          state.curPromptArr = newPosPromptArrDuplicates;
          state.curNegPromptArr = newNegPromptArrDuplicates;
        },
      )
      /**
       * Automatically persists prompt state changes to the session storage.
       *
       * Listens to all actions from this slice (prompt/*), and saves the current
       * prompt state for the authenticated user.
       */
      .addMatcher(
        (action) => action.type.startsWith("prompt/"),
        (state) => {
          const uid = auth?.currentUser?.uid;
          if (uid) {
            saveToStorage(`${uid}-prompt`, state.curPrompt);
            saveToStorage(`${uid}-neg-prompt`, state.curNegPrompt);
            saveToStorage(`${uid}-prompt-state`, {
              promptIsOpen: state.promptIsOpen,
            });
            saveToStorage(`${uid}-prompt-text`, {
              isTextMode: state.isTextMode,
            });
          }
        },
      );
  },
});

/**
 * Loads prompt state from session storage.
 *
 * Side effects:
 * - Reads prompt data from session storage.
 * - Updates prompt state in Redux.
 *
 * @returns {Function} Redux thunk.
 */
export const uploadPromptFromStorage = (): AppThunk => {
  return (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const prompt = uploadStorage<string>(`${uid}-prompt`);
    const negPrompt = uploadStorage<string>(`${uid}-neg-prompt`);
    const promptState = uploadStorage<PromptOpenState>(`${uid}-prompt-state`);
    const isTextMode = uploadStorage<TextModeState>(`${uid}-prompt-text`);

    if (prompt)
      dispatch(
        promptActions.addAllTagsToPrompt({
          value: splitTags(prompt),
          type: "positive",
        }),
      );
    if (negPrompt)
      dispatch(
        promptActions.addAllTagsToPrompt({
          value: splitTags(negPrompt),
          type: "negative",
        }),
      );
    if (promptState) {
      dispatch(promptActions.setPromptIsOpen(promptState.promptIsOpen));
    } else {
      dispatch(promptActions.setPromptIsOpen(true));
    }
    if (isTextMode) dispatch(promptActions.setTextMode(isTextMode.isTextMode));
  };
};

/**
 * Updates user presets.
 *
 * Side effects:
 * - Saves the presets data to Firestore.
 * - Updates presets state in Redux.
 *
 * @param {string} presetType - Preset category.
 * @param {Array<Object>} updatedPresets - Updated preset list.
 * @returns {Function} Redux thunk.
 */
export const updatePresets = (
  presetType: string,
  updatedPresets: Presets,
): AppThunk => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const curPreset = getState().prompt.presets;
    if (uid) {
      const userRef = doc(firestore, "users", uid);
      const presetField = `presets.${presetType}`;

      await updateDoc(
        userRef,
        {
          [presetField]: updatedPresets,
        },
        // { merge: true },
      );

      dispatch(
        promptActions.setPresets({
          ...curPreset,
          [presetType]: updatedPresets,
        }),
      );
    }
  };
};

/**
 * Fetches user presets.
 *
 * Side effects:
 * - Fetches user presets from Firestore.
 *
 * @returns {Function} Redux thunk.
 */
export const getUserPresets = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const uid = getState().auth.user.uid;
      const userRef = doc(firestore, "users", uid);
      const presetsDoc = await getDoc(userRef);
      if (presetsDoc.exists()) {
        const presetsData = presetsDoc.data();
        if (presetsData?.presets) {
          dispatch(promptActions.setPresets(presetsData.presets));
        }
      }
    } catch (error) {
      throw normalizeError(error);
    }
  };
};

export const promptActions = promptSlice.actions;

export default promptSlice;
