import { createSlice } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

import { saveToStorage, uploadStorage } from "../utils/generalUtils";
import { authActions } from "./auth";
import firebaseApp from "../firebase-config";
import { SETTINGS_REF_IMAGE_AMOUNT } from "../variables/constants";
import { checkIsMobile } from "../utils/generalUtils";
import { checkIsVideo, getUrlId } from "../utils/imageUtils";

const firestore = getFirestore(firebaseApp);

const auth = getAuth(firebaseApp);

/**
 * Right sidebar state.
 *
 * Controls:
 * - Right sidebar
 *
 * State:
 * @property {Array<Object>} models - List of models in the sidebar.
 * @property {Array<Object>} images - List of images in the sidebar.
 * @property {boolean} panelIsOpen - Whether the sidebar is open.
 * @property {boolean} formIsOpen - Whether the sidebar form is open.
 * @property {boolean} fullCardView - Whether the sidebar shows full or compact cards.
 * @property {number|null} sidePanelWidth - Width of the sidebar.
 */
const usedModelsSlice = createSlice({
  name: "used",
  initialState: {
    models: [],
    images: [],
    panelIsOpen: false,
    formIsOpen: false,
    fullCardView: false,
    sidePanelWidth: null,
  },
  reducers: {
    addModelsToPanel(state, action) {
      state.models = action.payload;
    },
    addImagesToPanel(state, action) {
      state.images = action.payload;
    },
    setFormIsOpen(state, action) {
      state.formIsOpen = action.payload;
    },
    panelState(state, action) {
      state.panelIsOpen = action.payload;
    },
    cardViewState(state, action) {
      state.fullCardView = action.payload;
    },
    clearPanel(state) {
      state.models = [];
      state.images = [];
    },
    setSidePanelWidth(state, action) {
      state.sidePanelWidth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /**
       * Resets sidebar state on logout.
       *
       * Listens to the logout action and clears sidebar-related state.
       */
      .addCase(authActions.logout, (state) => {
        state.models = [];
        state.panelIsOpen = true;
        state.fullCardView = true;
      })
      /**
       * Persists sidebar state to session storage.
       *
       * Listens to all actions that start with `used/`
       * and saves sidebar state to session storage.
       */
      .addMatcher(
        (action) => action.type.startsWith("used/"),
        (state) => {
          const uid = auth?.currentUser?.uid;
          if (!uid) return;
          saveToStorage(`${uid}-side`, state.models);
          saveToStorage(`${uid}-side-img`, state.images);
          saveToStorage(`${uid}-side-state`, {
            panelIsOpen: state.panelIsOpen,
          });
          saveToStorage(`${uid}-side-view`, {
            fullCardView: state.fullCardView,
          });
        },
      );
  },
});

/**
 * Removes a model from the sidebar.
 *
 * @param {number} id - Model ID.
 * @returns {Function} Redux thunk.
 */
export const removeModelFromPanel = (id) => {
  return (dispatch, getState) => {
    const curModels = getState().used.models;
    const newModels = curModels.filter((model) => model.id !== id);

    dispatch(usedModelsActions.addModelsToPanel(newModels));
  };
};

/**
 * Adds a model to the sidebar if it is not already present.
 *
 * @param {Object} data - Model data.
 * @returns {Function} Redux thunk.
 */
export const addModelToPanel = (data) => {
  return (dispatch, getState) => {
    const curModels = getState().used.models;
    const modelIsInPanel = getState().used.models.some(
      (model) => model.id === data.id,
    );

    if (!modelIsInPanel) {
      const newModels = [...curModels, data];

      dispatch(usedModelsActions.addModelsToPanel(newModels));
    }
  };
};

/**
 * Adds an image to the sidebar.
 *
 * Side effects:
 * - Adds the image only if it is not already present.
 * - Limits the number of images to SETTINGS_REF_IMAGE_AMOUNT.
 *
 * @param {Object} data - Image data.
 * @param {string} url - Image URL.
 * @returns {Function} Redux thunk.
 */
export const addImageToPanel = (data, url) => {
  return (dispatch, getState) => {
    const curImages = getState().used.images;
    const imageIsInPanel = getState().used.images.some((image) => {
      if (image?.type === "video" || (url && checkIsVideo(url))) {
        const uniqUrlPart = getUrlId(url);
        return image.url.includes(uniqUrlPart);
      }
      return image.hash === data.hash;
    });

    if (!imageIsInPanel && curImages?.length < SETTINGS_REF_IMAGE_AMOUNT) {
      const newImages = [...curImages, data];
      dispatch(usedModelsActions.addImagesToPanel(newImages));
    }
  };
};

/**
 * Removes an image from the sidebar.
 *
 * @param {string} hash - Image hash.
 * @param {string} url - Image URL.
 * @returns {Function} Redux thunk.
 */
export const removeImageFromPanel = (hash, url) => {
  return (dispatch, getState) => {
    const curImages = getState().used.images;
    const newImages = curImages.filter((image) => {
      if (image?.type === "video" || (url && checkIsVideo(url))) {
        const uniqUrlPart = getUrlId(url);
        return !image.url.includes(uniqUrlPart);
      }
      return image.hash !== hash;
    });

    dispatch(usedModelsActions.addImagesToPanel(newImages));
  };
};

/**
 * Loads sidebar state from session storage.
 *
 * Side effects:
 * - Reads sidebar data from session storage.
 * - Updates sidebar state in Redux.
 *
 * @returns {Function} Redux thunk.
 */
export const uploadPanelStateFromStorage = () => {
  return (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const storageData = uploadStorage(`${uid}-side`);
    const storageImgData = uploadStorage(`${uid}-side-img`);
    const storagePanelState = uploadStorage(`${uid}-side-state`);
    // const storageViewState = uploadStorage(`${uid}-side-view`);

    if (storageData) dispatch(usedModelsActions.addModelsToPanel(storageData));
    if (storageImgData)
      dispatch(usedModelsActions.addImagesToPanel(storageImgData));
    if (storagePanelState && Object.hasOwn(storagePanelState, "panelIsOpen")) {
      dispatch(
        usedModelsActions.panelState(
          !checkIsMobile() ? storagePanelState?.panelIsOpen : false,
        ),
      );
    } else if (!checkIsMobile()) {
      dispatch(usedModelsActions.panelState({ panelIsOpen: true }));
    }
  };
};

/**
 * Changes between compact and full sidebar card view.
 *
 * Side effects:
 * - Saves the view state to Firestore.
 * - Updates the view state in Redux.
 *
 * @param {boolean} isFullView - Whether full card view is enabled.
 * @returns {Function} Redux thunk.
 */
export const switchSidePanelfullView = (isFullView) => {
  return async (dispatch, getState) => {
    dispatch(usedModelsActions.cardViewState(isFullView));
    const uid = getState().auth.user.uid;
    const userRef = doc(firestore, "users", uid);
    await updateDoc(
      userRef,
      {
        "uiState.sidePanelCardfullView": isFullView,
      },
      {
        merge: true,
      },
    );
  };
};

export const usedModelsActions = usedModelsSlice.actions;

export default usedModelsSlice;
