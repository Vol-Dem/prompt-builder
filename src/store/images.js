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
  setDoc,
  startAfter,
  where,
  writeBatch,
} from "firebase/firestore";
import firebaseApp from "../firebase-config";
import {
  checkArraysIsEqual,
  checkIsInCurrentNsfwRange,
  createCategoryId,
  createCollectionId,
  filterDuplicates,
  handleErrors,
  throwCustomError,
} from "../utils/generalUtils";
import { getCollectionData } from "../utils/fetchUtils";
import {
  ERROR_MESSAGE_DB_CONNECTION,
  SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE,
} from "../variables/constants";
import { authActions } from "./auth";

const firestore = getFirestore(firebaseApp);

let lastVisiblePreview = "";
let lastVisiblePost = "";

const amountPerPage = 12;

const imagesSlice = createSlice({
  name: "images",
  initialState: {
    categories: [],
    activeCategory: "",
    activeSubcategory: "",
    collectionPreviews: [],
    isLastPage: false,
    isLastPreviewsPage: false,
    // collectionIsLoading: false,
    imagesIsLoading: false,
    previewsIsLoading: false,
    collectionDataIsSaving: false,
    errorMessage: "",
    previewsErrorMessage: "",
    collectionImages: {},
    collectionData: {},
  },
  reducers: {
    setImageCategories(state, actions) {
      state.categories = actions.payload;
    },
    setActiveCategory(state, actions) {
      state.activeCategory = actions.payload;
    },
    setActiveSubcategory(state, actions) {
      state.activeSubcategory = actions.payload;
    },
    setCollectionPreviews(state, actions) {
      state.collectionPreviews = actions.payload;
    },
    setCollectionData(state, actions) {
      state.collectionData = actions.payload;
    },
    setIsLastPage(state, actions) {
      state.isLastPage = actions.payload;
    },
    setIsLastPreviewsPage(state, actions) {
      state.isLastPreviewsPage = actions.payload;
    },
    // setCollectionIsLoading(state, actions) {
    //   state.collectionIsLoading = actions.payload;
    // },
    setImagesIsLoading(state, actions) {
      state.imagesIsLoading = actions.payload;
    },
    setPreviewsIsLoading(state, actions) {
      state.previewsIsLoading = actions.payload;
    },
    setCollectionDataIsSaving(state, actions) {
      state.collectionDataIsSaving = actions.payload;
    },
    setErrorMessage(state, actions) {
      state.errorMessage = actions.payload;
    },
    setPreviewsErrorMessage(state, actions) {
      state.previewsErrorMessage = actions.payload;
    },
    setCollectionImages(state, actions) {
      // console.log("PAYLOAD", actions.payload);
      state.collectionImages = actions.payload;
    },
    resetCollectionData(state, action) {
      state.collectionData = {};
      state.collectionImages = {};
      state.errorMessage = "";
      state.isLastPage = false;
      state.imagesIsLoading = false;
    },
    resetCollectionPreviews(state, action) {
      state.collectionPreviews = [];
      state.errorMessage = "";
      state.isLastPreviewsPage = false;
      state.previewsIsLoading = false;
    },
    resetCollectionListState(state, action) {
      state.collectionPreviews = [];
      state.errorMessage = "";
      state.isLastPreviewsPage = false;
      state.previewsIsLoading = false;
      state.activeCategory = "";
      state.activeSubcategory = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, (state, actions) => {
      state.collectionPreviews = [];
      state.categories = [];
      state.errorMessage = "";
      state.isLastPreviewsPage = false;
      state.previewsIsLoading = false;
      state.activeCategory = "";
      state.activeSubcategory = "";
    });
    builder.addMatcher(
      (action) => action.type.startsWith("images/setActive"),
      (state, actions) => {
        state.collectionPreviews = [];
        state.errorMessage = "";
        state.isLastPreviewsPage = false;
        state.previewsIsLoading = false;
      }
    );
  },
});

