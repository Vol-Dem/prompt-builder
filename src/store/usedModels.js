import { createSlice } from "@reduxjs/toolkit";

const usedModelsSlice = createSlice({
  name: "used",
  initialState: { models: [], panelIsOpen: true },
  reducers: {
    addModelToPanel(state, actions) {
      const modelIsUsed = state.models.some(
        (model) => model.id === actions.payload.id
      );
      if (!modelIsUsed) {
        state.models.push(actions.payload);
      }
    },
    removeModel(state, actions) {
      const modelIndex = state.models.findIndex(
        (model) => model.id === actions.payload
      );
      state.models.splice(modelIndex, 1);
    },
    panelState(state, actions) {
      state.panelIsOpen = actions.payload;
    },
  },
});

export const usedModelsActions = usedModelsSlice.actions;

export default usedModelsSlice;
