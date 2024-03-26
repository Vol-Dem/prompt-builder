import { createSlice } from "@reduxjs/toolkit";

const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

const promptSlice = createSlice({
  name: "prompt",
  initialState: { curPrompt: "", curNegPrompt: "" },
  reducers: {
    setCurrentPrompt(state, actions) {
      state.curPrompt = actions.payload;
    },
    setCurrentNegPrompt(state, actions) {
      state.curNegPrompt = actions.payload;
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

      const newWords = actions.payload.value.filter((newWord) => {
        const isInPrompt = promptArr.find(
          (promptWord) => promptWord === newWord
        );
        return !isInPrompt;
      });
      console.log(newWords);
      if (isPositive && !!newWords.length) {
        state.curPrompt =
          lastSimbol === "," || !prompt.length
            ? `${prompt} ${newWords.join(", ")},`
            : `${prompt}, ${newWords.join(", ")},`;
      } else if (!isPositive && !!newWords.length) {
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
});

export const promptActions = promptSlice.actions;

export default promptSlice;