export const savePostToCollections = ({
  collectionData,
  categoryData,
  subcategoriesData,
  curCollectionSabcategories,
  postId,
  imageIds,
  postData,
  images,
}) => {
  return async (dispatch, getState) => {
    try {
      // console.log(collectionData, categoryData, subcategoriesData);
      // console.log(postId, imageIds);
      // console.log(postData);
      // console.log(curCollectionSabcategories);

      if (!collectionData?.name) {
        throwCustomError("Invalid collection name");
      }

      if (!categoryData?.name) {
        throwCustomError("Invalid category name");
      }

      if (!postId) {
        throwCustomError("Invalid post ID");
      }

      // return;
      const batch = writeBatch(firestore);

      // const collectionId = collectionData.id;

      const uid = getState().auth.user.uid;
      const categories = getState().images.categories;
      const curCollectionData = getState().images.collectionData;

      const curCategoryData = categories.find(
        (category) => category.name === categoryData.name
      );

      const categoryId =
        categoryData?.id || createCategoryId(categoryData.name, categories);
      const collectionId = collectionData?.id || createCollectionId(categories);

      let newSubcategories = [];

      const newSubcategoryIds = subcategoriesData.flatMap((subcategory) => {
        if (!subcategory.name) {
          return [];
        }
        if (!subcategory.id) {
          const subData = {
            id: createCategoryId(
              subcategory.name,
              curCategoryData?.subcategories
            ),
            name: subcategory.name,
          };
          newSubcategories.push(subData);
          return subData.id;
        }
        return subcategory.id;
      });

      const newCollectionSubcategoryIds = filterDuplicates([
        ...newSubcategoryIds,
        ...(curCollectionSabcategories || []),
      ]);

      const clollectionSubcategoriesIsChanged = !checkArraysIsEqual(
        newCollectionSubcategoryIds,
        curCollectionSabcategories
      );

      const collectionsRef = doc(
        firestore,
        "users",
        uid,
        "collections",
        collectionId + ""
      );
      const collectionsPreviewRef = doc(
        firestore,
        "users",
        uid,
        "collectionPreviews",
        collectionId + ""
      );
      const userRef = doc(firestore, "users", uid);

      let updatedCategories;

      if (!categories?.length || !categoryData.id) {
        // console.log("NEW");
        updatedCategories = [
          ...categories,
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
        // batch.set(
        //   userRef,
        //   {
        //     imageCategories: updatedCategories,
        //   },
        //   { merge: true }
        // );
      } else {
        // console.log("UPD");
        updatedCategories = categories.map((category) => {
          if (categoryData.id && categoryId === category.id) {
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
              const prevCollectionNames = category.collectionNames.filter(
                (prevCollectionName) => prevCollectionName.id !== collectionId
              );
              // const prevSubcategories =
              //   prevCollectionNames.find(
              //     (prevCollectionName) => prevCollectionName.id === collectionId
              //   )?.subcategories || [];

              collectionNames = [
                ...prevCollectionNames,
                {
                  id: collectionId,
                  name: collectionData.name,
                  subcategories: newCollectionSubcategoryIds,
                },
              ];
            }

            return {
              ...category,
              subcategories: [...category.subcategories, ...newSubcategories],
              collectionNames,
            };
          }
          return category;
        });
      }
      //

      //

      if (postData?.postId) {
        batch.update(
          collectionsRef,
          {
            posts: arrayRemove(postData),
          },
          { merge: true }
        );
      }

      const newPost = { postId, imageIds, createdAt: Date.now() };

      if (!collectionData.id) {
        const savedImagesToCatPrev = {
          id: collectionId,
          name: collectionData.name,
          nameArr: collectionData.name.toLowerCase().split(" "),
          category: categoryId,
          nsfw: false,
          subcategories: newSubcategoryIds,
          createdAt: Date.now(),
        };

        const savedImagesToCat = {
          ...savedImagesToCatPrev,
          description: "",
          posts: [newPost],
        };

        // console.log(savedImagesToCatPrev);
        // console.log(savedImagesToCat);

        batch.set(collectionsRef, savedImagesToCat, { merge: true });
        batch.set(collectionsPreviewRef, savedImagesToCatPrev, { merge: true });
      } else {
        batch.update(
          collectionsRef,
          {
            subcategories: arrayUnion(...newSubcategoryIds),
            posts: arrayUnion(newPost),
          },
          { merge: true }
        );
        batch.update(
          collectionsPreviewRef,
          {
            subcategories: arrayUnion(...newSubcategoryIds),
          },
          { merge: true }
        );
      }

      if (
        !collectionData.id ||
        !categoryData.id ||
        newSubcategories.length ||
        clollectionSubcategoriesIsChanged
      ) {
        batch.set(
          userRef,
          {
            imageCategories: updatedCategories,
          },
          { merge: true }
        );
      }

      await batch.commit();
      // console.log("SAVED");
      dispatch(imagesActions.setImageCategories(updatedCategories));
      const collectionImagesData = getState().images.collectionImages;
      if (
        (collectionImagesData?.collectionId &&
          curCollectionData.id === collectionImagesData.collectionId) ||
        !curCollectionData?.posts?.length
      ) {
        dispatch(
          imagesActions.setCollectionData({
            ...curCollectionData,
            posts: [...(curCollectionData?.posts || []), newPost],
          })
        );
        // console.log(collectionImagesData);
        // console.log(images);
        if (
          !collectionImagesData?.collectionId ||
          collectionId === collectionImagesData.collectionId
        ) {
          dispatch(
            imagesActions.setCollectionImages({
              collectionId: collectionId,
              isLastPage: !curCollectionData?.posts?.length,
              ...collectionImagesData,
              images: [
                images.sort((a, b) => {
                  return Date.parse(a.createdAt) - Date.parse(b.createdAt);
                }),
                ...(collectionImagesData?.images?.filter(
                  (image) => image[0].postId !== postId
                ) || []),
              ],
            })
          );
        }
      }
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  };
};

export const getCollection = (collectionId) => {
  return async (dispatch, getState) => {
    try {
      // dispatch(imagesActions.setCollectionIsLoading(true));

      const collectionData = await getCollectionData(collectionId);

      dispatch(imagesActions.setCollectionData(collectionData));
    } catch (err) {
      // console.log(err);
      throw new Error(err.message);
    }
    //  finally {
    //   dispatch(imagesActions.setCollectionIsLoading(false));
    // }
  };
};

export const getCollectionPreviews = (
  activeCategory,
  activeSubcategory,
  loadMore = false,
  nsfwMode
) => {
  return async (dispatch, getState) => {
    try {
      dispatch(imagesActions.setErrorMessage(""));
      if (!loadMore) {
        lastVisiblePreview = "";
        dispatch(imagesActions.setIsLastPreviewsPage(false));
      }
      const uid = getState().auth.user.uid;
      const activeCategory = getState().images.activeCategory;
      const activeSubcategory = getState().images.activeSubcategory;
      const isLastPreviewsPage = getState().images.isLastPreviewsPage;
      //   const sortBy = getState().tabs.sortBy;
      const sortBy = "name";
      const collectionPreviews = getState().images.collectionPreviews;
      // console.log(activeCategory);
      // console.log(activeSubcategory);
      if (isLastPreviewsPage || !activeCategory) return;

      dispatch(imagesActions.setPreviewsIsLoading(true));
      const direction = sortBy === "name" ? "asc" : "desc";
      const order = orderBy(sortBy, direction);
      // let q;

      const nsfwFilter = !nsfwMode ? [false] : [true, false];

      const optionalWhere = [];

      if (activeCategory && activeCategory !== "all") {
        optionalWhere.push(where("category", "==", activeCategory));
      }
      if (activeSubcategory && activeSubcategory !== "all") {
        optionalWhere.push(
          where("subcategories", "array-contains", activeSubcategory)
        );
      }
      //   if (baseModel && baseModel !== "-") {
      //     optionalWhere.push(where("baseModel", "==", baseModel));
      //   }
      // console.log(activeCategory);
      // console.log(activeSubcategory);

      const q = query(
        collection(firestore, "users", uid, `collectionPreviews`),
        ...optionalWhere,
        where("nsfw", "in", nsfwFilter),
        order,
        startAfter(lastVisiblePreview),
        limit(amountPerPage)
      );

      const querySnapshot = await getDocs(q);

      const collectionsData = querySnapshot.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return { type: "collection", ...doc.data() };
      });
      // console.log(collectionsData);

      const isLast =
        !querySnapshot.docs.length || querySnapshot.docs.length < amountPerPage;

      if (!isLast) {
        lastVisiblePreview = querySnapshot.docs[querySnapshot.docs.length - 1];
      }
      // console.log(collectionPreviews);
      if (collectionsData)
        dispatch(
          imagesActions.setCollectionPreviews({
            // tab: activeTab,
            category: activeCategory,
            subcategory: activeSubcategory,
            nsfw: nsfwMode,
            data: loadMore
              ? [...(collectionPreviews?.data || []), ...collectionsData]
              : collectionsData,
          })
        );

      dispatch(imagesActions.setIsLastPreviewsPage(isLast));
      dispatch(imagesActions.setPreviewsIsLoading(false));
    } catch (err) {
      dispatch(imagesActions.setPreviewsIsLoading(false));
      dispatch(imagesActions.setErrorMessage(handleErrors(err)));
    }
  };
};

