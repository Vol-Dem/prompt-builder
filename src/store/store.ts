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
import generalSlice from "./general";
import imagesSlice from "./images";
import { authListener } from "./authListener";

const store = configureStore({
  reducer: {
    general: generalSlice.reducer,
    prompt: promptSlice.reducer,
    tabs: tabsSlice.reducer,
    used: usedModelsSlice.reducer,
    model: modelSlice.reducer,
    auth: authSlice.reducer,
    search: searchSlice.reducer,
    notification: notificationSlice.reducer,
    upload: uploadSlice.reducer,
    guide: guideSlice.reducer,
    images: imagesSlice.reducer,
  },
  middleware: (getDefault) => getDefault().prepend(authListener.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState,
) => ReturnType;

export default store;
