import { createSlice } from "@reduxjs/toolkit";

const promptSlice = createSlice({
  name: "prompt",
  initialState: { curPrompt: "", negPrompt: "" },
  reducers: {
    setCurrentPrompt(state, actions) {
      // console.log(payload);
      state.curPrompt = actions.payload;
    },
    addTagToPrompt(state, actions) {
      // console.log();
      const prompt = state.curPrompt.trim();
      const lastSimbol = prompt.slice(-1);
      state.curPrompt =
        lastSimbol === "," || !prompt.length
          ? `${prompt} ${actions.payload},`
          : `${prompt}, ${actions.payload},`;
    },
  },
});

export const promptActions = promptSlice.actions;

export default promptSlice;
