import { isAction, type Middleware } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";

import firebaseApp from "../firebase-config";
import { saveToStorage } from "../utils/generalUtils";
import type { PromptState } from "../types/prompt.types";
import type { RightSidebarState } from "../types/sidebar.types";

const auth = getAuth(firebaseApp);

type SessionPersistenceState = {
  prompt: PromptState;
  used: RightSidebarState;
};

/** Persists completed state synchronously, before outer listeners run. */
export const sessionPersistenceMiddleware: Middleware<{}, SessionPersistenceState> =
  (api) => (next) => (action) => {
    const result = next(action);
    if (!isAction(action)) return result;

    const isPromptAction = action.type.startsWith("prompt/");
    const isSidebarAction = action.type.startsWith("used/");
    if (!isPromptAction && !isSidebarAction) return result;

    // Keep the Firebase guard: Redux logout can precede Firebase sign-out.
    const uid = auth?.currentUser?.uid;
    if (!uid) return result;

    const state = api.getState();
    if (isPromptAction) {
      saveToStorage(`${uid}-prompt`, state.prompt.curPrompt);
      saveToStorage(`${uid}-neg-prompt`, state.prompt.curNegPrompt);
      saveToStorage(`${uid}-prompt-state`, {
        promptIsOpen: state.prompt.promptIsOpen,
      });
      saveToStorage(`${uid}-prompt-text`, {
        isTextMode: state.prompt.isTextMode,
      });
    } else {
      saveToStorage(`${uid}-side`, state.used.models);
      saveToStorage(`${uid}-side-img`, state.used.images);
      saveToStorage(`${uid}-side-state`, {
        panelIsOpen: state.used.panelIsOpen,
      });
      saveToStorage(`${uid}-side-view`, {
        fullCardView: state.used.fullCardView,
      });
    }

    return result;
  };
