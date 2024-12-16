import { createSlice } from "@reduxjs/toolkit";
import { authActions } from "./auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase-config";
import { saveToStorage, uploadStorage } from "../variables/utils";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import {
  addElementToIndex,
  convertPromptToArr,
  getTagWeight,
  markDuplicateTags,
  splitTags,
} from "../utils/generalUtils";

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
  },
  reducers: {
    setCurrentPrompt(state, actions) {
      state.curPrompt = actions.payload;
    },
    setCurrentNegPrompt(state, actions) {
      state.curNegPrompt = actions.payload;
    },
    setCurPromptArr(state, actions) {
      state.curPromptArr = markDuplicateTags(actions.payload);
    },
    setCurNegPromptArr(state, actions) {
      state.curNegPromptArr = markDuplicateTags(actions.payload);
    },
    clearPrompt(state, actions) {
      state.curPrompt = "";
      state.curNegPrompt = "";
      state.curPromptArr = [];
      state.curNegPromptArr = [];
    },
    setPresets(state, actions) {
      if (actions?.payload) state.presets = actions.payload;
    },
    setPromptIsOpen(state, actions) {
      state.promptIsOpen = actions.payload;
    },
    setTextMode(state, actions) {
      state.isTextMode = actions.payload;
    },
    addTagToPosition(state, actions) {
      const { dropTargetType } = actions.payload;

      const curPromptArr =
        dropTargetType === "positive"
          ? state.curPromptArr
          : state.curNegPromptArr;

      const newPromptArr = addElementToIndex({
        ...actions.payload,
        curPromptArr,
      });

      const newPromptArrDuplicates = markDuplicateTags(newPromptArr);

      if (dropTargetType === "positive") {
        state.curPromptArr = newPromptArrDuplicates;
      } else {
        state.curNegPromptArr = newPromptArrDuplicates;
      }
    },
    addTagToPrompt(state, actions) {
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

      const isPositive = actions.payload.type === "positive";

      const curPrompt = isPositive ? state.curPromptArr : state.curNegPromptArr;
      const curPromptPositions = isPositive
        ? promptPosPositions
        : promptPNegPositions;

      const newId = !allIds.length ? 0 : allIds[allIds.length - 1] + 1;

      const tagweight = getTagWeight(actions.payload.value);

      const newPromptArr = [
        ...curPrompt,
        {
          id: actions.payload?.id ?? newId,
          tag: actions.payload.value,
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
    removeTag(state, actions) {
      const { id, type, dropTargetType, value } = actions.payload;

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
      } else {
        state.curNegPromptArr = newPromptArrDuplicates;
      }
    },
    addAllTagsToPrompt(state, actions) {
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

      const isPositive = actions.payload.type === "positive";
      const prompt = isPositive
        ? state.curPrompt.trim()
        : state.curNegPrompt.trim();

      const curPromptArr = isPositive
        ? state.curPromptArr
        : state.curNegPromptArr;

      const curPromptPositions = isPositive
        ? promptPosPositions
        : promptPNegPositions;

      const promptArr = convertPromptToArr(prompt);

      const newTags = actions.payload?.value?.filter((newWord) => {
        const isInPrompt = promptArr.find(
          (promptWord) => promptWord === newWord
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

          newPromptArr = addElementToIndex({
            item: {
              id: newId,
              tag: newTag,
              weight: tagweight,
              position: newPosition,
            },
            type: actions.payload.type,
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
    removeAllTags(state, actions) {
      const promptArr =
        actions.payload.type === "positive"
          ? state.curPromptArr
          : state.curNegPromptArr;

      const newPromptArr = promptArr.filter((tag) => {
        return !actions.payload.value.includes(tag.tag);
      });

      const newPromptArrDuplicates = markDuplicateTags(newPromptArr);

      if (actions.payload.type === "positive") {
        state.curPromptArr = newPromptArrDuplicates;
      } else {
        state.curNegPromptArr = newPromptArrDuplicates;
      }
    },
    changeActivationTag(state, actions) {
      const promptArr = state.curPromptArr;

      const activationTagIndex = promptArr.findIndex((tag) => {
        return tag.tag.includes(actions.payload.prevTag);
      });

      if (activationTagIndex < 0) return;

      const updatedPromptArr = promptArr.toSpliced(activationTagIndex, 1, {
        ...promptArr[activationTagIndex],
        tag: actions.payload.newTag,
      });

      state.curPromptArr = updatedPromptArr;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authActions.logout, (state, actions) => {
        state.curPrompt = "";
        state.curNegPrompt = "";
        state.promptIsOpen = true;
        state.isTextMode = false;
      })

      .addMatcher(
        (action) => action.type.startsWith("prompt/removeTag"),
        (state, actions) => {
          const { type, dropTargetType } = actions.payload;
          if (type === "positive" || dropTargetType === "positive") {
            state.curPrompt = state.curPromptArr
              .map((tag) => tag.tag)
              .join(", ");
          }
          if (type === "negative" || dropTargetType === "negative") {
            state.curNegPrompt = state.curNegPromptArr
              .map((tag) => tag.tag)
              .join(", ");
          }
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("prompt/setTextMode"),
        (state, actions) => {
          const promptArr = convertPromptToArr(state.curPrompt).map(
            (tag, i) => {
              return {
                tag,
                position: i,
              };
            }
          );
          const newTags = promptArr.filter(
            (tag) =>
              !state.curPromptArr.find((curTag) => curTag.tag === tag.tag)
          );

          const promptArrNeg = convertPromptToArr(state.curNegPrompt).map(
            (tag, i) => {
              return {
                tag,
                position: i,
              };
            }
          );
          const newNegTags = promptArrNeg.filter(
            (tag) =>
              !state.curNegPromptArr.find((curTag) => curTag.tag === tag.tag)
          );

          const allIds = [
            ...state.curPromptArr.map((tag) => tag.id),
            ...state.curNegPromptArr.map((tag) => tag.id),
          ].sort((a, b) => a - b);

          if (newTags.length) {
            let newPromptArr = [...state.curPromptArr];

            newTags.forEach((newTag) => {
              const newId = allIds[allIds.length - 1] + 1;
              allIds.push(newId);
              newPromptArr = addElementToIndex({
                newId,
                item: { id: newId || 0, ...newTag },
                type: "positive",
                curPromptArr: newPromptArr,
              });
            });
            state.curPromptArr = newPromptArr;
          }
          if (newNegTags.length) {
            let newNegPromptArr = [...state.curNegPromptArr];

            newNegTags.forEach((newTag) => {
              const newId = allIds[allIds.length - 1] + 1;
              allIds.push(newId);
              newNegPromptArr = addElementToIndex({
                newId,
                item: { id: newId || 0, ...newTag },
                type: "negative",
                curPromptArr: newNegPromptArr,
              });
            });
            state.curNegPromptArr = newNegPromptArr;
          }
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("prompt/") &&
          !action.type.startsWith("prompt/setCurrentPrompt"),
        (state, actions) => {
          const newPrompt = state.curPromptArr.map((tag) => tag.tag).join(", ");
          const newNegPrompt = state.curNegPromptArr
            .map((tag) => tag.tag)
            .join(", ");

          state.curPrompt = newPrompt;
          state.curNegPrompt = newNegPrompt;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("prompt/"),
        (state, action) => {
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
  return async (dispatch, getState) => {
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
    // const uid = getState().auth.user.uid;
  };
};

export const promptActions = promptSlice.actions;

export default promptSlice;
