import { createSlice } from "@reduxjs/toolkit";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  setDoc,
  startAfter,
  where,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";

import firebaseApp from "../firebase-config";
import {
  AppError,
  checkArraysIsEqual,
  checkIsInCurrentNsfwRange,
  createCategoryId,
  createCollectionId,
  filterDuplicates,
  handleErrors,
  normalizeError,
  throwCustomError,
} from "../utils/generalUtils";
import {
  ERROR_MESSAGE_DB_CONNECTION,
  ERROR_MESSAGE_DEFAULT,
  SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE,
} from "../variables/constants";
import { getCollectionData } from "../utils/fetch/fetchCollection";
import type {
  AddCollectionData,
  CollectionsState,
  EditCollectionData,
} from "../types/collections.types";
import type { AppThunk } from "./store";
import type { SavePostData } from "../types/upload.types";
import type { PostSavedData } from "../types/collections.types";
import type {
  CollectionPreviewDoc,
  UserDoc,
} from "../../shared/types/firestore";
import type { SavedPostDoc } from "../../shared/types/image";
import type {
  CollectionCategory,
  CollectionSubcategory,
} from "../../shared/types/user";
import type { CollectionSavedPost } from "../../shared/types/collection";

const firestore = getFirestore(firebaseApp);

let lastVisiblePreview: QueryDocumentSnapshot<
  DocumentData,
  DocumentData
> | null = null;

const amountPerPage = 12;

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
 * @property {array} categories - Collection categories.
 * @property {string} activeCategory - Active collection category.
 * @property {string} activeSubcategory - Active collection subcategory.
 * @property {array} collectionPreviews - List of collection previews.
 * @property {boolean} isLastPage - Whether the last collection images page is reached.
 * @property {boolean} isLastPreviewsPage - Whether the last previews page is reached.
 * @property {boolean} imagesIsLoading - Collection images loading state.
 * @property {boolean} previewsIsLoading - Collection previews loading state.
 * @property {boolean} collectionDataIsSaving - Collection saving state (collection edit page).
 * @property {string} errorMessage - Collection images error message.
 * @property {string} previewsErrorMessage - Collection previews error message.
 * @property {{images: array, isLastPage: boolean}} collectionImages - Collection images data.
 * @property {object} collectionData - Active collection data.
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

/**
 * Saves post images to a collection.
 *
 * Side effects:
 * - Adds or updates a post in the collection
 * - Updates collection and preview data in Firestore
 * - Updates collection and images state in Redux
 *
 * @param {Object} params
 * @param {{id: string|number, name: string}} params.collectionData - Target collection.
 * @param {Array<{id: string, name: string}>} params.subcategoriesData - Selected subcategories.
 * @param {number} params.postId - Post ID.
 * @param {Array<number>} params.imageIds - IDs of images to save.
 * @param {Object|null} params.postData - Existing post data (if editing).
 * @param {Array<Object>} params.images - Image objects to add.
 * @returns {Function} Redux thunk.
 */
export const savePostToCollections = ({
  collectionData,
  subcategoriesData,
  postId,
  imageIds,
  postData,
  images,
}: SavePostData): AppThunk => {
  return async (dispatch, getState) => {
    try {
      if (!postId) {
        throwCustomError("Invalid post ID");
      }

      const batch = writeBatch(firestore);

      const uid = getState().auth.user.uid;
      const curCollectionData = getState().images.collectionData;

      const newSubcategoryIds = subcategoriesData.map(
        (subcategory) => subcategory.id,
      );

      const collectionsRef = doc(
        firestore,
        "users",
        uid,
        "collections",
        collectionData.id + "",
      );
      const collectionsPreviewRef = doc(
        firestore,
        "users",
        uid,
        "collectionPreviews",
        collectionData.id + "",
      );

      if (postData?.postId) {
        batch.update(collectionsRef, {
          posts: arrayRemove(postData),
        });
      }

      const newPost = { postId, imageIds, createdAt: Date.now() };

      batch.update(collectionsRef, {
        subcategories: arrayUnion(...newSubcategoryIds),
        posts: arrayUnion(newPost),
      });
      batch.update(collectionsPreviewRef, {
        subcategories: arrayUnion(...newSubcategoryIds),
      });

      await batch.commit();

      const collectionImagesData = getState().images.collectionImages;

      if (
        (collectionImagesData?.collectionId &&
          curCollectionData?.id === collectionImagesData.collectionId) ||
        !curCollectionData?.posts?.length
      ) {
        const updatedPosts = [
          ...(curCollectionData?.posts?.filter(
            (post) => post.postId !== newPost.postId,
          ) || []),
          newPost,
        ];

        dispatch(
          imagesActions.setCollectionData({
            ...curCollectionData,
            posts: updatedPosts,
          }),
        );

        if (
          !collectionImagesData?.collectionId ||
          collectionData.id === collectionImagesData.collectionId
        ) {
          dispatch(
            imagesActions.setCollectionImages({
              collectionId: collectionData.id,
              ...collectionImagesData,
              isLastPage: !curCollectionData?.posts?.length,
              images: [
                images.sort((a, b) => {
                  return Date.parse(a.createdAt) - Date.parse(b.createdAt);
                }),
                ...(collectionImagesData?.images?.filter(
                  (image) => image[0].postId !== postId,
                ) || []),
              ],
            }),
          );
        }
      }
    } catch (error) {
      throw normalizeError(error);
    }
  };
};

