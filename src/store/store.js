import { configureStore } from "@reduxjs/toolkit";
import promptSlice from "./prompt";
import tabsSlice from "./tabs";
import usedModelsSlice from "./usedModels";
import modelSlice from "./model";
import authSlice from "./auth";
import notificationSlice from "./notification";

const store = configureStore({
  reducer: {
    prompt: promptSlice.reducer,
    tabs: tabsSlice.reducer,
    used: usedModelsSlice.reducer,
    model: modelSlice.reducer,
    auth: authSlice.reducer,
    notification: notificationSlice.reducer,
  },
});

export default store;