// export const getImagesByIds = (ids, loadMore = false, nsfwMode) => {
//   return async (dispatch, getState) => {
//     try {
//       dispatch(imagesActions.setErrorMessage(""));
//       if (!loadMore) {
//         lastVisiblePost = "";
//         dispatch(imagesActions.setIsLastPage(false));
//       }
//       const uid = getState().auth.user.uid;
//       const isLastPage = getState().images.isLastPage;
//       //   const sortBy = getState().tabs.sortBy;
//       const sortBy = "createdAt";
//       const curCollectionImages = getState().images.collectionImages;

//       //   if (isLastPage) return;

//       dispatch(imagesActions.setImagesIsLoading(true));
//       //   const direction = "desc";
//       const direction = "asc";
//       const order = orderBy(sortBy, direction);

//       const nsfwFilter = nsfwMode ? [false] : [true, false];

//       const q = query(
//         collection(firestore, "users", uid, `images`),
//         where("id", "in", ids),
//         where("hasSfw", "in", nsfwFilter),
//         order,
//         startAfter(lastVisiblePost),
//         limit(amountPerPage)
//       );

//       const querySnapshot = await getDocs(q);

//       const collectionsData = querySnapshot.docs.map((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         return doc.data();
//       });
//       console.log(collectionsData);

