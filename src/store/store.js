import { configureStore } from "@reduxjs/toolkit";
import promptSlice from "./prompt";
import tabsSlice from "./tabs";
import usedModelsSlice from "./usedModels";

const store = configureStore({
  reducer: {
    prompt: promptSlice.reducer,
    tabs: tabsSlice.reducer,
    used: usedModelsSlice.reducer,
  },
});

export default store;
