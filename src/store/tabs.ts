import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";

import firebaseApp from "../firebase-config";
import { handleErrors, normalizeError } from "../utils/generalUtils";
import type { ModelCategories } from "../../shared/types/user";
import type { ModelPreviewDoc } from "../../shared/types/firestore";
import type { AppThunk } from "./store";
import type { TabsModelsData, TabsState } from "../types/tabs.types";

const firestore = getFirestore(firebaseApp);

let lastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | "" = "";

const amountPerPage = 12;

/**
 * Model tabs state.
 *
 * Controls:
 * - Model tabs
 * - Model previews
 *
 * State:
 * @property {string} currTab - Active model type.
 * @property {string} currCategory - Active model category.
 * @property {string} currSubcategory - Active model subcategory.
 * @property {Object} categoriesData - Model categories data.
 * @property {string} errorMessage - Model images error message.
 * @property {{tab: string, category: string, subcategory: string, nsfw: boolean, previews: Array<Object>}} modelsData - Model previews with active filter info.
 * @property {boolean} previewFullView - Whether the model list shows full or compact cards.
 * @property {Array<string>} baseModels - List of base models of saved models (SDXL, FLUX, etc.).
 * @property {'createdAt'|'name'} sortBy - Field to sort by.
 * @property {string} baseModel - Filter previews by base model.
 * @property {boolean} isLoading - Model previews loading state.
 * @property {boolean} isLastPage - Whether the last model previews page is reached.
 */
const tabsSlice = createSlice({
  name: "tabs",
  initialState: {
    currTab: "",
    currCategory: "",
    currSubcategory: "",
    categoriesData: {},
    errorMessage: "",
    modelsData: {
      tab: "",
      category: "",
      subcategory: "",
      nsfw: false,
      previews: [],
    },
    previewFullView: false,
    baseModels: [],
    sortBy: "createdAt",
    baseModel: "",
    isLoading: false,
    isLastPage: false,
  } as TabsState,
  reducers: {
    /**
     * Sets current tab and resets category, subcatgory and model previews.
     */
    setCurrentTab(state, action: PayloadAction<string>) {
      state.currSubcategory = "";
      state.currCategory = "";
      state.modelsData = {
        tab: "",
        category: "",
        subcategory: "",
        nsfw: false,
        previews: [],
      };
      state.currTab = action.payload;
    },
    /**
     * Sets current category and resets subcatgory and model previews.
     */
    setCurrentCategory(state, action: PayloadAction<string>) {
      state.currSubcategory = "";
      state.modelsData = {
        tab: "",
        category: "",
        subcategory: "",
        nsfw: false,
        previews: [],
      };
      state.currCategory = action.payload;
    },
    /**
     * Sets current subcatgory and resets model previews, last page and last visible state.
     */
    setCurrentSubcategory(state, action: PayloadAction<string>) {
      state.modelsData = {
        tab: "",
        category: "",
        subcategory: "",
        nsfw: false,
        previews: [],
      };
      state.isLastPage = false;
      state.currSubcategory = action.payload;
    },
    setCategories(state, action: PayloadAction<ModelCategories>) {
      state.categoriesData = action.payload;
    },
    /**
     * Sets and sorts base models.
     */
    setBaseModels(state, action: PayloadAction<string[]>) {
      if (action.payload) {
        state.baseModels = action.payload.sort();
      }
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
    },
    setBaseModel(state, action: PayloadAction<string>) {
      state.baseModel = action.payload;
    },
    setErrorMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
    },
    setModelsData(state, action: PayloadAction<TabsModelsData>) {
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
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setIsLastPage(state, action: PayloadAction<boolean>) {
      state.isLastPage = action.payload;
    },
    reset(state) {
      state.currCategory = "";
      state.currSubcategory = "";
      state.categoriesData = {};
    },
    resetActiveTabs(state) {
      state.currTab = "";
      state.currCategory = "";
      state.currSubcategory = "";
    },
    setPreviewFullView(state, action: PayloadAction<boolean>) {
      state.previewFullView = action.payload;
    },
  },
  extraReducers: (builder) => {
    /**
     * Resets model previews when NSFW mode or level changes.
     *
     * Listens to all actions that start with `general/setNsfw`
     * and resets model preview data.
     */
    builder.addMatcher(
      (action) => action.type.startsWith("general/setNsfw"),
      (state) => {
        tabsSlice.caseReducers.resetModelsData(state);
      },
    );
  },
});

/**
 * Fetches model previews.
 *
 * Side effects:
 * - Fetches model previews from Firestore
 * - Optionally merges with already loaded previews
 *
 * @param {string} activeTab - Model type ID.
 * @param {string} activeCategory - Category ID.
 * @param {string} activeSubcategory - Subcategory ID.
 * @param {boolean} loadMore - Whether to append to existing previews instead of replacing them.
 * @param {boolean} nsfwMode - Whether to include NSFW models.
 * @returns {Function} Redux thunk.
 */
export const getModelsPreview = (
  activeTab: string,
  activeCategory: string | null,
  activeSubcategory: string | null,
  loadMore: boolean = false,
  nsfwMode: boolean,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(tabActions.setIsLoading(true));
      dispatch(tabActions.setErrorMessage(""));

      if (!loadMore) {
        lastVisible = "";
        dispatch(tabActions.setIsLastPage(false));
      }

      const uid = getState().auth.user.uid;
      const isLastPage = getState().tabs.isLastPage;
      const sortBy = getState().tabs.sortBy;
      const baseModel = getState().tabs.baseModel;
      const curModelsData = getState().tabs.modelsData.previews;
      if (isLastPage) return;

      const direction = sortBy === "name" ? "asc" : "desc";
      const order = orderBy(sortBy, direction);

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
        limit(amountPerPage),
      );

      const querySnapshot = await getDocs(q);

      const modelsData = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data() as ModelPreviewDoc;
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
          }),
        );

      dispatch(tabActions.setIsLastPage(isLast));
      dispatch(tabActions.setIsLoading(false));
    } catch (error) {
      const errorMeassage = handleErrors(normalizeError(error));
      dispatch(tabActions.setIsLoading(false));
      dispatch(tabActions.setErrorMessage(errorMeassage));
    }
  };
};

/**
 * Changes between compact and full preview card view.
 *
 * Side effects:
 * - Saves the view state to Firestore.
 * - Updates the view state in Redux.
 *
 * @param {boolean} isFullView - Whether full card view is enabled.
 * @returns {Function} Redux thunk.
 */
export const switchPreviewFullView = (isFullView: boolean): AppThunk => {
  return async (dispatch, getState) => {
    dispatch(tabActions.setPreviewFullView(isFullView));
    const uid = getState().auth.user.uid;
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      "uiState.previewFullView": isFullView,
    });
  };
};

export const tabActions = tabsSlice.actions;

export default tabsSlice;