//       const isLast =
//         !querySnapshot.docs.length || querySnapshot.docs.length < amountPerPage;

//       if (!isLast) {
//         lastVisiblePost = querySnapshot.docs[querySnapshot.docs.length - 1];
//       }
//       if (collectionsData)
//         dispatch(
//           imagesActions.setCollectionImages([
//             ...curCollectionImages,
//             ...collectionsData,
//           ])
//         );

//       dispatch(imagesActions.setIsLastPage(isLast));
//       dispatch(imagesActions.setImagesIsLoading(false));
//     } catch (err) {
//       dispatch(imagesActions.setImagesIsLoading(false));
//       dispatch(imagesActions.setErrorMessage(handleErrors(err)));
//     }
//   };
// };
export const getColectionImagesByIds = (posts, collectionId) => {
  return async (dispatch, getState) => {
    try {
      // dispatch(imagesActions.setImagesIsLoading(true));
      const uid = getState().auth.user.uid;
      const collectionImages = getState().images.collectionImages;
      // console.log(posts);
      const fileteredPosts = posts.filter((post) => post?.postId);
      // console.log(fileteredPosts);
      // console.log(collectionImages);
      if (collectionImages?.isLastPage) return;
      const savedImagesData = getState().images.collectionData?.posts?.toSorted(
        (a, b) => b.createdAt - a.createdAt
      );
      const nsfwMode = getState().general.nsfwMode;
      const nsfwLevel = getState().general.nsfwLevel;
      const lastVisibleId = collectionImages?.lastVisibleId;
      // console.log(collectionImages);
      const lastVisibleIndex = fileteredPosts.findIndex(
        (post) => post.postId === lastVisibleId
      );
      // console.log(fileteredPosts);
      // console.log(lastVisibleIndex);
      // setExamplesIsLoading(true);
      let from;
      let to;
      if (lastVisibleIndex < 0 && !lastVisibleId) {
        from = 0;
        to = SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE + 1;
      } else {
        from = lastVisibleIndex;
        to = lastVisibleIndex + SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE + 1;
      }

      // from = pageIndex * SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE;
      //   to =
      //   pageIndex * SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE +
      //     SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE;
      // setErrorMessage("");
      // console.log("GETCH");
      const nsfwFilter = !nsfwMode ? [true] : [true, false];

      // console.log(pageIndex);
      // console.log(from, to);

      const curPosts = fileteredPosts.slice(from, to);
      const ids = curPosts?.map((post) => post.postId);
      console.log(ids);

      const q = query(
        collection(firestore, "users", uid, "images"),
        where("id", "in", ids),
        where("hasSfw", "in", nsfwFilter),
        orderBy("createdAt", "desc"),
        //   startAfter(lastVisible),
        limit(SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE + 1)
      );

      const modelImagesSnap = await getDocs(q);

      // const isLast =
      //   !modelImagesSnap.docs.length ||
      //   modelImagesSnap.docs.length <= SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE;
      const isLast = ids.length <= SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE;

      const data = modelImagesSnap.docs.flatMap((doc, i) => {
        return doc.data();
      });

      // console.log(data);
      // console.log(data.length);
      // console.log(isLast);

      const examples = data
        .map((post) => {
          const savedPostImages = post.items.filter((image) => {
            const saved =
              savedImagesData?.length &&
              savedImagesData
                ?.find((postData) => postData.postId === image.postId)
                ?.imageIds?.includes(image.id);

            const isInCurrentNsfwRange = checkIsInCurrentNsfwRange(
              nsfwLevel,
              image?.nsfwLevel
            );

            return saved && isInCurrentNsfwRange;
          });

          return filterDuplicates(savedPostImages, "id").toSorted((a, b) => {
            return Date.parse(a.createdAt) - Date.parse(b.createdAt);
          });
        })
        // .map((post) => {
        //   const savedPostImages = post.items.filter((image) => {
        //     const saved =
        //       savedImagesData?.length &&
        //       savedImagesData
        //         ?.find((postData) => postData.postId === image.postId)
        //         ?.imageIds?.includes(image.id);

        //     const isInCurrentNsfwRange = checkIsInCurrentNsfwRange(
        //       nsfwLevel,
        //       image?.nsfwLevel
        //     );

        //     return saved && isInCurrentNsfwRange;
        //   });

        //   return filterDuplicates(savedPostImages, "id").toSorted((a, b) => {
        //     return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        //   });
        // })
        .filter((item) => !!item.length)
        .toSorted((a, b) => {
          return (
            curPosts.find((post) => post.postId === b[0].postId).createdAt -
            curPosts.find((post) => post.postId === a[0].postId).createdAt
          );
        })
        .slice(0, SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE);

      // setExamplesImgData((prevState) => [...prevState, ...examples]);

      // const lastVisiblePost =
      //   modelImagesSnap.docs[modelImagesSnap.docs.length - 1];
      // if (!isLast) {
      //   setLastVisible(lastVisiblePost);
      // }
      // console.log(examples);

      dispatch(
        imagesActions.setCollectionImages({
          collectionId,
          lastVisibleId: ids?.length ? ids[ids.length - 1] : null,
          images: [...(collectionImages.images || []), ...examples],
          isLastPage: isLast,
        })
      );

      // setIsLastPage(isLast);
      // setPageIndex((prevState) => prevState + 1);
    } catch (err) {
      console.log(err);
      // setErrorMessage(err);
    } finally {
      // dispatch(imagesActions.setImagesIsLoading(false));
      // setExamplesIsLoading(false);
    }
  };
};