/**
 * Fetches collection data.
 *
 * Side effects:
 * - Loads collection data from Firestore.
 *
 * @param {number|string} collectionId - Collection ID.
 * @returns {Function} Redux thunk.
 */
export const getCollection = (collectionId: number | string): AppThunk => {
  return async (dispatch) => {
    try {
      const collectionData = await getCollectionData(collectionId);

      dispatch(imagesActions.setCollectionData(collectionData));
    } catch (error) {
      throw normalizeError(error);
    }
  };
};

/**
 * Fetches collection previews.
 *
 * Side effects:
 * - Fetches collection previews from Firestore
 * - Optionally merges with already loaded previews
 *
 * @param {string} activeCategory - Category ID.
 * @param {string} activeSubcategory - Subcategory ID.
 * @param {boolean} loadMore - Whether to append to existing previews.
 * @param {boolean} nsfwMode - Whether to include NSFW collections.
 * @returns {Function} Redux thunk.
 */
export const getCollectionPreviews = (
  activeCategory: string,
  activeSubcategory: string,
  loadMore: boolean = false,
  nsfwMode: boolean,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(imagesActions.setPreviewsErrorMessage(""));
      if (!loadMore) {
        lastVisiblePreview = null;
        dispatch(imagesActions.setIsLastPreviewsPage(false));
      }
      const uid = getState().auth.user.uid;
      const isLastPreviewsPage = getState().images.isLastPreviewsPage;
      const sortBy = "name";
      const collectionPreviews = getState().images.collectionPreviews;

      if (isLastPreviewsPage || !activeCategory) return;

      dispatch(imagesActions.setPreviewsIsLoading(true));
      const direction = sortBy === "name" ? "asc" : "desc";
      const order = orderBy(sortBy, direction);

      const nsfwFilter = !nsfwMode ? [false] : [true, false];

      const optionalWhere = [];

      if (activeCategory && activeCategory !== "all") {
        optionalWhere.push(where("category", "==", activeCategory));
      }
      if (activeSubcategory && activeSubcategory !== "all") {
        optionalWhere.push(
          where("subcategories", "array-contains", activeSubcategory),
        );
      }

      const q = query(
        collection(firestore, "users", uid, `collectionPreviews`),
        ...optionalWhere,
        where("nsfw", "in", nsfwFilter),
        order,
        startAfter(lastVisiblePreview),
        limit(amountPerPage),
      );

      const querySnapshot = await getDocs(q);

      const collectionsData = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return { type: "collection", ...(doc.data() as CollectionPreviewDoc) };
      });

      const isLast =
        !querySnapshot.docs.length || querySnapshot.docs.length < amountPerPage;

      if (!isLast) {
        lastVisiblePreview = querySnapshot.docs[querySnapshot.docs.length - 1];
      }

      if (collectionsData)
        dispatch(
          imagesActions.setCollectionPreviews({
            category: activeCategory,
            subcategory: activeSubcategory,
            nsfw: nsfwMode,
            data: loadMore
              ? [...(collectionPreviews?.data || []), ...collectionsData]
              : collectionsData,
          }),
        );

      dispatch(imagesActions.setIsLastPreviewsPage(isLast));
      dispatch(imagesActions.setPreviewsIsLoading(false));
    } catch (error) {
      const errorMeassage = handleErrors(normalizeError(error));
      dispatch(imagesActions.setPreviewsIsLoading(false));
      dispatch(imagesActions.setPreviewsErrorMessage(errorMeassage));
    }
  };
};

