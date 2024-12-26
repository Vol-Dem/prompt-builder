import { createSlice } from "@reduxjs/toolkit";

const generalSlice = createSlice({
  name: "general",
  initialState: {
    isMobile: false,
    headerIsFixed: false,
  },
  reducers: {
    setIsMobile(state, actions) {
      state.isMobile = actions.payload;
    },
    setHeaderIsFixed(state, actions) {
      state.headerIsFixed = actions.payload;
    },
  },
});

export const generalActions = generalSlice.actions;

export default generalSlice;
