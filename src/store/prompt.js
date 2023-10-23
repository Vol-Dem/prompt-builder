import { createSlice } from "@reduxjs/toolkit";

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
      if (actions.payload.type === "positive") {
        const prompt = state.curPrompt.trim();
        const lastSimbol = prompt.slice(-1);
        const isInPrompt = prompt.includes(`${actions.payload.value}`);
        console.log(isInPrompt);
        if (isInPrompt) {
          let newPromt = prompt.replace(`${actions.payload.value}, `, "");
          newPromt = newPromt.replace(`${actions.payload.value},`, "");
          newPromt = newPromt.replace(`${actions.payload.value}`, "");
          state.curPrompt = newPromt;
        } else {
          state.curPrompt =
            lastSimbol === "," || !prompt.length
              ? `${prompt} ${actions.payload.value},`
              : `${prompt}, ${actions.payload.value},`;
        }
      }
      if (actions.payload.type === "negative") {
        const prompt = state.curNegPrompt.trim();
        const lastSimbol = prompt.slice(-1);
        const isInPrompt = prompt.includes(`${actions.payload.value}`);
        console.log(isInPrompt);
        if (isInPrompt) {
          let newPromt = prompt.replace(`${actions.payload.value}, `, "");
          newPromt = newPromt.replace(`${actions.payload.value},`, "");
          newPromt = newPromt.replace(`${actions.payload.value}`, "");
          state.curNegPrompt = newPromt;
        } else {
          state.curNegPrompt =
            lastSimbol === "," || !prompt.length
              ? `${prompt} ${actions.payload.value},`
              : `${prompt}, ${actions.payload.value},`;
        }
      }
    },
    addAllTagToPrompt(state, actions) {
      if (actions.payload.type === "positive") {
        const prompt = state.curPrompt.trim();
        const lastSimbol = prompt.slice(-1);
        const tagsArr = actions.payload.value
          .split(",")
          .flatMap((el) => (el.trim() ? el.trim() : []));
        const inPrompt = tagsArr.reduce((acc, cur) => {
          // console.log(cur, acc);
          return prompt.includes(`${cur.trim()}`) ? acc + 1 : acc;
        }, 0);
        const isAllInPrompt = inPrompt === tagsArr.length;
        console.log(tagsArr);
        console.log(inPrompt, isAllInPrompt);
        if (isAllInPrompt) {
          let newPromt = prompt;
          tagsArr.forEach((tagEl) => {
            newPromt = newPromt.replace(`${tagEl}, `, "");
            newPromt = newPromt.replace(`${tagEl},`, "");
            newPromt = newPromt.replace(`${tagEl}`, "");
          });
          state.curPrompt = newPromt;
        } else {
          let newPromt = prompt;
          tagsArr.forEach((tagEl) => {
            if (!prompt.includes(`${tagEl}`)) {
              newPromt =
                lastSimbol === "," || !prompt.length
                  ? `${newPromt} ${tagEl},`
                  : `${newPromt}, ${tagEl},`;
            }
          });
          state.curPrompt = newPromt;
        }
        // tagsArr.forEach((tagEl) => {
        //   const prompt = state.curPrompt.trim();
        //   const lastSimbol = prompt.slice(-1);
        //   const tag = tagEl.trim();
        //   const isInPrompt = prompt.includes(`${tag}`);
        //   if (isInPrompt) {
        //     let newPromt = prompt.replace(`${tag}, `, "");
        //     newPromt = newPromt.replace(`${tag},`, "");
        //     newPromt = newPromt.replace(`${tag}`, "");
        //     state.curPrompt = newPromt;
        //   } else {
        //     state.curPrompt =
        //       lastSimbol === "," || !prompt.length
        //         ? `${prompt} ${tag},`
        //         : `${prompt}, ${tag},`;
        //   }
        // });
      }
      if (actions.payload.type === "negative") {
        const prompt = state.curNegPrompt.trim();
        const lastSimbol = prompt.slice(-1);
        const isInPrompt = prompt.includes(`${actions.payload.value}`);
        console.log(isInPrompt);
        if (isInPrompt) {
          let newPromt = prompt.replace(`${actions.payload.value}, `, "");
          newPromt = newPromt.replace(`${actions.payload.value},`, "");
          newPromt = newPromt.replace(`${actions.payload.value}`, "");
          state.curNegPrompt = newPromt;
        } else {
          state.curNegPrompt =
            lastSimbol === "," || !prompt.length
              ? `${prompt} ${actions.payload.value},`
              : `${prompt}, ${actions.payload.value},`;
        }
      }
    },
    removeTag(state, actions) {
      let newPromt = state.curPrompt;
      newPromt = newPromt.replace(`${actions.payload}, `, "");
      newPromt = newPromt.replace(`${actions.payload},`, "");
      newPromt = newPromt.replace(`${actions.payload}`, "");
      state.curPrompt = newPromt;
    },
  },
});

export const promptActions = promptSlice.actions;

export default promptSlice;