/**
 * Fetches images for a collection by post IDs.
 *
 * Side effects:
 * - Loads collection images from Firestore
 * - Merges with already loaded images
 *
 * @param {Array<{postId: number, createdAt: number}>} posts - Collection posts.
 * @param {number|string} collectionId - Collection ID.
 * @returns {Function} Redux thunk.
 */
export const getColectionImagesByIds = (
  posts: PostSavedData[],
  collectionId: number,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const uid = getState().auth.user.uid;
      const collectionImages = getState().images.collectionImages;
      const fileteredPosts = posts.filter((post) => post?.postId);

      if (collectionImages?.isLastPage) return;
      const savedImagesData = getState().images.collectionData?.posts?.toSorted(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
      const nsfwMode = getState().general.nsfwMode;
      const nsfwLevel = getState().general.nsfwLevel;
      const lastVisibleId = collectionImages?.lastVisibleId;
      const lastVisibleIndex = fileteredPosts.findIndex(
        (post) => post.postId === lastVisibleId,
      );
      let from;
      let to;

      if (lastVisibleIndex < 0 && !lastVisibleId) {
        from = 0;
        to = SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE + 1;
      } else {
        from = lastVisibleIndex;
        to = lastVisibleIndex + SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE + 1;
      }

      const nsfwFilter = !nsfwMode ? [true] : [true, false];
      const curPosts = fileteredPosts.slice(from, to);
      const ids = curPosts?.map((post) => post.postId);

      const q = query(
        collection(firestore, "users", uid, "images"),
        where("id", "in", ids),
        where("hasSfw", "in", nsfwFilter),
        orderBy("createdAt", "desc"),
        limit(SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE + 1),
      );

      const modelImagesSnap = await getDocs(q);

      const isLast = ids.length <= SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE;

      const data = modelImagesSnap.docs.flatMap((doc) => {
        return doc.data() as SavedPostDoc;
      });

      const examples = data
        .map((post) => {
          const savedPostImages = post.items.filter((image) => {
            const saved =
              savedImagesData?.length &&
              savedImagesData
                ?.find((postData) => postData.postId === image.postId)
                ?.imageIds?.includes(image.id);

            const isInCurrentNsfwRange =
              typeof image?.nsfwLevel === "string" &&
              checkIsInCurrentNsfwRange(nsfwLevel, image.nsfwLevel);

            return saved && isInCurrentNsfwRange;
          });

          return filterDuplicates(savedPostImages, "id").toSorted((a, b) => {
            return Date.parse(a.createdAt) - Date.parse(b.createdAt);
          });
        })
        .filter((item) => !!item.length)
        .toSorted((a, b) => {
          const curPostDataA = curPosts.find(
            (post) => post.postId === a[0].postId,
          );
          const curPostDataB = curPosts.find(
            (post) => post.postId === b[0].postId,
          );
          if (curPostDataB?.createdAt && curPostDataA?.createdAt) {
            return curPostDataB.createdAt - curPostDataA.createdAt;
          }
          return 0;
        })
        .slice(0, SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE);

      dispatch(
        imagesActions.setCollectionImages({
          collectionId,
          lastVisibleId: ids?.length ? ids[ids.length - 1] : null,
          images: [...(collectionImages.images || []), ...examples],
          isLastPage: isLast,
        }),
      );
    } catch (error) {
      throw normalizeError(error);
    }
  };
};

/**
 * Edits collection data.
 *
 * Side effects:
 * - Saves collection metadata to Firestore
 * - Creates new category and subcategories if needed
 * - Updates Redux collection state
 *
 * @param {Object} params
 * @param {{id?: string|number, name: string}} params.collectionData - Collection data.
 * @param {{id?: string, name: string}} params.categoryData - Category data.
 * @param {Array<{id?: string, name: string}>} params.subcategoriesData - Subcategories.
 * @param {string} params.description - Collection description.
 * @param {boolean} params.nsfw - Whether the collection is NSFW.
 * @returns {Function} Redux thunk.
 */
