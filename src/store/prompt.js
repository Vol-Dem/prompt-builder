import { createSlice } from "@reduxjs/toolkit";
import { authActions } from "./auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase-config";
import { saveToStorage, uploadStorage } from "../variables/utils";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { convertPromptToArr } from "../utils/generalUtils";

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
      // state.curPromptArr = convertPromptToArr(actions.payload);
    },
    setCurrentNegPrompt(state, actions) {
      state.curNegPrompt = actions.payload;
      // state.curNegPromptArr = convertPromptToArr(actions.payload);
    },
    clearPrompt(state, actions) {
      state.curPrompt = "";
      state.curNegPrompt = "";
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
      const { tag, position, type } = actions.payload;
      if ((!tag, !Number.isFinite(position), !type)) return;
      if (type === "positive") {
        state.curPrompt = convertPromptToArr(state.curPrompt)
          .toSpliced(position, 0, tag)
          .join(", ");
      }
      if (type === "negative") {
        state.curNegPrompt = convertPromptToArr(state.curNegPrompt)
          .toSpliced(position, 0, tag)
          .join(", ");
      }
    },
    addTagToPrompt(state, actions) {
      const promptPos = state.curPrompt.trim();
      const promptNeg = state.curNegPrompt.trim();
      const allIds = [
        ...state.curPromptArr.map((tag) => tag.id),
        ...state.curNegPromptArr.map((tag) => tag.id),
      ].sort();
      const promptPosPositions = state.curPromptArr
        .map((tag) => tag.position)
        .sort();
      const promptPNegPositions = state.curNegPromptArr
        .map((tag) => tag.position)
        .sort();

      console.log("ids", allIds);
      console.log("pos", promptPosPositions);
      console.log("posNeg", promptPNegPositions);

      const isPositive = actions.payload.type === "positive";
      const prompt = isPositive ? promptPos : promptNeg;

      //ARR

      if (isPositive && !state.curPromptArr.length) {
        state.curPromptArr = [
          { id: 0, position: 0, tag: actions.payload.value },
        ];
      } else if (isPositive && !!state.curPromptArr.length) {
        console.log(allIds[allIds.length] + 1);
        state.curPromptArr = [
          ...state.curPromptArr,
          {
            id: allIds[allIds.length - 1] + 1,
            tag: actions.payload.value,
            position: promptPosPositions[promptPosPositions.length - 1] + 1,
          },
        ];
        // console.log(id)
      }

      if (!isPositive && !state.curNegPromptArr.length) {
        state.curNegPromptArr = [
          { id: 0, position: 0, tag: actions.payload.value },
        ];
      } else if (!isPositive && !!state.curNegPromptArr.length) {
        state.curNegPromptArr = [
          ...state.curNegPromptArr,
          {
            id: allIds[allIds.length - 1] + 1,
            tag: actions.payload.value,
            position: promptPNegPositions[promptPNegPositions.length - 1] + 1,
          },
        ];
        // console.log(id)
      }

      //STRING

      const lastSimbol = prompt.slice(-1);

      if (isPositive) {
        state.curPrompt =
          lastSimbol === "," || !prompt.length
            ? `${prompt} ${actions.payload.value},`
            : `${prompt}, ${actions.payload.value},`;
      } else {
        state.curNegPrompt =
          lastSimbol === "," || !prompt.length
            ? `${prompt} ${actions.payload.value},`
            : `${prompt}, ${actions.payload.value},`;
      }
    },
    removeTag(state, actions) {
      const curPrompt =
        actions.payload.type === "positive"
          ? state.curPrompt
          : state.curNegPrompt;

      const promptArr = convertPromptToArr(curPrompt);

      let newPromt = promptArr.flatMap((word) => {
        if (word === actions.payload.value) return [];
        return word;
      });
      if (actions.payload.type === "positive") {
        state.curPrompt = newPromt.join(", ");
      } else {
        state.curNegPrompt = newPromt.join(", ");
      }
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
