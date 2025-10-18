import { createSlice } from "@reduxjs/toolkit";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../firebase-config";

const firestore = getFirestore(firebaseApp);

const notificationSlice = createSlice({
  name: "notification",
  initialState: { maintenance: false, notifications: [] },
  reducers: {
    setNotifications(state, action) {
      state.notifications = action.payload.map((message) => {
        return {
          ...message,
          readed: false,
        };
      });
    },
    setMaintenance(state, action) {
      state.maintenance = action.payload;
    },
    showNotification(state, action) {
      state.isShown = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
    },
    closeNotification(state) {
      state.isShown = false;
    },
  },
});

export const getAppInfo = () => {
  return async (dispatch) => {
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
    }
  };
};

export const notificationActions = notificationSlice.actions;

export default notificationSlice;
