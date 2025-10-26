import { createSlice } from "@reduxjs/toolkit";
import {
  arrayRemove,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import firebaseApp from "../firebase-config";
import { getAuth } from "firebase/auth";
import { saveToStorage } from "../variables/utils";
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";
import { authActions } from "./auth";
import { deleteImagePostDocs } from "../utils/fetch/fetchImages";
import { getModelData } from "../utils/fetch/fetchModel";
import { makeBatchRequest } from "../utils/fetch/fetchUtils";

const auth = getAuth(firebaseApp);

const firestore = getFirestore(firebaseApp);

const initialModelState = {
  model: {},
  savedImages: {
    modelId: null,
    data: {},
  },
  modelPreview: [],
  isLoading: true,
  errorMessage: "",
  curVersion: {},
  curExampleImgsType: "saved",
  examplesPage: 1,
  examplesImages: [],
  nsfwMode: false,
  activeCarouselData: {},
};

const modelSlice = createSlice({
  name: "model",
  initialState: initialModelState,
  reducers: {
    setModelData(state, action) {
      state.model = { ...state.model, ...action.payload };

      if (action?.payload?.savedImages) {
        state.savedImages = {
          modelId: action.payload.id,
          data: action?.payload?.savedImages,
        };
      } else if (action?.payload?.id && !action?.payload?.savedImages) {
        state.savedImages = { modelId: null, data: {} };
      }
    },
    setSavedImages(state, action) {
      state.savedImages = action.payload;
    },
    updateSavedImages(state, action) {
      const { versionId, postId, modelId } = action.payload.postInfo;

      if (state.model.id !== modelId) return;

      if (state.savedImages.data.hasOwnProperty(`${versionId}`)) {
        const existedPostIndex = state.savedImages.data[versionId].findIndex(
          (post) => post.postId === postId
        );
        if (existedPostIndex !== -1) {
          const updatedSavedImages = [...state.savedImages.data[versionId]];
          updatedSavedImages[existedPostIndex] = action.payload.data;

          state.savedImages.data[versionId] = updatedSavedImages;
        } else {
          const updatedSavedImages = [
            ...state.savedImages.data[versionId],
            action.payload.data,
          ];
          state.savedImages.data[versionId] = updatedSavedImages;
        }
      } else {
        const updatedSavedImages = [action.payload.data];
        state.savedImages = {
          modelId: modelId,
          data: {
            ...state.savedImages.data,
            [`${versionId}`]: updatedSavedImages,
          },
        };
      }
    },
    deleteSavedImages(state, action) {
      const { versionId, postId, modelId } = action.payload.postInfo;

      if (state.model.id !== modelId) return;

      if (state.savedImages.data.hasOwnProperty(`${versionId}`)) {
        const existedPostIndex = state.savedImages.data[versionId].findIndex(
          (post) => post.postId === postId
        );
        if (existedPostIndex !== -1) {
          state.savedImages.data[versionId].splice(existedPostIndex, 1);
        }
      }
    },
    resetModelData(state, action) {
      state.model = {};
      state.modelPreview = [];
      state.errorMessage = "";
      state.curVersion = {};
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setCurVersion(state, action) {
      state.curVersion = action.payload;
    },
    setModelPreview(state, action) {
      state.modelPreview = action.payload;
    },
    setNsfwMode(state, action) {
      state.nsfwMode = action.payload;
      const uid = auth.currentUser?.uid;
      if (uid) saveToStorage(`${uid}-nsfw`, action.payload);
    },
    setErrorMessage(state, action) {
      state.errorMessage = action.payload;
    },
    setActiveCarouselData(state, action) {
      state.activeCarouselData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, (state, action) => {
      modelSlice.caseReducers.resetModelData(state, action);
      state.activeCarouselData = {};
    });
  },
});

export const updateModel = (modelId) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const modelData = getState().model.model;
    const data = await getModelData(modelId);

    const newVerison = data.modelVersions.filter(
      (version) =>
        !modelData.data.modelVersions.some(
          (oldVersions) => version.id === oldVersions.id
        )
    );

    if (!newVerison.length) {
      return;
    }

    data.modelVersions = [...newVerison, ...modelData.data.modelVersions];

    const newVersionsCustomData = {};

    newVerison.forEach((version, i) => {
      newVersionsCustomData[version.id] = {
        versionId: version.id,
        versionName: version.name,
        versionImageUrl:
          version.images?.filter((img, i) => img.type === "image")[0]?.url ||
          "",
        downloadStatus: false,
      };
    });
    const modelVersionsCustomData = {
      ...newVersionsCustomData,
      ...modelData?.modelVersionsCustomData,
    };

    const modelsRef = doc(
      firestore,
      "users",
      uid,
      "models",
      modelData?.id + ""
    );
    const modelsPrevRef = doc(
      firestore,
      "users",
      uid,
      "preview",
      modelData?.id + ""
    );

    await updateDoc(
      modelsRef,
      {
        data: data,
        modelVersionsCustomData: modelVersionsCustomData,
      },
      { merge: true }
    );
    await updateDoc(
      modelsPrevRef,
      {
        modelVersionsCustomData: modelVersionsCustomData,
      },
      { merge: true }
    );
  };
};