export const editCollectionData = ({
  collectionData,
  categoryData,
  subcategoriesData,
  description,
  nsfw,
}: EditCollectionData): AppThunk => {
  return async (dispatch, getState) => {
    try {
      if (!collectionData?.name || !categoryData?.name) return;

      dispatch(imagesActions.setCollectionDataIsSaving(true));

      const batch = writeBatch(firestore);
      const uid = getState().auth.user.uid;
      const curCollectionData = getState().images.collectionData;

      const {
        collectionData: updatedCollectionData,
        categoryData: updatedCategoryData,
        subcategoriesData: updatedSubcategoriesData,
      } = await dispatch(
        addNewCollectionCategories({
          collectionData,
          categoryData,
          subcategoriesData,
          curCollectionSabcategories: subcategoriesData
            ?.map((sub) => sub.id)
            .filter(Boolean),
        }),
      );

      const newSubcategoryIds = updatedSubcategoriesData.map(
        (subcategory) => subcategory.id,
      );

      const collectionsRef = doc(
        firestore,
        "users",
        uid,
        "collections",
        updatedCollectionData.id + "",
      );
      const collectionsPreviewRef = doc(
        firestore,
        "users",
        uid,
        "collectionPreviews",
        updatedCollectionData.id + "",
      );

      const preview = {
        name: updatedCollectionData.name,
        nameArr: updatedCollectionData.name.toLowerCase().split(" "),
        category: updatedCategoryData.id,
        subcategories: newSubcategoryIds,
        nsfw,
      };

      const collection = {
        ...preview,
        description,
      };

      dispatch(
        imagesActions.setCollectionData({
          ...curCollectionData,
          ...collection,
        }),
      );

      batch.update(collectionsPreviewRef, preview);
      batch.update(collectionsRef, collection);

      await batch.commit();
    } catch (error) {
      throw normalizeError(error);
    } finally {
      dispatch(imagesActions.setCollectionDataIsSaving(false));
    }
  };
};

/**
 * Updates collection post images.
 *
 * Side effects:
 * - Removes images or posts from a collection in Firestore
 * - Updates collection and images state in Redux
 *
 * @param {Array<string>} ids - Image IDs to remove.
 * @param {{postId: number, imageIds: Array<string>}} postData - Post data.
 * @returns {Function} Redux thunk.
 */
export const updateCollectionPostsData = (
  ids: number[] | null,
  postData: PostSavedData,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const uid = getState().auth.user.uid;
      const collectionData = getState().images.collectionData;

      const imageIds = ids?.length
        ? postData?.imageIds?.filter((imageId) => !ids.includes(imageId))
        : [];

      if (!collectionData) {
        throw new AppError(ERROR_MESSAGE_DEFAULT);
      }

      let updatedPosts: CollectionSavedPost[];

      if (!imageIds?.length) {
        updatedPosts = collectionData.posts.filter(
          (post) => post.postId !== postData.postId,
        );
      } else {
        updatedPosts = collectionData.posts.map((post) => {
          if (post.postId === postData.postId) {
            return {
              ...post,
              imageIds,
            };
          }

          return post;
        });
      }

      const collectionsRef = doc(
        firestore,
        "users",
        uid,
        "collections",
        collectionData.id + "",
      );

      const batch = writeBatch(firestore);

      batch.update(collectionsRef, {
        posts: updatedPosts,
      });

      await batch.commit();
      dispatch(
        imagesActions.setCollectionData({
          ...collectionData,
          posts: updatedPosts,
        }),
      );
      const collectionImagesData = getState().images.collectionImages;
      if (collectionImagesData?.collectionId) {
        let updatedImages;
        if (!imageIds?.length) {
          updatedImages = collectionImagesData.images.filter(
            (post) => post[0].postId !== postData.postId,
          );
        } else {
          updatedImages = collectionImagesData.images.map((post) => {
            if (post[0].postId === postData.postId) {
              return post.filter((image) => imageIds.includes(image.id));
            }
            return post;
          });
        }

        dispatch(
          imagesActions.setCollectionImages({
            ...collectionImagesData,
            images: updatedImages,
          }),
        );
      }
    } catch (error) {
      handleErrors(normalizeError(error));
    }
  };
};

