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
import {
  deleteImagePostDoc,
  getModelData,
  makeBatchRequest,
} from "../utils/fetchUtils";
import { getAuth } from "firebase/auth";
import { saveToStorage } from "../variables/utils";

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
    setModelData(state, actions) {
      state.model = { ...state.model, ...actions.payload };

      if (actions?.payload?.savedImages) {
        state.savedImages = {
          modelId: actions.payload.id,
          data: actions?.payload?.savedImages,
        };
      } else if (actions?.payload?.id && !actions?.payload?.savedImages) {
        state.savedImages = { modelId: null, data: {} };
      }
    },
    setSavedImages(state, actions) {
      state.savedImages = actions.payload;
    },
    updateSavedImages(state, actions) {
      const { versionId, postId, modelId } = actions.payload.postInfo;

      if (state.model.id !== modelId) return;

      if (state.savedImages.data.hasOwnProperty(`${versionId}`)) {
        const existedPostIndex = state.savedImages.data[versionId].findIndex(
          (post) => post.postId === postId
        );
        if (existedPostIndex !== -1) {
          const updatedSavedImages = [...state.savedImages.data[versionId]];
          updatedSavedImages[existedPostIndex] = actions.payload.data;

          state.savedImages.data[versionId] = updatedSavedImages;
        } else {
          const updatedSavedImages = [
            ...state.savedImages.data[versionId],
            actions.payload.data,
          ];
          state.savedImages.data[versionId] = updatedSavedImages;
        }
      } else {
        const updatedSavedImages = [actions.payload.data];
        state.savedImages = {
          modelId: modelId,
          data: {
            ...state.savedImages.data,
            [`${versionId}`]: updatedSavedImages,
          },
        };
      }
    },
    deleteSavedImages(state, actions) {
      const { versionId, postId, modelId } = actions.payload.postInfo;

      if (state.model.id !== modelId) return;

      if (state.savedImages.data.hasOwnProperty(`${versionId}`)) {
        const existedPostIndex = state.savedImages.data[versionId].findIndex(
          (post) => post.postId === postId
        );
        if (existedPostIndex !== -1) {
          // const updatedSavedImages = [...state.savedImages.data[versionId]];
          // updatedSavedImages[existedPostIndex] = actions.payload.data;

          // state.savedImages.data[versionId] = updatedSavedImages;
          state.savedImages.data[versionId].splice(existedPostIndex, 1);
        }
      }
    },
    resetModelData(state, actions) {
      state.model = {};
      state.modelPreview = [];
      state.errorMessage = "";
      state.curVersion = {};
    },
    setIsLoading(state, actions) {
      state.isLoading = actions.payload;
    },
    setCurVersion(state, actions) {
      state.curVersion = actions.payload;
    },
    setModelPreview(state, actions) {
      state.modelPreview = actions.payload;
    },
    setNsfwMode(state, actions) {
      state.nsfwMode = actions.payload;
      const uid = auth.currentUser?.uid;
      if (uid) saveToStorage(`${uid}-nsfw`, actions.payload);
    },
    setErrorMessage(state, actions) {
      state.errorMessage = actions.payload;
    },
    setActiveCarouselData(state, actions) {
      state.activeCarouselData = actions.payload;
    },
  },
});

export const switchNsfwMode = (nsfw) => {
  return async (dispatch, getState) => {
    dispatch(modelActions.setNsfwMode(nsfw));
    const uid = getState().auth.user.uid;
    const userRef = doc(firestore, "users", uid);
    await updateDoc(
      userRef,
      {
        nsfwMode: nsfw,
      },
      {
        merge: true,
      }
    );
  };
};

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

export const setPreviewImg = (url, isNsfw = false) => {
  return async (__, getState) => {
    const uid = getState().auth.user.uid;
    const id = getState().model.model.id;

    const urlField = isNsfw ? "nsfwPreviewImgUrl" : "customPreviewImgUrl";

    const modelsPrevRef = doc(firestore, "users", uid, "preview", id + "");
    await setDoc(
      modelsPrevRef,
      {
        [`${urlField}`]: url,
      },
      { merge: true }
    );
  };
};

export const setTagSetPreviewImg = (versionId, tagSetData) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const id = getState().model.model.id;
    const model = getState().model.model;
    console.log(model);

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

      await makeBatchRequest(postsData, deleteImagePostDoc, 5, false);
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
