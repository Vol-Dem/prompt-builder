import { configureStore } from "@reduxjs/toolkit";
import promptSlice from "./prompt";
import tabsSlice from "./tabs";
import usedModelsSlice from "./usedModels";
import modelSlice from "./model";
import authSlice from "./auth";
import notificationSlice from "./notification";
import searchSlice from "./search";
import uploadSlice from "./upload";
import guideSlice from "./guide";

const store = configureStore({
  reducer: {
    prompt: promptSlice.reducer,
    tabs: tabsSlice.reducer,
    used: usedModelsSlice.reducer,
    model: modelSlice.reducer,
    auth: authSlice.reducer,
    search: searchSlice.reducer,
    notification: notificationSlice.reducer,
    upload: uploadSlice.reducer,
    guide: guideSlice.reducer,
  },
});

export default store;
