import { createSlice } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import firebaseApp from "../firebase-config";
import { authActions } from "./auth";
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
    previewFullView: false,
    subcategories: [],
    baseModels: [],
    sortBy: "createdAt",
    modelType: "",
    isLoading: false,
    isLastPage: false,
  },
  reducers: {
    setCurrentTab(state, action) {
      state.currSubcategory = "";
      state.currCategory = "";
      state.modelsData = [];
      state.currTab = action.payload;
    },
    setCurrentCategory(state, action) {
      state.currSubcategory = "";
      state.modelsData = [];
      state.currCategory = action.payload;
    },
    setCurrentSubcategory(state, action) {
      lastVisible = "";
      state.modelsData = [];
      state.isLastPage = false;
      state.currSubcategory = action.payload;
    },
    setCategories(state, action) {
      if (action.payload) {
        state.categoriesData = action.payload;
      }
    },
    setBaseModels(state, action) {
      if (action.payload) {
        state.baseModels = action.payload.sort();
      }
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setModelType(state, action) {
      state.modelType = action.payload;
    },
    setErrorMessage(state, action) {
      state.errorMessage = action.payload;
    },
    setModelsData(state, action) {
      state.modelsData = action.payload;
    },
    resetModelsData(state) {
      state.modelsData = {
        tab: "",
        category: "",
        subcategory: "",
        nsfw: false,
        previews: [],
      };
      state.isLastPage = false;
    },
    setSubcategories(state, action) {
      state.subcategories = action.payload.sort();
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setIsLastPage(state, action) {
      state.isLastPage = action.payload;
    },
    reset(state) {
      state.currCategory = "";
      state.currSubcategory = "";
      state.categoriesData = [];
      state.subcategories = [];
    },
    resetActiveTabs(state) {
      state.currTab = "";
      state.currCategory = "";
      state.currSubcategory = "";
    },
    setPreviewFullView(state, action) {
      state.previewFullView = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, (state, action) => {
      tabsSlice.caseReducers.resetActiveTabs(state, action);
      tabsSlice.caseReducers.reset(state, action);
      tabsSlice.caseReducers.resetModelsData(state, action);
    });
    builder.addMatcher(
      (action) => action.type.startsWith("general/setNsfw"),
      (state, action) => {
        tabsSlice.caseReducers.resetModelsData(state, action);
      }
    );
  },
});

export const getModelsPreview = (
  activeTab,
  activeCategory,
  activeSubcategory,
  loadMore = false,
  nsfwMode
) => {
  return async (dispatch, getState) => {
    try {
      dispatch(tabActions.setIsLoading(true));
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

export const switchPreviewFullView = (isFullView) => {
  return async (dispatch, getState) => {
    dispatch(tabActions.setPreviewFullView(isFullView));
    const uid = getState().auth.user.uid;
    const userRef = doc(firestore, "users", uid);
    await updateDoc(
      userRef,
      {
        "uiState.previewFullView": isFullView,
      },
      {
        merge: true,
      }
    );
  };
};

export const tabActions = tabsSlice.actions;

export default tabsSlice;
