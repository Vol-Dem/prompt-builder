import { createSlice } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import firebaseApp from "../firebase-config";

const firestore = getFirestore(firebaseApp);

let lastVisible = {};

const amountPerPage = 6;

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
    isLoading: false,
    isLastPage: false,
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
      lastVisible = {};
      state.modelsData = [];
      state.isLastPage = false;
      state.currSubcategory = actions.payload;
    },
    setCategories(state, actions) {
      state.categoriesData = actions.payload;
    },
    setModelsData(state, actions) {
      console.log("P", actions.payload);
      state.modelsData = !actions.payload.length
        ? []
        : [...state.modelsData, ...actions.payload];
    },
    setSubcategories(state, actions) {
      state.subcategories = actions.payload.sort();
    },
    setIsLoading(state, actions) {
      state.isLoading = actions.payload;
    },
    setIsLastPage(state, actions) {
      state.isLastPage = actions.payload;
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
    try {
      const userRef = doc(firestore, "users", uid);

      const categoriesDoc = await getDoc(userRef);
      if (categoriesDoc.exists()) {
        const categoriesData = categoriesDoc.data();
        dispatch(tabActions.setCategories(categoriesData.categoriesById));
      }
    } catch (err) {
      console.log(err);
    }
    // const uid = getState().auth.user.uid;
  };
};

export const getModelsPreview = () => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const activeTab = getState().tabs.currTab;
    const activeCategory = getState().tabs.currCategory;
    const activeSubcategory = getState().tabs.currSubcategory;
    const isLastPage = getState().tabs.isLastPage;
    console.log("GET");
    console.log(uid);
    console.log(activeTab);
    console.log(activeCategory);
    console.log(activeSubcategory);
    console.log(isLastPage);
    console.log(lastVisible);
    if (isLastPage) return;

    dispatch(tabActions.setIsLoading(true));
    const q = query(
      collection(firestore, "users", uid, `preview`),
      where("modelType", "==", activeTab),
      where("main", "==", activeCategory),
      where("sub", "array-contains", activeSubcategory),
      orderBy("id", "desc"),
      startAfter(lastVisible),
      limit(amountPerPage)
    );
    const querySnapshot = await getDocs(q);

    const modelsData = querySnapshot.docs.map((doc) => {
      // doc.data() is never undefined for query doc snapshots
      return doc.data();
    });
    console.log(modelsData);

    // const isLast = querySnapshot.docs.length <= amountPerPage;
    const isLast =
      !querySnapshot.docs.length || querySnapshot.docs.length < amountPerPage;
    console.log(isLast);

    if (!isLast) {
      lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    if (!!modelsData.length) dispatch(tabActions.setModelsData(modelsData));
    dispatch(tabActions.setIsLastPage(isLast));
    dispatch(tabActions.setIsLoading(false));
  };
};

export const tabActions = tabsSlice.actions;

export default tabsSlice;
