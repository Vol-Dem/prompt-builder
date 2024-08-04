import { createSlice } from "@reduxjs/toolkit";
import { authActions } from "./auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase-config";
import { saveToStorage, uploadStorage } from "../variables/utils";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

const promptSlice = createSlice({
  name: "prompt",
  initialState: {
    curPrompt: "",
    curNegPrompt: "",
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
    },
    setPresets(state, actions) {
      // console.log(actions.payload);
      if (actions?.payload) state.presets = actions.payload;
    },
    setPromptIsOpen(state, actions) {
      state.promptIsOpen = actions.payload;
    },
    setTextMode(state, actions) {
      state.isTextMode = actions.payload;
    },
    addTagToPrompt(state, actions) {
      const isPositive = actions.payload.type === "positive";
      const prompt = isPositive
        ? state.curPrompt.trim()
        : state.curNegPrompt.trim();

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

      const promptArr = curPrompt
        ?.split(splitRegEx)
        ?.flatMap((tag) => tag.trim() || []);

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
      console.log(actions.payload);
      const isPositive = actions.payload.type === "positive";
      const prompt = isPositive
        ? state.curPrompt.trim()
        : state.curNegPrompt.trim();

      const lastSimbol = prompt.slice(-1);

      const promptArr = prompt
        ?.split(splitRegEx)
        ?.flatMap((tag) => tag.trim() || []);

      const newWords = actions.payload?.value?.filter((newWord) => {
        const isInPrompt = promptArr.find(
          (promptWord) => promptWord === newWord
        );
        return !isInPrompt;
      });
      console.log(newWords);
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
      console.log(actions.payload);
      const curPrompt =
        actions.payload.type === "positive"
          ? state.curPrompt
          : state.curNegPrompt;

      const promptArr = curPrompt
        ?.split(splitRegEx)
        ?.flatMap((tag) => tag.trim() || []);

      let newPromt = promptArr.flatMap((word) => {
        // const isInPrompt = word === actions.payload.value
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
      const promptArr = state.curPrompt
        ?.split(splitRegEx)
        ?.flatMap((tag) => tag.trim() || []);

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
      console.log(err);
    }
    // const uid = getState().auth.user.uid;
  };
};

export const promptActions = promptSlice.actions;

export default promptSlice;
