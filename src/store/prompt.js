import { createSlice } from "@reduxjs/toolkit";
import { authActions } from "./auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase-config";
import { saveToStorage, uploadStorage } from "../variables/utils";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import {
  moveElementToPosition,
  createPromptItem,
  getTagWeight,
  markDuplicateTags,
} from "../utils/promptUtils";
import { splitTags } from "../utils/promptUtils";
const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

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
  },
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
    setPromptIsOpen(state, action) {
      state.promptIsOpen = action.payload;
    },
    setTextMode(state, action) {
      const allIds = [];

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
    removeTag(state, action) {
      const { id, type, dropTargetType, value } = action.payload;

      const promptArr =
        type === "positive" ? state.curPromptArr : state.curNegPromptArr;

      let newPromptArr;

      let delIndex;
      if (!dropTargetType && value) {
        delIndex = promptArr.findIndex((tag) => tag.tag === value);
      }
      if (Number.isFinite(id) && !value) {
        delIndex = promptArr.findIndex((tag) => tag.id === id);
      }

      if (delIndex < 0) return;

      newPromptArr = promptArr.flatMap((tag) => {
        if (tag.position === delIndex) {
          return [];
        }
        if (tag.position > delIndex) {
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
    addAllTagsToPrompt(state, action) {
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
          (promptWord) => promptWord.tag === newWord
        );
        return !isInPrompt;
      });

      if (newTags.length) {
        let newPromptArr = [...curPromptArr];

        newTags.forEach((newTag, i) => {
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
      .addCase(authActions.logout, (state, action) => {
        promptSlice.caseReducers.clearPrompt(state, action);
        state.promptIsOpen = true;
        state.isTextMode = false;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("prompt/") &&
          !action.type.startsWith("prompt/setCurrentPrompt") &&
          !action.type.startsWith("prompt/setCurrentNegPrompt") &&
          !action.type.startsWith("prompt/setTextMode"),
        (state, action) => {
          const newPrompt = state.curPromptArr.map((tag) => tag.tag).join(", ");
          const newNegPrompt = state.curNegPromptArr
            .map((tag) => tag.tag)
            .join(", ");

          state.curPrompt = newPrompt;
          state.curNegPrompt = newNegPrompt;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("prompt/setCurrentPrompt") ||
          action.type.startsWith("prompt/setCurrentNegPrompt"),
        (state) => {
          const allIds = [];

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
        }
      )
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
        }
      );
  },
});

export const uploadPromptFromStorage = () => {
  return (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const prompt = uploadStorage(`${uid}-prompt`);
    const negPrompt = uploadStorage(`${uid}-neg-prompt`);
    const promptState = uploadStorage(`${uid}-prompt-state`);
    const isTextMode = uploadStorage(`${uid}-prompt-text`);

    if (prompt)
      dispatch(
        promptActions.addAllTagsToPrompt({
          value: splitTags(prompt),
          type: "positive",
        })
      );
    if (negPrompt)
      dispatch(
        promptActions.addAllTagsToPrompt({
          value: splitTags(negPrompt),
          type: "negative",
        })
      );
    if (promptState) {
      dispatch(promptActions.setPromptIsOpen(promptState.promptIsOpen));
    } else {
      dispatch(promptActions.setPromptIsOpen(true));
    }
    if (isTextMode) dispatch(promptActions.setTextMode(isTextMode.isTextMode));
  };
};

export const updatePresets = (presetType, updatedPresets) => {
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
        { merge: true }
      );

      dispatch(
        promptActions.setPresets({
          ...curPreset,
          [presetType]: updatedPresets,
        })
      );
    }
  };
};

export const getUserPresets = (uid) => {
  return async (dispatch) => {
    try {
      const userRef = doc(firestore, "users", uid);
      const presetsDoc = await getDoc(userRef);
      if (presetsDoc.exists()) {
        const presetsData = presetsDoc.data();
        if (presetsData?.presets) {
          dispatch(promptActions.setPresets(presetsData.presets));
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  };
};

export const promptActions = promptSlice.actions;

export default promptSlice;
