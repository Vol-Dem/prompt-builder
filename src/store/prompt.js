import { createSlice } from "@reduxjs/toolkit";
import { authActions } from "./auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase-config";
import { saveToStorage, uploadStorage } from "../variables/utils";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { addElementToIndex, convertPromptToArr } from "../utils/generalUtils";

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
      const allIds = [
        ...state.curPromptArr.map((tag) => tag.id),
        ...state.curNegPromptArr.map((tag) => tag.id),
      ].sort((a, b) => a - b);
      const newId = allIds[allIds.length - 1] + 1;

      if (dropTargetType === "positive") {
        state.curPromptArr = addElementToIndex({
          ...actions.payload,
          curPromptArr: state.curPromptArr,
          newId,
        });
      }
      if (dropTargetType === "negative") {
        state.curNegPromptArr = addElementToIndex({
          ...actions.payload,
          curPromptArr: state.curNegPromptArr,
          newId,
        });
      }

      ////STRING///////////////////////////////////////////////////////////////////////////////
      // const { tag, position, type } = actions.payload;
      // if ((!tag, !Number.isFinite(position), !type)) return;
      // if (type === "positive") {
      //   state.curPrompt = convertPromptToArr(state.curPrompt)
      //     .toSpliced(position, 0, tag)
      //     .join(", ");
      // }
      // if (type === "negative") {
      //   state.curNegPrompt = convertPromptToArr(state.curNegPrompt)
      //     .toSpliced(position, 0, tag)
      //     .join(", ");
      // }
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

      //ARR

      const newPromptArr = [
        ...curPrompt,
        {
          id: !allIds.length ? 0 : allIds[allIds.length - 1] + 1,
          tag: actions.payload.value,
          position: !curPromptPositions.length
            ? 0
            : curPromptPositions[curPromptPositions.length - 1] + 1,
        },
      ];

      const newPrompt = newPromptArr.map((tag) => tag.tag).join(", ");

      if (isPositive) {
        state.curPromptArr = newPromptArr;
        state.curPrompt = newPrompt;
      } else {
        state.curNegPromptArr = newPromptArr;
        state.curNegPrompt = newPrompt;
      }

      //STRING
      // const promptPos = state.curPrompt.trim();
      // const promptNeg = state.curNegPrompt.trim();
      // const lastSimbol = prompt.slice(-1);

      // if (isPositive) {
      //   state.curPrompt =
      //     lastSimbol === "," || !prompt.length
      //       ? `${prompt} ${actions.payload.value},`
      //       : `${prompt}, ${actions.payload.value},`;
      // } else {
      //   state.curNegPrompt =
      //     lastSimbol === "," || !prompt.length
      //       ? `${prompt} ${actions.payload.value},`
      //       : `${prompt}, ${actions.payload.value},`;
      // }
    },
    removeTag(state, actions) {
      const { id, type, dropTargetType, value } = actions.payload;
      // console.log("DEL", id, type);
      const promptArr =
        type === "positive" ? state.curPromptArr : state.curNegPromptArr;

      let newPromptArr;

      if (!dropTargetType && value) {
        const delIndex = promptArr.findIndex((tag) => tag.tag === value);
        if (delIndex < 0) return;
        newPromptArr = promptArr.toSpliced(delIndex, 1);
      }

      const delIndex = promptArr.findIndex((tag) => tag.id === id);
      if (dropTargetType === type) {
        if (delIndex < 0) return;
        newPromptArr = promptArr.toSpliced(delIndex, 1);
      } else if (dropTargetType !== type) {
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
      }

      const newPrompt = newPromptArr.map((tag) => tag.tag).join(", ");

      if (type === "positive") {
        state.curPromptArr = newPromptArr;
        state.curPrompt = newPrompt;
      } else {
        state.curNegPromptArr = newPromptArr;
        state.curNegPrompt = newPrompt;
      }

      // //STRING
      // const curPrompt =
      //   actions.payload.type === "positive"
      //     ? state.curPrompt
      //     : state.curNegPrompt;

      // const promptArr = convertPromptToArr(curPrompt);

      // let newPromt = promptArr.flatMap((word) => {
      //   if (word === actions.payload.value) return [];
      //   return word;
      // });
      // if (actions.payload.type === "positive") {
      //   state.curPrompt = newPromt.join(", ");
      // } else {
      //   state.curNegPrompt = newPromt.join(", ");
      // }
    },
    addAllTagsToPrompt(state, actions) {
      const isPositive = actions.payload.type === "positive";
      const prompt = isPositive
        ? state.curPrompt.trim()
        : state.curNegPrompt.trim();

      const lastSimbol = prompt.slice(-1);

      const promptArr = convertPromptToArr(prompt);

      const newWords = actions.payload?.value?.filter((newWord) => {
        const isInPrompt = promptArr.find(
          (promptWord) => promptWord === newWord
        );
        return !isInPrompt;
      });

      if (isPositive && !!newWords?.length) {
        state.curPrompt =
          lastSimbol === "," || !prompt.length
            ? `${prompt} ${newWords.join(", ")},`
            : `${prompt}, ${newWords.join(", ")},`;
      } else if (!isPositive && !!newWords?.length) {
        state.curNegPrompt =
          lastSimbol === "," || !prompt.length
            ? `${prompt} ${newWords.join(", ")},`
            : `${prompt}, ${newWords.join(", ")},`;
      }
    },
    removeAllTags(state, actions) {
      const curPrompt =
        actions.payload.type === "positive"
          ? state.curPrompt
          : state.curNegPrompt;

      const promptArr = convertPromptToArr(curPrompt);

      let newPromt = promptArr.flatMap((word) => {
        const isInPrompt = actions.payload.value.find(
          (wordToDel) => wordToDel === word
        );
        if (isInPrompt) return [];
        return word;
      });
      if (actions.payload.type === "positive") {
        state.curPrompt = newPromt.join(", ");
      } else {
        state.curNegPrompt = newPromt.join(", ");
      }
    },
    changeActivationTag(state, actions) {
      const promptArr = convertPromptToArr(state.curPrompt);

      const activationTagIndex = promptArr.findIndex((word) =>
        word.trim().includes(actions.payload.prevTag)
      );
      if (activationTagIndex !== -1) {
        const updatedPromptArr = promptArr.toSpliced(
          activationTagIndex,
          1,
          actions.payload.newTag
        );
        state.curPrompt = updatedPromptArr.join(", ");
      }
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
          console.log("RUNNNN");
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
          if (state.curPrompt && state.curNegPrompt) return;
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

          console.log(promptArr);
          console.log(newTags);

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
                item: { ...newTag, id: newId },
                type: "positive",
                curPromptArr: newPromptArr,
                newId,
              });
            });
            state.curPromptArr = newPromptArr;
          }
          if (newNegTags.length) {
            let newNegPromptArr;

            newNegTags.forEach((newNegTag) => {
              const newId = allIds[allIds.length - 1] + 1;
              allIds.push(newId);
              newNegPromptArr = addElementToIndex(newNegTag);
            });
            state.curNegPromptArr = newNegPromptArr;
          }
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

    if (prompt) dispatch(promptActions.setCurrentPrompt(prompt));
    if (negPrompt) dispatch(promptActions.setCurrentNegPrompt(negPrompt));
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
