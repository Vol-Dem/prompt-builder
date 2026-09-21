import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { saveUserPreviewFullView } from "../utils/fetch/fetchUser";
import {
  cloneObject,
  handleErrors,
  normalizeError,
} from "../utils/generalUtils";
import type { ModelCategories } from "../../shared/types/user";
import type { AppThunk } from "./store";
import type { TabsModelsData, TabsState } from "../types/tabs.types";
import {
  fetchModelPreviewPage,
  type ModelPreviewCursor,
} from "../utils/fetch/fetchPreviews";
import { TABS_INITIAL_MODELS_DATA } from "../variables/structures";

let lastVisible: ModelPreviewCursor = "";

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
    modelsData: cloneObject(TABS_INITIAL_MODELS_DATA),
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
      state.modelsData = cloneObject(TABS_INITIAL_MODELS_DATA);
      state.currTab = action.payload;
    },
    /**
     * Sets current category and resets subcatgory and model previews.
     */
    setCurrentCategory(state, action: PayloadAction<string>) {
      state.currSubcategory = "";
      state.modelsData = cloneObject(TABS_INITIAL_MODELS_DATA);
      state.currCategory = action.payload;
    },
    /**
     * Sets current subcatgory and resets model previews, last page and last visible state.
     */
    setCurrentSubcategory(state, action: PayloadAction<string>) {
      state.modelsData = cloneObject(TABS_INITIAL_MODELS_DATA);
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
      state.modelsData = cloneObject(TABS_INITIAL_MODELS_DATA);
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

      const {
        items: modelsData,
        isLastPage: isLast,
        cursor,
      } = await fetchModelPreviewPage({
        uid,
        activeTab,
        activeCategory,
        activeSubcategory,
        baseModel,
        sortBy,
        nsfwMode,
        cursor: lastVisible,
      });

      if (!isLast) {
        lastVisible = cursor;
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
    await saveUserPreviewFullView(uid, isFullView);
  };
};

export const tabActions = tabsSlice.actions;

export default tabsSlice;
