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
import { ERROR_MESSAGE_DEFAULT } from "../variables/constants";
import { deleteImagePostDocs } from "../utils/fetch/fetchImages";
import { makeBatchRequest } from "../utils/fetch/fetchUtils";
import type {
  ResourceFirestoreCollection,
  SrcType,
} from "../types/models.types";
import type { AppThunk } from "./store";
import type { TagSet } from "../types/prompt.types";
import { AppError, handleErrors, normalizeError } from "../utils/generalUtils";
import type { PostInfo } from "../types/upload.types";
import type { ModelCategory } from "../../shared/types/user";
import type { PostSavedData } from "../types/collections.types";

import { modelActions } from "./model";

const firestore = getFirestore(firebaseApp);

/**
 * Sets preview image for model or collection preview.
 *
 * Side effects:
 * - Sets SFW or NSFW preview image for model or collection preview.
 * - Updates preview data in Firestore
 *
 * @param {string} url - Image URL.
 * @param {boolean} [isNsfw=false] - Whether to set NSFW or SFW preview.
 * @param {'models' | 'collections'} location - Corresponding Firestore collection ("models" or "collections").
 * @param {number} locationId - Corresponding Firestore document ID.
 * @param {'image' | 'video'} [type='image'] - Src type.
 * @returns {Function} Redux thunk.
 */
export const setPreviewImg = (
  url: string,
  isNsfw: boolean = false,
  location: ResourceFirestoreCollection,
  locationId: number,
  type: SrcType = "image",
): AppThunk => {
  return async (_, getState) => {
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
        locationId + "",
      );

      await setDoc(
        locationPrevRef,
        {
          [`${urlField}`]: url,
          [`${typeField}`]: type,
        },
        { merge: true },
      );
    } catch (error) {
      handleErrors(normalizeError(error));
    }
  };
};

/**
 * Sets preview image for tag set.
 *
 * Side effects:
 * - Sets preview image for tag set.
 * - Updates tag sets data in Firestore
 * - Updates model state in Redux
 *
 * @param {number} versionId - Model version ID.
 * @param {object} tagSetData - Tag set data.
 * @returns {Function} Redux thunk.
 */
export const setTagSetPreviewImg = (
  versionId: string | "tsv-def",
  tagSetData: TagSet[],
): AppThunk => {
  return async (dispatch, getState) => {
    const uid = getState().auth.user.uid;
    const id = getState().model.model?.id;
    const model = getState().model.model;

    const urlField =
      versionId === "tsv-def"
        ? `defaultCustomData.tagSetsData`
        : `modelVersionsCustomData.${versionId}.tagSetsData`;

    const modelRef = doc(firestore, "users", uid, "models", id + "");
    await updateDoc(modelRef, {
      [`${urlField}`]: tagSetData,
    });

    if (!model) {
      throw new AppError(ERROR_MESSAGE_DEFAULT);
    }

    if (versionId === "tsv-def" && model?.defaultCustomData) {
      const updatedDefaultCustomData = {
        ...model.defaultCustomData,
        tagSetsData: tagSetData,
      };
      dispatch(
        modelActions.updateModelDataField({
          defaultCustomData: updatedDefaultCustomData,
        }),
      );
    } else if (model?.modelVersionsCustomData) {
      const updatedVersionsCustomData = {
        ...model?.modelVersionsCustomData,
        [versionId]: {
          ...model.modelVersionsCustomData[versionId],
          tagSetsData: tagSetData,
        },
      };
      dispatch(
        modelActions.updateModelDataField({
          modelVersionsCustomData: updatedVersionsCustomData,
        }),
      );
    }
  };
};

/**
 * Deletes a saved post.
 *
 * Side effects:
 * - Removes the version ID from the post's version list in Firestore
 * - Deletes the post document if no versions remain
 * - Updates saved images in Redux
 *
 * @param {{ versionId: number, postId: number, modelId: number }} postInfo - Post info.
 * @param {object} postData - Post data.
 * @returns {Function} Redux thunk.
 */
export const deleteImgPost = (
  postInfo: PostInfo,
  postData: PostSavedData,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const { versionId, postId } = postInfo;
      const uid = getState().auth.user?.uid;
      const id = getState().model.model?.id;
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
    } catch (error) {
      handleErrors(normalizeError(error));
    }
  };
};

/**
 * Deletes a model.
 *
 * Side effects:
 * - Deletes the model and its preview from Firestore
 * - Deletes all image posts saved for this model
 *
 * @returns {Function} Redux thunk.
 */
export const deleteModel = (): AppThunk => {
  return async (_, getState) => {
    const uid = getState().auth.user.uid;
    const model = getState().model.model;

    if (model?.savedImages) {
      Object.values(model.savedImages).forEach(async (versionData) => {
        const postsData = versionData.map((post) => {
          return {
            ...post,
            uid,
            modelId: model.id,
            type: "defaultImages",
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
        model.id + "",
      );

      await deleteDoc(modelRef);
      await deleteDoc(modelPreviewRef);
    }
  };
};

/**
 * Updates model categories.
 *
 * Side effects:
 * - Saves model categories to Firestore
 *
 * @param {string} modelType - Model type (lora, checkpoint, etc.).
 * @param {Array<Object>} updatedCat - Updated category list.
 * @returns {Function} Redux thunk.
 */
export const updateCategories = (
  modelType: string,
  updatedCat: ModelCategory[],
): AppThunk => {
  return async (_, getState) => {
    const uid = getState().auth.user.uid;
    if (uid) {
      const userRef = doc(firestore, "users", uid);
      const categoryField = `categoriesById.${modelType}`;

      await updateDoc(userRef, {
        [categoryField]: updatedCat,
      });
    }
  };
};
