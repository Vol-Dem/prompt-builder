import { createSlice } from "@reduxjs/toolkit";
import type { CollectionsState } from "../types/collections.types";

/**
 * Image collections settings state.
 *
 * Controls:
 * - Collection preview list
 * - Collection data
 * - Collection images
 * - Collection categories and subcategories
 *
 * State:
 * @property categories - Collection categories.
 * @property activeCategory - Active collection category.
 * @property activeSubcategory - Active collection subcategory.
 * @property collectionPreviews - List of collection previews.
 * @property isLastPage - Whether the last collection images page is reached.
 * @property isLastPreviewsPage - Whether the last previews page is reached.
 * @property imagesIsLoading - Collection images loading state.
 * @property previewsIsLoading - Collection previews loading state.
 * @property collectionDataIsSaving - Collection saving state (collection edit page).
 * @property errorMessage - Collection images error message.
 * @property previewsErrorMessage - Collection previews error message.
 * @property collectionImages - Collection images data.
 * @property collectionData - Active collection data.
 */
const imagesSlice = createSlice({
  name: "images",
  initialState: {
    categories: [],
    activeCategory: "",
    activeSubcategory: "",
    collectionPreviews: null,
    isLastPage: false,
    isLastPreviewsPage: false,
    imagesIsLoading: false,
    previewsIsLoading: false,
    collectionDataIsSaving: false,
    errorMessage: "",
    previewsErrorMessage: "",
    collectionImages: { images: [], isLastPage: false },
    collectionData: null,
  } as CollectionsState,
  reducers: {
    setImageCategories(state, action) {
      state.categories = action.payload;
    },
    setActiveCategory(state, action) {
      state.activeCategory = action.payload;
    },
    setActiveSubcategory(state, action) {
      state.activeSubcategory = action.payload;
    },
    setCollectionPreviews(state, action) {
      state.collectionPreviews = action.payload;
    },
    setCollectionData(state, action) {
      state.collectionData = action.payload;
    },
    setIsLastPage(state, action) {
      state.isLastPage = action.payload;
    },
    setIsLastPreviewsPage(state, action) {
      state.isLastPreviewsPage = action.payload;
    },
    setImagesIsLoading(state, actions) {
      state.imagesIsLoading = actions.payload;
    },
    setPreviewsIsLoading(state, action) {
      state.previewsIsLoading = action.payload;
    },
    setCollectionDataIsSaving(state, action) {
      state.collectionDataIsSaving = action.payload;
    },
    setErrorMessage(state, action) {
      state.errorMessage = action.payload;
    },
    setPreviewsErrorMessage(state, action) {
      state.previewsErrorMessage = action.payload;
    },
    setCollectionImages(state, action) {
      state.collectionImages = action.payload;
    },
    resetCollectionData(state) {
      state.collectionData = null;
      state.collectionImages = { images: [], isLastPage: false };
      state.errorMessage = "";
      state.isLastPage = false;
      state.imagesIsLoading = false;
    },
    resetCollectionPreviews(state) {
      state.collectionPreviews = null;
      state.errorMessage = "";
      state.previewsErrorMessage = "";
      state.isLastPreviewsPage = false;
      state.previewsIsLoading = false;
    },
    resetCollectionListState(state) {
      state.collectionPreviews = null;
      state.errorMessage = "";
      state.previewsErrorMessage = "";
      state.isLastPreviewsPage = false;
      state.previewsIsLoading = false;
      state.activeCategory = "";
      state.activeSubcategory = "";
    },
  },
  extraReducers: (builder) => {
    /**
     * Resets collection previews when category or subcategory is changed.
     *
     * Listens to all actions from this slice that start with `images/setActive*`
     * and resets collection previews data.
     */
    builder.addMatcher(
      (action) => action.type.startsWith("images/setActive"),
      (state) => {
        imagesSlice.caseReducers.resetCollectionPreviews(state);
      },
    );
    /**
     * Resets collection images when NSFW mode or level is changed.
     *
     * Listens to all actions that start with `general/setNsfw*`
     * and resets collection images data.
     */
    builder.addMatcher(
      (action) => action.type.startsWith("general/setNsfw"),
      (state) => {
        state.collectionImages = { images: [], isLastPage: false };
        state.errorMessage = "";
        state.isLastPage = false;
      },
    );
  },
});

export const imagesActions = imagesSlice.actions;

export default imagesSlice;
