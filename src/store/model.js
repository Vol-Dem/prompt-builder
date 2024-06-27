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
import { saveToStorage, uploadStorage } from "../variables/utils";
import { authActions } from "./auth";

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
      if (actions.payload?.id) {
        state.model = actions.payload;
      } else {
        state.model = { ...state.model, ...actions.payload };
      }
    },
    resetModelData(state, actions) {
      state.model = {};
      state.modelPreview = [];
      state.errorMessage = "";
      state.curVersion = {};
      // state.curExampleImgsType = "saved";
      // state.examplesPage = 1;
      // state.examplesImages = [];
      // state.activeCarouselData = {};
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
      console.log(actions.payload);
      state.activeCarouselData = actions.payload;
    },
  },
  // extraReducers: (builder) => {
  //   builder.addCase(authActions.login, (state, actions) => {
  //     const uid = auth.currentUser.uid;
  //     state.nsfwMode = uploadStorage(`${uid}-nsfw`);
  //   });
  // },
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

// export const getModel = (modelId) => {
//   return async (dispatch, getState) => {
//     dispatch(modelActions.setIsLoading(true));
//     const uid = getState().auth.user.uid;

//     const unsub = onSnapshot(
//       doc(firestore, "users", uid, "models", modelId),
//       (doc) => {
//         const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
//         console.log(source);
//         const data = doc.data();
//         console.log(data);
//         if (!data) return;
//         dispatch(modelActions.setModelData(data));

//         const curVersionId = data.data.modelVersions.find(
//           (version) =>
//             data?.modelVersionsCustomData.hasOwnProperty(version.id) &&
//             data.modelVersionsCustomData[version.id].downloadStatus
//         )?.id;
//         const curVersionData = curVersionId
//           ? data.data.modelVersions.find(
//               (version) => version.id === curVersionId
//             )
//           : data.data.modelVersions[0];
//         dispatch(modelActions.setModelPreview({}));
//         dispatch(modelActions.setIsLoading(false));
//         dispatch(modelActions.setCurVersion(curVersionData));
//       }
//     );
//   };
// };

export const updateModel = (modelId) => {
  return async (dispatch, getState) => {
    console.log("UPD");
    const uid = getState().auth.user.uid;
    const modelData = getState().model.model;
    const data = await getModelData(modelId);

    const newVerison = data.modelVersions.filter(
      (version) =>
        !modelData.data.modelVersions.some(
          (oldVersions) => version.id === oldVersions.id
        )
    );
    console.log(newVerison);
    if (!newVerison.length) {
      console.log("NO UPDATEDS");
      return;
    }

    data.modelVersions = [...newVerison, ...modelData.data.modelVersions];
    console.log(data);

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
    console.log(modelVersionsCustomData);

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
    // const modelType =
    //   type === "Checkpoint" ? "checkpoints preview" : "models preview";
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
    console.log(urlField);
    console.log(tagSetData);
    // return;
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

    const del = await deleteDoc(imgPostRef);
    await updateDoc(modelRef, {
      [`savedImages.${versionId}`]: arrayRemove(postData),
    });

    console.log(del);
  };
};

// export const deleteImgPostDoc = (postId) => {
//   return async (dispatch, getState) => {
//     const uid = getState().auth.user.uid;
//     const id = getState().model.model.id;

//     const imgPostRef = doc(
//       firestore,
//       "users",
//       uid,
//       "models",
//       id + "",
//       "images",
//       postId + ""
//     );

//     const del = await deleteDoc(imgPostRef);

//     console.log(del);
//   };
// };

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
      // console.log(postsData);
      await makeBatchRequest(postsData, deleteImagePostDoc, 5, false);
    });

    // model.modelVersions.forEach(async version=>{
    //   const postsData = versionData.map((post) => {
    //     return {
    //       ...post,
    //       uid,
    //       modelId: model.id,
    //     };
    //   });
    //   // console.log(postsData);
    //   await makeBatchRequest(postsData, deleteImagePostDoc, 5, false);
    // })

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
