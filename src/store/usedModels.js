import { createSlice } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

import { saveToStorage, uploadStorage } from "../variables/utils";
import { authActions } from "./auth";
import firebaseApp from "../firebase-config";
import { SETTINGS_REF_IMAGE_AMOUNT } from "../variables/constants";
import { checkIsMobile } from "../utils/generalUtils";
import { checkIsVideo, getUrlId } from "../utils/imageUtils";

const firestore = getFirestore(firebaseApp);

const auth = getAuth(firebaseApp);

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
      // if (action.payload) {
      //   state.fullCardView = action.payload.fullCardView;
      // } else {
      //   state.fullCardView = !state.fullCardView;
      // }
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
      .addCase(authActions.logout, (state) => {
        state.models = [];
        state.panelIsOpen = true;
        state.fullCardView = true;
      })
      .addCase(usedModelsActions.panelState, (state) => {
        const uid = auth.currentUser.uid;
        saveToStorage(`${uid}-side-state`, `${state.panelIsOpen}`);
      })
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
        }
      );
  },
});

export const removeModelFromPanel = (id) => {
  return (dispatch, getState) => {
    const curModels = getState().used.models;
    const newModels = curModels.filter((model) => model.id !== id);

    dispatch(usedModelsActions.addModelsToPanel(newModels));
  };
};

export const addModelToPanel = (data) => {
  return (dispatch, getState) => {
    const curModels = getState().used.models;
    const modelIsInPanel = getState().used.models.some(
      (model) => model.id === data.id
    );

    if (!modelIsInPanel) {
      const newModels = [...curModels, data];

      dispatch(usedModelsActions.addModelsToPanel(newModels));
    }
  };
};

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
    if (Object.hasOwn(storagePanelState, "panelIsOpen")) {
      dispatch(
        usedModelsActions.panelState(
          !checkIsMobile() ? storagePanelState?.panelIsOpen : false
        )
      );
    } else if (!checkIsMobile()) {
      dispatch(usedModelsActions.panelState({ panelIsOpen: true }));
    }

    // if (storageViewState)
    //   dispatch(usedModelsActions.cardViewState(storageViewState));
  };
};

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
      }
    );
  };
};

export const usedModelsActions = usedModelsSlice.actions;

export default usedModelsSlice;