export const editCollectionData = ({
  collectionData,
  categoryData,
  subcategoriesData,
  description,
  nsfw,
}) => {
  return async (dispatch, getState) => {
    try {
      if (!collectionData?.name || !categoryData?.name) return;

      dispatch(imagesActions.setCollectionDataIsSaving(true));

      const batch = writeBatch(firestore);

      // const collectionId = collectionData.id;

      const uid = getState().auth.user.uid;
      const categories = getState().images.categories;
      const curCollectionData = getState().images.collectionData;

      const curCategoryData = categories.find(
        (category) => category.name === categoryData.name
      );
      // console.log(curCategoryData);
      const existedCollectionName = curCategoryData?.collectionNames?.find(
        (collection) => collection.id === collectionData?.id
      )?.name;

      const categoryId =
        categoryData?.id || createCategoryId(categoryData.name, categories);
      const collectionId =
        collectionData?.id ||
        createCategoryId(collectionData.name, curCategoryData?.collectionNames);

      let newSubcategories = [];

      const newSubcategoryIds = subcategoriesData.flatMap((subcategory) => {
        if (!subcategory.name) {
          return [];
        }
        if (!subcategory.id) {
          const subData = {
            id: createCategoryId(
              subcategory.name,
              curCategoryData?.subcategories
            ),
            name: subcategory.name,
          };
          newSubcategories.push(subData);
          return subData.id;
        }
        return subcategory.id;
      });

      // const newCollectionSubcategoryIds = filterDuplicates([
      //   ...newSubcategoryIds,
      //   ...curCollectionSabcategories,
      // ]);

      // const curCollectionSubcategoriesFFF = curCollectionSabcategories.collectionNames.find(collectionName=> {
      //   collectionName.id === collectionData?.name
      // })?.subcategories

      const clollectionSubcategoriesIsChanged = !checkArraysIsEqual(
        newSubcategoryIds,
        curCollectionData.subcategories
      );

      const collectionsRef = doc(
        firestore,
        "users",
        uid,
        "collections",
        collectionId + ""
      );
      const collectionsPreviewRef = doc(
        firestore,
        "users",
        uid,
        "collectionPreviews",
        collectionId + ""
      );
      const userRef = doc(firestore, "users", uid);

      let updatedCategories;
      let collectionNames;

      if (!categories?.length || !categoryData.id) {
        // console.log("NEW");
        collectionNames = [
          {
            id: collectionId,
            name: collectionData.name,
            subcategories: newSubcategoryIds,
          },
        ];
        updatedCategories = [
          ...categories,
          {
            id: categoryId,
            name: categoryData.name,
            subcategories: newSubcategories,
            collectionNames,
          },
        ];
      } else {
        // console.log("UPD");
        updatedCategories = categories.map((category) => {
          if (categoryData.id && categoryId === category.id) {
            const prevCollectionNames = category.collectionNames.filter(
              (prevCollectionName) => prevCollectionName.id !== collectionId
            );
            const prevSubcategories =
              prevCollectionNames.find(
                (prevCollectionName) => prevCollectionName.id === collectionId
              )?.subcategories || [];

            collectionNames = [
              ...prevCollectionNames,
              {
                id: collectionId,
                name: collectionData.name,
                subcategories: newSubcategoryIds,
              },
            ];

            // const collectionNames = !collectionData.id
            //   ? [
            //       ...category.collectionNames,
            //       { id: collectionId, name: collectionData.name },
            //     ]
            //   : category.collectionNames;

            return {
              ...category,
              subcategories: [...category.subcategories, ...newSubcategories],
              collectionNames,
            };
          }
          return category;
        });
      }

      const preview = {
        name: collectionData.name,
        nameArr: collectionData.name.toLowerCase().split(" "),
        category: categoryId,
        subcategories: newSubcategoryIds,
        nsfw,
      };

      const collection = {
        ...preview,
        description,
      };

      dispatch(imagesActions.setImageCategories(updatedCategories));
      dispatch(
        imagesActions.setCollectionData({ ...curCollectionData, ...collection })
      );

      batch.update(collectionsPreviewRef, preview, { merge: true });
      batch.update(collectionsRef, collection, { merge: true });
      // console.log(existedCollectionName);
      // console.log(collectionData?.name);
      if (
        !collectionData.id ||
        !categoryData.id ||
        newSubcategories.length ||
        existedCollectionName !== collectionData?.name ||
        clollectionSubcategoriesIsChanged
      ) {
        batch.set(
          userRef,
          {
            imageCategories: updatedCategories,
          },
          { merge: true }
        );
      }

      await batch.commit();
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    } finally {
      dispatch(imagesActions.setCollectionDataIsSaving(false));
    }
  };
};

