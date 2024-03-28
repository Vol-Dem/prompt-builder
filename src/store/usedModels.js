import { createSlice } from "@reduxjs/toolkit";
import { saveToStorage, uploadStorage } from "../variables/utils";
import { authActions } from "./auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase-config";

const auth = getAuth(firebaseApp);

const usedModelsSlice = createSlice({
  name: "used",
  initialState: { models: [], panelIsOpen: true, fullCardView: true },
  reducers: {
    addModelsToPanel(state, actions) {
      state.models = actions.payload;
    },
    panelState(state, actions) {
      if (actions.payload) {
        state.panelIsOpen = actions.payload.panelIsOpen;
      } else {
        state.panelIsOpen = !state.panelIsOpen;
      }
    },
    cardViewState(state, actions) {
      if (actions.payload) {
        state.fullCardView = actions.payload.fullCardView;
      } else {
        state.fullCardView = !state.fullCardView;
      }
    },
    clearPanel(state, actions) {
      state.models = [];
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
        console.log("SAVE");
        saveToStorage(`${uid}-side-state`, `${state.panelIsOpen}`);
      })
      .addMatcher(
        (action) => action.type.startsWith("used/"),
        (state, action) => {
          const uid = auth.currentUser.uid;
          saveToStorage(`${uid}-side`, state.models);
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
    // const uid = getState().auth.user.uid;
    const curModels = getState().used.models;
    const newModels = curModels.filter((model) => model.id !== id);

    // saveToStorage(`${uid}-side`, newModels);
    dispatch(usedModelsActions.addModelsToPanel(newModels));
  };
};

export const addModelToPanel = (data) => {
  return (dispatch, getState) => {
    // const uid = getState().auth.user.uid;
    const curModels = getState().used.models;
    const modelIsInPanel = getState().used.models.some(
      (model) => model.id === data.id
    );

    if (!modelIsInPanel) {
      const newModels = [...curModels, data];
      // saveToStorage(`${uid}-side`, newModels);
      dispatch(usedModelsActions.addModelsToPanel(newModels));
    }
  };
};

export const uploadPanelStateFromStorage = () => {
  return (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const storageData = uploadStorage(`${uid}-side`);
    const storagePanelState = uploadStorage(`${uid}-side-state`);
    const storageViewState = uploadStorage(`${uid}-side-view`);
    // console.log(storageData);

    if (storageData) dispatch(usedModelsActions.addModelsToPanel(storageData));
    if (storagePanelState)
      dispatch(usedModelsActions.panelState(storagePanelState));
    if (storageViewState)
      dispatch(usedModelsActions.cardViewState(storageViewState));
  };
};

export const usedModelsActions = usedModelsSlice.actions;

export default usedModelsSlice;
