import { createSlice } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import firebaseApp from "../firebase-config";
import { authActions } from "./auth";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";
import { handleErrors } from "../utils/generalUtils";

const firestore = getFirestore(firebaseApp);

let lastVisible = "";

const amountPerPage = 12;

const tabsSlice = createSlice({
  name: "tabs",
  initialState: {
    currTab: "",
    currCategory: "",
    currSubcategory: "",
    allCategories: [],
    categoriesData: "",
    errorMessage: "",
    modelsData: {
      tab: "",
      category: "",
      subcategory: "",
      nsfw: false,
      previews: [],
    },
    subcategories: [],
    baseModels: [],
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
      lastVisible = "";
      state.modelsData = [];
      state.isLastPage = false;
      state.currSubcategory = actions.payload;
    },
    setCategories(state, actions) {
      if (actions.payload) {
        state.categoriesData = actions.payload;
      }
    },
    setBaseModels(state, actions) {
      if (actions.payload) {
        state.baseModels = actions.payload.sort();
      }
    },
    setSortBy(state, actions) {
      state.sortBy = actions.payload;
    },
    setModelType(state, actions) {
      state.modelType = actions.payload;
    },
    setErrorMessage(state, actions) {
      state.errorMessage = actions.payload;
    },
    setModelsData(state, actions) {
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
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, (state, actions) => {
      state.currCategory = "";
      state.currSubcategory = "";
      state.categoriesData = [];
      state.subcategories = [];
    });
  },
});

// export const getUserCategories = (uid) => {
//   return async (dispatch, getState) => {
//     try {
//       const userRef = doc(firestore, "users", uid);

//       const categoriesDoc = await getDoc(userRef);
//       if (categoriesDoc.exists()) {
//         const categoriesData = categoriesDoc.data();
//         dispatch(tabActions.setCategories(categoriesData.categoriesById));
//       }
//     } catch (err) {
//       console.error(err.message);
//     }
//   };
// };

export const getModelsPreview = (
  activeTab,
  activeCategory,
  activeSubcategory,
  loadMore = false,
  nsfwMode
) => {
  return async (dispatch, getState) => {
    try {
      dispatch(tabActions.setErrorMessage(""));
      if (!loadMore) {
        lastVisible = "";
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

      if (isLastPage) return;

      dispatch(tabActions.setIsLoading(true));
      const direction = sortBy === "name" ? "asc" : "desc";
      const order = orderBy(sortBy, direction);
      // let q;

      const nsfwFilter = !nsfwMode ? [false] : [true, false];

      const optionalWhere = [];

      if (activeTab && activeTab !== "all") {
        optionalWhere.push(where("modelType", "==", activeTab));
      }
      if (activeCategory && activeCategory !== "all") {
        optionalWhere.push(where("main", "==", activeCategory));
      }
      if (activeSubcategory && activeSubcategory !== "all") {
        optionalWhere.push(where("sub", "array-contains", activeSubcategory));
      }
      if (baseModel && baseModel !== "-") {
        optionalWhere.push(where("baseModel", "==", baseModel));
      }

      const q = query(
        collection(firestore, "users", uid, `preview`),
        ...optionalWhere,
        where("nsfw", "in", nsfwFilter),
        order,
        startAfter(lastVisible),
        limit(amountPerPage)
      );

      const querySnapshot = await getDocs(q);

      const modelsData = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data();
      });
      // console.log(modelsData);

      const isLast =
        !querySnapshot.docs.length || querySnapshot.docs.length < amountPerPage;

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
      dispatch(tabActions.setIsLoading(false));
      dispatch(tabActions.setErrorMessage(handleErrors(err)));
    }
  };
};

export const tabActions = tabsSlice.actions;

export default tabsSlice;
