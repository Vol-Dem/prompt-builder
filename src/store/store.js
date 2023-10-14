import { configureStore } from "@reduxjs/toolkit";
import promptSlice from "./prompt";
import tabsSlice from "./tabs";

const store = configureStore({
  reducer: {
    prompt: promptSlice.reducer,
    tabs: tabsSlice.reducer,
  },
});

export default store;
