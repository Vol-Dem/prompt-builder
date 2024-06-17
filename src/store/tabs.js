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
    // modelsData: [],
    modelsData: {
      tab: "",
      category: "",
      subcategory: "",
      nsfw: false,
      previews: [],
    },
    subcategories: [],
    sortBy: "createdAt",
    modelType: "",
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
    setSortBy(state, actions) {
      state.sortBy = actions.payload;
    },
    setModelType(state, actions) {
      state.modelType = actions.payload;
    },
    // setModelsData(state, actions) {
    //   console.log("P", actions.payload);
    //   state.modelsData = !actions.payload.length
    //     ? []
    //     : [...state.modelsData, ...actions.payload];
    // },
    setModelsData(state, actions) {
      console.log("P", actions.payload);
      state.modelsData = actions.payload;
    },
    resetModelsData(state, actions) {
      state.modelsData = {
        tab: "",
        category: "",
        subcategory: "",
        nsfw: false,
        previews: [],
      };
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
    resetActiveTabs(state, actions) {
      state.currTab = "";
      state.currCategory = "";
      state.currSubcategory = "";
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

export const getModelsPreview = (loadMore = false, nsfwMode) => {
  return async (dispatch, getState) => {
    try {
      if (!loadMore) {
        lastVisible = {};
        dispatch(tabActions.setIsLastPage(false));
      }
      const uid = getState().auth.user.uid;
      const activeTab = getState().tabs.currTab;
      const activeCategory = getState().tabs.currCategory;
      const activeSubcategory = getState().tabs.currSubcategory;
      const isLastPage = getState().tabs.isLastPage;
      const sortBy = getState().tabs.sortBy;
      const baseModel = getState().tabs.modelType;
      const curModelsData = getState().tabs.modelsData.previews;
      // const nsfwMode = getState().model.nsfwMode;
      console.log("GET");
      console.log(uid);
      console.log(activeTab);
      console.log(activeCategory);
      console.log(activeSubcategory);
      console.log(isLastPage);
      console.log(lastVisible);
      console.log(loadMore);
      if (isLastPage) return;

      dispatch(tabActions.setIsLoading(true));
      console.log(sortBy);
      const direction = sortBy === "name" ? "asc" : "desc";
      console.log(direction);
      const order = orderBy(sortBy, direction);
      // const order = orderBy("name", "asc");
      // const modelTypeBy = orderBy(sortBy, "desc");
      let q;

      const nsfwFilter = !nsfwMode ? [false] : [true, false];

      if (baseModel) {
        q = query(
          collection(firestore, "users", uid, `preview`),
          where("modelType", "==", activeTab),
          where("main", "==", activeCategory),
          where("baseModel", "==", baseModel),
          where("nsfw", "in", nsfwFilter),
          where("sub", "array-contains", activeSubcategory),
          // where("baseModels", "array-contains-any", ["SD 1.5"]),
          // orderBy("id", "desc"),
          order,
          startAfter(lastVisible),
          limit(amountPerPage)
        );
      } else {
        q = query(
          collection(firestore, "users", uid, `preview`),
          where("modelType", "==", activeTab),
          where("main", "==", activeCategory),
          where("nsfw", "in", nsfwFilter),
          where("sub", "array-contains", activeSubcategory),
          // where("baseModels", "array-contains-any", ["SD 1.5"]),
          // orderBy("id", "desc"),
          order,
          startAfter(lastVisible),
          limit(amountPerPage)
        );
      }

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
      if (modelsData)
        dispatch(
          tabActions.setModelsData({
            tab: activeTab,
            category: activeCategory,
            subcategory: activeSubcategory,
            nsfw: nsfwMode,
            previews: loadMore ? [...curModelsData, ...modelsData] : modelsData,
          })
        );
      dispatch(tabActions.setIsLastPage(isLast));
      dispatch(tabActions.setIsLoading(false));
    } catch (err) {
      console.log(err);
    }
  };
};

export const tabActions = tabsSlice.actions;

export default tabsSlice;