export const updateCollectionPostsData = (postInfo, postData) => {
  return async (dispatch, getState) => {
    try {
      const uid = getState().auth.user.uid;

      const collectionData = getState().images.collectionData;

      // console.log(postInfo);
      // console.log(postData);
      // console.log(collectionData);

      const imageIds = postInfo?.ids?.length
        ? postData.imageIds.filter((imageId) => !postInfo.ids.includes(imageId))
        : [];

      let updatedPosts;

      if (!imageIds?.length) {
        // console.log("FILTER");
        updatedPosts = collectionData.posts.filter(
          (post) => post.postId !== postData.postId
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

      // console.log(updatedPosts);

      const collectionsRef = doc(
        firestore,
        "users",
        uid,
        "collections",
        collectionData.id + ""
      );

      const batch = writeBatch(firestore);

      // batch.update(
      //   collectionsRef,
      //   {
      //     posts: arrayRemove(postData),
      //   },
      //   { merge: true }
      // );

      // if (!!imageIds.length) {
      //   batch.update(
      //     collectionsRef,
      //     {
      //       posts: arrayUnion({
      //         postId: postData.postId,
      //         imageIds,
      //         createdAt: postData.createdAt,
      //       }),
      //     },
      //     { merge: true }
      //   );
      // }

      batch.update(
        collectionsRef,
        {
          posts: updatedPosts,
        },
        { merge: true }
      );

      await batch.commit();
      dispatch(
        imagesActions.setCollectionData({
          ...collectionData,
          posts: updatedPosts,
        })
      );
      const collectionImagesData = getState().images.collectionImages;
      if (collectionImagesData?.collectionId) {
        // console.log(collectionImagesData);
        // console.log(imageIds);
        let updatedImages;
        if (!imageIds.length) {
          updatedImages = collectionImagesData.images.filter(
            (post) => post[0].postId !== postData.postId
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
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const updateCollectionCategories = (categories) => {
  return async (dispatch, getState) => {
    try {
      const uid = getState().auth.user.uid;
      const userRef = doc(firestore, "users", uid);

      await setDoc(
        userRef,
        {
          imageCategories: categories,
        },
        { merge: true }
      );

      dispatch(imagesActions.setImageCategories(categories));
    } catch (err) {
      console.log(err);
    }
  };
};

export const addNewCollectionCategories = ({
  collectionData,
  categoryData,
  subcategoriesData,
  curCollectionSabcategories,
}) => {
  return async (dispatch, getState) => {
    try {
      const hasNewSubcategories = subcategoriesData?.find(
        (subcategory) => !subcategory?.id
      );
      // console.log(collectionData, categoryData, subcategoriesData);
      //Check for new categories data
      if (!hasNewSubcategories && categoryData?.id && collectionData?.id) {
        // console.log("NO NEW");
        return {
          collectionData,
          categoryData,
          subcategoriesData,
          curCollectionSabcategories,
        };
      }

      const uid = getState().auth.user.uid;
      const userRef = doc(firestore, "users", uid);

      const userDataDoc = await getDoc(userRef);

      let latestCategories;

      if (userDataDoc.exists()) {
        const userData = userDataDoc.data();
        latestCategories = userData?.imageCategories || [];
      } else {
        throwCustomError(ERROR_MESSAGE_DB_CONNECTION);
      }
      // console.log(latestCategories);

      const curCategoryData = latestCategories.find(
        (category) => category.name === categoryData.name
      );

      const categoryId =
        categoryData?.id ||
        createCategoryId(categoryData.name, latestCategories);
      const collectionId =
        collectionData?.id || createCollectionId(latestCategories);

      let newSubcategories = [];
      let newSubcategoryIds = [];

      const subcategories = subcategoriesData.flatMap((subcategory) => {
        if (!subcategory.name) {
          return [];
        }
        if (!subcategory.id) {
          const newId = createCategoryId(
            subcategory.name,
            curCategoryData?.subcategories
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

      let updatedCategories;

      if (!latestCategories?.length || !categoryData.id) {
        // console.log("NEW");
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
        // batch.set(
        //   userRef,
        //   {
        //     imageCategories: updatedCategories,
        //   },
        //   { merge: true }
        // );
      } else {
        // console.log("UPD");
        updatedCategories = latestCategories.map((category) => {
          if (categoryData.id && categoryId === category.id) {
            const collectionNames = !collectionData.id
              ? [
                  ...category.collectionNames,
                  {
                    id: collectionId,
                    name: collectionData.name,
                    subcategories: newCollectionSubcategoryIds,
                  },
                ]
              : category.collectionNames;

            return {
              ...category,
              subcategories: [...category.subcategories, ...newSubcategories],
              collectionNames,
            };
          }
          return category;
        });
      }

      // console.log(updatedCategories);
      if (!collectionData?.id && collectionId) {
        const collectionsRef = doc(
          firestore,
          "users",
          uid,
          "collections",
          collectionId + ""
        );
        const collectionsPreviewRef = doc(
          firestore,
          "users",
          uid,
          "collectionPreviews",
          collectionId + ""
        );

        const savedImagesToCatPrev = {
          id: collectionId,
          name: collectionData.name,
          nameArr: collectionData.name.toLowerCase().split(" "),
          category: categoryId,
          nsfw: false,
          subcategories: subcategories.map((subcategory) => subcategory.id),
          createdAt: Date.now(),
        };

        const savedImagesToCat = {
          ...savedImagesToCatPrev,
          description: "",
          posts: [],
        };
        // console.log(savedImagesToCatPrev);
        // console.log(savedImagesToCat);
        await setDoc(collectionsRef, savedImagesToCat, { merge: true });
        await setDoc(collectionsPreviewRef, savedImagesToCatPrev, {
          merge: true,
        });
      }

      await dispatch(updateCollectionCategories(updatedCategories));
      dispatch(imagesActions.setImageCategories(updatedCategories));
      // return updatedCategories;
      return {
        collectionData: { name: collectionData.name, id: collectionId },
        categoryData: { name: categoryData.name, id: categoryId },
        subcategoriesData: subcategories,
        curCollectionSabcategories,
      };
    } catch (err) {
      console.log(err);
    }
  };
};

export const deleteCollection = (collectionId, categoryId) => {
  return async (dispatch, getState) => {
    try {
      const uid = getState().auth.user.uid;
      const categories = getState().images.categories;
      const userRef = doc(firestore, "users", uid);
      const collectionsRef = doc(
        firestore,
        "users",
        uid,
        "collections",
        collectionId + ""
      );
      const collectionsPreviewRef = doc(
        firestore,
        "users",
        uid,
        "collectionPreviews",
        collectionId + ""
      );

      const curCategoryIndex = categories.findIndex(
        (category) => category.id === categoryId
      );

      const updatedCollectionNames = categories[
        curCategoryIndex
      ].collectionNames.filter((collection) => collection.id !== collectionId);

      const updatedCategories = categories.toSpliced(curCategoryIndex, 1, {
        ...categories[curCategoryIndex],
        collectionNames: updatedCollectionNames,
      });

      await setDoc(
        userRef,
        {
          imageCategories: updatedCategories,
        },
        { merge: true }
      );

      await deleteDoc(collectionsRef);
      await deleteDoc(collectionsPreviewRef);
    } catch (err) {
      throw new Error(handleErrors(err));
    }
  };
};

export const imagesActions = imagesSlice.actions;

export default imagesSlice;
