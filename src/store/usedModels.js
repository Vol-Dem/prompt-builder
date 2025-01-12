import { createSlice } from "@reduxjs/toolkit";
import { saveToStorage, uploadStorage } from "../variables/utils";
import { authActions } from "./auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase-config";
import { SETTINGS_REF_IMAGE_AMOUNT } from "../variables/constants";
import { checkIsMobile } from "../utils/generalUtils";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

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
    addModelsToPanel(state, actions) {
      state.models = actions.payload;
    },
    addImagesToPanel(state, actions) {
      state.images = actions.payload;
    },
    setFormIsOpen(state, actions) {
      state.formIsOpen = actions.payload;
    },
    panelState(state, actions) {
      state.panelIsOpen = actions.payload;
    },
    cardViewState(state, actions) {
      state.fullCardView = actions.payload;
      // if (actions.payload) {
      //   state.fullCardView = actions.payload.fullCardView;
      // } else {
      //   state.fullCardView = !state.fullCardView;
      // }
    },
    clearPanel(state, actions) {
      state.models = [];
      state.images = [];
    },
    setSidePanelWidth(state, actions) {
      state.sidePanelWidth = actions.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authActions.logout, (state, actions) => {
        state.models = [];
        state.panelIsOpen = true;
        state.fullCardView = true;
      })
      .addCase(usedModelsActions.panelState, (state, actions) => {
        const uid = auth.currentUser.uid;
        saveToStorage(`${uid}-side-state`, `${state.panelIsOpen}`);
      })
      .addMatcher(
        (action) => action.type.startsWith("used/"),
        (state, action) => {
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

export const addImageToPanel = (data) => {
  return (dispatch, getState) => {
    const curImages = getState().used.images;
    const imageIsInPanel = getState().used.images.some(
      (image) => image.hash === data.hash
    );

    if (!imageIsInPanel && curImages?.length < SETTINGS_REF_IMAGE_AMOUNT) {
      const newImages = [...curImages, data];
      dispatch(usedModelsActions.addImagesToPanel(newImages));
    }
  };
};

export const removeImageFromPanel = (hash) => {
  return (dispatch, getState) => {
    const curImages = getState().used.images;
    const newImages = curImages.filter((image) => image.hash !== hash);

    dispatch(usedModelsActions.addImagesToPanel(newImages));
  };
};

export const uploadPanelStateFromStorage = () => {
  return (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const storageData = uploadStorage(`${uid}-side`);
    const storageImgData = uploadStorage(`${uid}-side-img`);
    const storagePanelState = uploadStorage(`${uid}-side-state`);
    const storageViewState = uploadStorage(`${uid}-side-view`);

    if (storageData) dispatch(usedModelsActions.addModelsToPanel(storageData));
    if (storageImgData)
      dispatch(usedModelsActions.addImagesToPanel(storageImgData));
    if (storagePanelState?.hasOwnProperty("panelIsOpen")) {
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