export const setPreviewImg = (
  url,
  isNsfw = false,
  location,
  locationId,
  type = "image"
) => {
  return async (__, getState) => {
    try {
      const uid = getState().auth.user.uid;

      if (!url || !location || !locationId) {
        throw new Error(ERROR_MESSAGE_DEFAULT);
      }

      const urlField = isNsfw ? "nsfwPreviewImgUrl" : "customPreviewImgUrl";
      const typeField = isNsfw ? "nsfwPreviewImgType" : "customPreviewImgType";

      const dbCollectionName =
        location === "models" ? "preview" : "collectionPreviews";

      const locationPrevRef = doc(
        firestore,
        "users",
        uid,
        dbCollectionName,
        locationId + ""
      );

      await setDoc(
        locationPrevRef,
        {
          [`${urlField}`]: url,
          [`${typeField}`]: type,
        },
        { merge: true }
      );
    } catch (err) {
      console.log(err);
    }
  };
};

export const setTagSetPreviewImg = (versionId, tagSetData) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const id = getState().model.model.id;
    const model = getState().model.model;

    const urlField =
      versionId === "tsv-def"
        ? `defaultCustomData.tagSetsData`
        : `modelVersionsCustomData.${versionId}.tagSetsData`;

    const modelRef = doc(firestore, "users", uid, "models", id + "");
    await updateDoc(
      modelRef,
      {
        [`${urlField}`]: tagSetData,
      },
      { merge: true }
    );

    if (versionId === "tsv-def") {
      const updatedDefaultCustomData = {
        ...model.defaultCustomData,
        tagSetsData: tagSetData,
      };
      dispatch(
        modelActions.setModelData({
          defaultCustomData: updatedDefaultCustomData,
        })
      );
    } else {
      const updatedVersionsCustomData = {
        ...model.modelVersionsCustomData,
        [versionId]: {
          ...model.modelVersionsCustomData[versionId],
          tagSetsData: tagSetData,
        },
      };
      dispatch(
        modelActions.setModelData({
          modelVersionsCustomData: updatedVersionsCustomData,
        })
      );
    }
  };
};

export const deleteImgPost = (postInfo, postData) => {
  return async (dispatch, getState) => {
    try {
      const { versionId, postId } = postInfo;
      const uid = getState().auth.user.uid;
      const id = getState().model.model.id;
      const modelRef = doc(firestore, "users", uid, "models", id + "");

      const imgPostRef = doc(firestore, "users", uid, "images", postId + "");

      const docSnap = await getDoc(imgPostRef);

      if (docSnap.exists()) {
        const postVersions = docSnap.data()?.versionsId;

        if (postVersions?.length === 1) {
          await deleteDoc(imgPostRef);
        } else {
          await updateDoc(imgPostRef, {
            versionsId: arrayRemove(versionId),
          });
        }
      }

      await updateDoc(modelRef, {
        [`savedImages.${versionId}`]: arrayRemove(postData),
      });
      dispatch(modelActions.deleteSavedImages({ postInfo, data: postData }));
    } catch (err) {
      console.error(err.message);
    }
  };
};

export const deleteModel = (modelId) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const model = getState().model.model;

    Object.values(model.savedImages).forEach(async (versionData) => {
      const postsData = versionData.map((post) => {
        return {
          ...post,
          uid,
          modelId: model.id,
        };
      });

      await makeBatchRequest(postsData, deleteImagePostDocs, 5, false);
    });

    const modelRef = doc(firestore, "users", uid, "models", model.id + "");
    const modelPreviewRef = doc(
      firestore,
      "users",
      uid,
      "preview",
      model.id + ""
    );

    await deleteDoc(modelRef);
    await deleteDoc(modelPreviewRef);
  };
};

export const updateCategories = (modelType, updatedCat) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    if (uid) {
      const userRef = doc(firestore, "users", uid);
      const categoryField = `categoriesById.${modelType}`;

      await updateDoc(
        userRef,
        {
          [categoryField]: updatedCat,
        },
        { merge: true }
      );
    }
  };
};

export const modelActions = modelSlice.actions;

export default modelSlice;
