import { createSlice } from "@reduxjs/toolkit";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../firebase-config";

const firestore = getFirestore(firebaseApp);

const notificationSlice = createSlice({
  name: "notification",
  // initialState: { isShown: false, title: "", message: "" },
  initialState: { maintenance: false, notifications: [] },
  reducers: {
    setNotifications(state, actions) {
      console.log(actions.payload);
      state.notifications = actions.payload.map((message) => {
        return {
          ...message,
          readed: false,
        };
      });
    },
    setMaintenance(state, actions) {
      state.maintenance = actions.payload;
    },
    showNotification(state, actions) {
      state.isShown = true;
      state.title = actions.payload.title;
      state.message = actions.payload.message;
    },
    closeNotification(state) {
      state.isShown = false;
    },
  },
});

export const getAppInfo = () => {
  return async (dispatch, getState) => {
    try {
      const appInfoRef = doc(firestore, "application", "info");

      const appInfoDoc = await getDoc(appInfoRef);
      if (appInfoDoc.exists()) {
        const appData = appInfoDoc.data();
        dispatch(notificationActions.setNotifications(appData.notifications));
        dispatch(notificationActions.setMaintenance(appData.maintenance));
      }
    } catch (err) {
      console.error(err.message);
      // dispatch(authActions.setUserDataLoadError(err.message));
    }
  };
};

export const notificationActions = notificationSlice.actions;

export default notificationSlice;
