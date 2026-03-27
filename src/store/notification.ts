import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { doc, getDoc, getFirestore } from "firebase/firestore";

import firebaseApp from "../firebase-config";
import type { AppThunk } from "./store";
import type {
  NotificationData,
  NotificationState,
} from "../types/notification.types";
import { handleErrors, normalizeError } from "../utils/generalUtils";

const firestore = getFirestore(firebaseApp);

/**
 * Application notification state.
 *
 * Controls:
 * - Maintenance mode
 * - Global notifications
 *
 * State:
 * @property {boolean} maintenance - Whether maintenance mode is enabled.
 * @property {NotificationState[]} notifications - List of notification messages.
 */
const notificationSlice = createSlice({
  name: "notification",
  initialState: { maintenance: false, notifications: [] } as NotificationState,
  reducers: {
    /**
     * Sets notification list and marks all notifications as unread.
     *
     * @param {Array<Object>} action.payload - List of notification objects.
     */
    setNotifications(state, action: PayloadAction<NotificationData[]>) {
      state.notifications = action.payload.map((message) => {
        return {
          ...message,
          read: false,
        };
      });
    },
    setMaintenance(state, action) {
      state.maintenance = action.payload;
    },
  },
});

/**
 * Fetches application info.
 *
 * Side effects:
 * - Loads application info from Firestore
 * - Updates maintenance mode and notifications
 *
 * @returns {Function} Redux thunk.
 */
export const getAppInfo = (): AppThunk => {
  return async (dispatch) => {
    try {
      const appInfoRef = doc(firestore, "application", "info");

      const appInfoDoc = await getDoc(appInfoRef);
      if (appInfoDoc.exists()) {
        const appData = appInfoDoc.data();

        dispatch(notificationActions.setNotifications(appData.notifications));
        dispatch(notificationActions.setMaintenance(appData.maintenance));
      }
    } catch (error) {
      handleErrors(normalizeError(error));
    }
  };
};

export const notificationActions = notificationSlice.actions;

export default notificationSlice;
