import { createSlice } from "@reduxjs/toolkit";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../firebase-config";

const firestore = getFirestore(firebaseApp);

const tabsSlice = createSlice({
  name: "tabs",
  initialState: {
    currTab: "",
    currCategory: "",
    currSubcategory: "",
    allCategories: [],
    categoriesData: "",
    modelsData: [],
    subcategories: [],
  },
  reducers: {
    setCurrentTab(state, actions) {
      state.currSubcategory = "";
      state.currCategory = "";
      state.modelsData = [];
      state.currTab = actions.payload;
    },
    setCurrentCategory(state, actions) {
      state.currSubcategory = "";
      state.modelsData = [];
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
      state.subcategories = actions.payload.sort();
    },
    reset(state, actions) {
      state.currCategory = "";
      state.currSubcategory = "";
      state.categoriesData = [];
      state.subcategories = [];
    },
  },
});

export const getUserCategories = (uid) => {
  return async (dispatch, getState) => {
    // const uid = getState().auth.user.uid;
    const userRef = doc(firestore, "users", uid);

    const categoriesDoc = await getDoc(userRef);
    if (categoriesDoc.exists()) {
      const categoriesData = categoriesDoc.data();
      dispatch(tabActions.setCategories(categoriesData.categoriesById));
    }
  };
};

export const tabActions = tabsSlice.actions;

export default tabsSlice;
