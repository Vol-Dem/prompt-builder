import { createSlice } from "@reduxjs/toolkit";
import {
  arrayRemove,
  deleteDoc,
  doc,
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
  return async (__, getState) => {
    const uid = getState().auth.user.uid;
    const id = getState().model.model.id;

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
  };
};

export const deleteImgPost = (versionId, postId, postData) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const id = getState().model.model.id;

    const modelRef = doc(firestore, "users", uid, "models", id + "");

    const imgPostRef = doc(
      firestore,
      "users",
      uid,
      "models",
      id + "",
      "images",
      postId + ""
    );

    await deleteDoc(imgPostRef);
    await updateDoc(modelRef, {
      [`savedImages.${versionId}`]: arrayRemove(postData),
    });
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
