import { createSlice } from "@reduxjs/toolkit";

const tabsSlice = createSlice({
  name: "tabs",
  initialState: {
    currTab: "",
    currCategory: "",
    currSubcategory: "",
    categoriesData: [],
    modelsData: [],
    subcategories: [],
  },
  reducers: {
    setCurrentTab(state, actions) {
      state.currTab = actions.payload;
    },
    setCurrentCategory(state, actions) {
      state.currCategory = actions.payload;
    },
    setCurrentSubcategory(state, actions) {
      state.currSubcategory = actions.payload;
    },
    setCategories(state, actions) {
      state.categoriesData = actions.payload;
    },
    setModelsData(state, actions) {
      state.modelsData = actions.payload;
    },
    setSubcategories(state, actions) {
      state.subcategories = actions.payload;
    },
    reset(state, actions) {
      //   state.currTab = "";
      state.currCategory = "";
      state.currSubcategory = "";
      state.categoriesData = [];
      state.subcategories = [];
    },
  },
});

export const tabActions = tabsSlice.actions;

export default tabsSlice;
