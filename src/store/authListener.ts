import { createListenerMiddleware } from "@reduxjs/toolkit";

import { stopUserDataSubscription } from "./authSession";
import { initializeAuthAppCheck, signOutAuthUser } from "../utils/fetch/fetchAuth";
import { imagesActions } from "./images";
import { modelActions } from "./model";
import { promptActions } from "./prompt";
import { tabActions } from "./tabs";
import { usedModelsActions } from "./usedModels";

/**
 * Authentication lifecycle listeners.
 *
 * This middleware centralizes all authentication-related side effects
 * that must happen when auth state changes.
 *
 * Responsibilities:
 * - Initialize Firebase App Check on login
 * - Sign out the user from Firebase
 * - Unsubscribe from user data listeners
 * - Reset all user-scoped Redux state on logout
 * - Prevent stale async updates after logout
 *
 * This replaces auth-related side effects previously implemented in reducers,
 * thunks, and extraReducers.
 */
export const authListener = createListenerMiddleware();

/**
 * Handles application-wide logout flow.
 *
 * Triggered by the `auth/logout` action.
 *
 * Side effects:
 * - Cancels all active listener tasks
 * - Signs out the user from Firebase
 * - Unsubscribes Firestore user listeners
 * - Clears all user-dependent Redux state (images, models, prompt, UI, etc.)
 */
authListener.startListening({
  type: "auth/logout",
  effect: async (_, api) => {
    api.cancelActiveListeners(); // kill pending async listeners

    // Firebase auth sign out
    signOutAuthUser();
    stopUserDataSubscription();

    api.dispatch(imagesActions.resetCollectionListState());
    api.dispatch(imagesActions.setImageCategories([]));
    api.dispatch(modelActions.resetModelData());
    api.dispatch(modelActions.setActiveCarouselData(null));
    api.dispatch(promptActions.clearPrompt());
    api.dispatch(promptActions.setPromptIsOpen(false));
    api.dispatch(tabActions.resetActiveTabs());
    api.dispatch(tabActions.reset());
    api.dispatch(tabActions.resetModelsData());
    api.dispatch(usedModelsActions.clearPanel());
    api.dispatch(usedModelsActions.panelState(false));
  },
});

/**
 * Initializes Firebase App Check when a user logs in.
 *
 * Triggered by the `auth/login` action.
 *
 * Side effects:
 * - Enables App Check
 * - Starts automatic token refresh
 */
authListener.startListening({
  type: "auth/login",
  effect: async () => {
    initializeAuthAppCheck();
  },
});
