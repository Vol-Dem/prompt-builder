import { configureStore } from "@reduxjs/toolkit";
import promptSlice from "./prompt";
import tabsSlice from "./tabs";
import usedModelsSlice from "./usedModels";
import modelSlice from "./model";

const store = configureStore({
  reducer: {
    prompt: promptSlice.reducer,
    tabs: tabsSlice.reducer,
    used: usedModelsSlice.reducer,
    model: modelSlice.reducer,
  },
});

export default store;