/**
 * Updates collection categories.
 *
 * Side effects:
 * - Saves collection categories to Firestore
 * - Updates categories in Redux
 *
 * @param {Array<Object>} categories - Collection categories.
 * @returns {Function} Redux thunk.
 */
export const updateCollectionCategories = (
  categories: CollectionCategory[],
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const uid = getState().auth.user.uid;
      const userRef = doc(firestore, "users", uid);

      await setDoc(
        userRef,
        {
          imageCategories: categories,
        },
        { merge: true },
      );

      dispatch(imagesActions.setImageCategories(categories));
    } catch (error) {
      handleErrors(normalizeError(error));
    }
  };
};

/**
 * Creates new collection categories and subcategories if needed.
 *
 * Side effects:
 * - Creates new categories, subcategories, and collections in Firestore
 * - Updates category list in Redux
 *
 * @param {Object} params
 * @param {{id?: number, name: string}} params.collectionData - Input collection data.
 * @param {{id?: string, name: string}} params.categoryData - Input category data.
 * @param {Array<{id?: string, name: string}>} params.subcategoriesData - Input subcategories data.
 * @param {Array<string>} params.curCollectionSabcategories - All collection subcategory IDs.
 * @returns {Function} Redux thunk that resolves to:
 * {
 *   collectionData: {id: number, name: string},
 *   categoryData: {id: string, name: string},
 *   subcategoriesData: Array<{id: string, name: string}>,
 *   curCollectionSabcategories: Array<string>
 * }
 */
export const addNewCollectionCategories = ({
  collectionData,
  categoryData,
  subcategoriesData,
  curCollectionSabcategories,
}: AddCollectionData): AppThunk<Promise<AddCollectionData>> => {
  return async (dispatch, getState) => {
    try {
      const uid = getState().auth.user.uid;
      const existedCategoriesData = getState().images.categories;
      const existedCategory = existedCategoriesData.find(
        (catData) => catData.id === categoryData?.id,
      );
      const existedCurCollectionSubcategoryIds =
        existedCategory?.collectionNames?.find(
          (collData) => collData.id === collectionData?.id,
        )?.subcategories;

      const userRef = doc(firestore, "users", uid);

      const userDataDoc = await getDoc(userRef);

      let latestCategories: CollectionCategory[] = [];

      if (userDataDoc.exists()) {
        const userData = userDataDoc.data() as UserDoc;
        latestCategories = userData?.imageCategories || [];
      } else {
        throwCustomError(ERROR_MESSAGE_DB_CONNECTION);
      }

      const curCategoryData = latestCategories?.find(
        (category) => category.name === categoryData.name,
      );

      const categoryId =
        categoryData?.id ||
        createCategoryId(categoryData.name, latestCategories);
      const collectionId =
        collectionData?.id || createCollectionId(latestCategories);

      let newSubcategories: CollectionSubcategory[] = [];
      let newSubcategoryIds: string[] = [];

      const subcategories = subcategoriesData.flatMap((subcategory) => {
        if (!subcategory.name) {
          return [];
        }
        if (!subcategory.id) {
          const newId = createCategoryId(
            subcategory.name,
            curCategoryData?.subcategories,
          );
          const subData = {
            id: newId,
            name: subcategory.name,
          };
          newSubcategories.push(subData);
          newSubcategoryIds.push(newId);
          return subData;
        }
        newSubcategoryIds.push(subcategory.id);
        return subcategory;
      });

      const newCollectionSubcategoryIds = filterDuplicates([
        ...newSubcategoryIds,
        ...curCollectionSabcategories,
      ]);

      const hasNewSubcategories = subcategoriesData?.find(
        (subcategory) => !subcategory?.id,
      );

      const existedCollectionData = curCategoryData?.collectionNames?.find(
        (collectionName) => collectionName.id === collectionData.id,
      );

      //Check for new categories data
      if (
        !hasNewSubcategories &&
        existedCurCollectionSubcategoryIds &&
        categoryData?.id &&
        collectionData?.id &&
        checkArraysIsEqual(
          newCollectionSubcategoryIds,
          existedCurCollectionSubcategoryIds,
        ) &&
        existedCollectionData?.name === collectionData.name
      ) {
        return {
          collectionData,
          categoryData,
          subcategoriesData,
          curCollectionSabcategories,
        };
      }

      let updatedCategories: CollectionCategory[] = [];

      if (!latestCategories?.length || !categoryData.id) {
        updatedCategories = [
          ...latestCategories,
          {
            id: categoryId,
            name: categoryData.name,
            subcategories: newSubcategories,
            collectionNames: [
              {
                id: collectionId,
                name: collectionData.name,
                subcategories: newCollectionSubcategoryIds,
              },
            ],
          },
        ];
      } else {
        updatedCategories = latestCategories.map((category) => {
          if (
            categoryData.id &&
            categoryId === category.id &&
            category.collectionNames
          ) {
            let collectionNames;
            if (!collectionData.id) {
              collectionNames = [
                ...category.collectionNames,
                {
                  id: collectionId,
                  name: collectionData.name,
                  subcategories: newCollectionSubcategoryIds,
                },
              ];
            } else {
              collectionNames = category.collectionNames.map(
                (collectionName) => {
                  if (collectionName.id === collectionData.id) {
                    return {
                      ...collectionName,
                      name: collectionData.name,
                      subcategories: newCollectionSubcategoryIds,
                    };
                  }
                  return collectionName;
                },
              );
            }

            return {
              ...category,
              subcategories: [
                ...(category.subcategories || []),
                ...newSubcategories,
              ],
              collectionNames,
            };
          }
          return category;
        });
      }

      if (!collectionData?.id && collectionId) {
        const collectionsRef = doc(
          firestore,
          "users",
          uid,
          "collections",
          collectionId + "",
        );
        const collectionsPreviewRef = doc(
          firestore,
          "users",
          uid,
          "collectionPreviews",
          collectionId + "",
        );

        const savedImagesToCatPrev = {
          id: collectionId,
          name: collectionData.name,
          nameArr: collectionData.name.toLowerCase().split(" "),
          category: categoryId,
          nsfw: false,
          subcategories: newCollectionSubcategoryIds,
          createdAt: Date.now(),
        };

        const savedImagesToCat = {
          ...savedImagesToCatPrev,
          description: "",
          posts: [],
        };

        await setDoc(collectionsRef, savedImagesToCat, { merge: true });
        await setDoc(collectionsPreviewRef, savedImagesToCatPrev, {
          merge: true,
        });
      }

      await dispatch(updateCollectionCategories(updatedCategories));
      dispatch(imagesActions.setImageCategories(updatedCategories));

      return {
        collectionData: { name: collectionData.name, id: collectionId },
        categoryData: { name: categoryData.name, id: categoryId },
        subcategoriesData: subcategories,
        curCollectionSabcategories,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  };
};

/**
 * Deletes a collection.
 *
 * Side effects:
 * - Removes collection and its preview from Firestore
 * - Updates user category data
 *
 * @param {number|string} collectionId - Collection ID.
 * @param {string} categoryId - Category ID.
 * @returns {Function} Redux thunk.
 */
export const deleteCollection = (
  collectionId: number | string,
  categoryId: string,
): AppThunk => {
  return async (_, getState) => {
    try {
      const uid = getState().auth.user.uid;
      const categories = getState().images.categories;
      const userRef = doc(firestore, "users", uid);
      const collectionsRef = doc(
        firestore,
        "users",
        uid,
        "collections",
        collectionId + "",
      );
      const collectionsPreviewRef = doc(
        firestore,
        "users",
        uid,
        "collectionPreviews",
        collectionId + "",
      );

      const curCategoryIndex = categories.findIndex(
        (category) => category.id === categoryId,
      );

      const updatedCollectionNames = categories[
        curCategoryIndex
      ].collectionNames?.filter((collection) => collection.id !== collectionId);

      const updatedCategories = categories.toSpliced(curCategoryIndex, 1, {
        ...categories[curCategoryIndex],
        collectionNames: updatedCollectionNames,
      });

      await setDoc(
        userRef,
        {
          imageCategories: updatedCategories,
        },
        { merge: true },
      );

      await deleteDoc(collectionsRef);
      await deleteDoc(collectionsPreviewRef);
    } catch (error) {
      throw normalizeError(error);
    }
  };
};

export const imagesActions = imagesSlice.actions;

export default imagesSlice;
