import { useState, type ChangeEvent } from "react";

import { uploadActions } from "../store/upload";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { AppError, handleErrors, normalizeError } from "../utils/generalUtils";
import { getPostIdFromInput } from "../utils/imageUtils";
import { fetchCivitaiPostImagesForSelection } from "../utils/fetch/fetchCivitaiImages";
import { fixCivImagesMeta } from "../../shared/utils";
import {
  ERROR_MESSAGE_INPUT_DEF, ERROR_MESSAGE_EMPTY,
  ERROR_MESSAGE_OFFLINE, ERROR_MESSAGE_INVALID_POST_ID,
} from "../variables/constants";
import type { ModelData, ResourceFirestoreCollection } from "../types/models.types";
import type { CollectionSavedPost } from "../../shared/types/collection";
import type { ModelSavedImages, ModelSavedPostInfo } from "../../shared/types/model";
import type { Image } from "../../shared/types/image";
import type { UploadingCollectionData } from "../types/upload.types";

type PostImageImportOptions = {
  modelData?: ModelData | null;
  curVersion?: number | null;
  location: ResourceFirestoreCollection;
  savedPosts?: CollectionSavedPost[];
  savedModelPosts?: ModelSavedImages;
};

/** Owns post lookup and queue preparation; image checkbox selection stays in ChooseImageForm. */
const usePostImageImport = ({
  modelData, curVersion, location, savedPosts, savedModelPosts,
}: PostImageImportOptions) => {
  const [filterDisabledInput, setFilterDisabledInput] = useState(true);
  const [imagesListIsOpen, setImagesListIsOpen] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [postData, setPostData] = useState<
    CollectionSavedPost | ModelSavedPostInfo | null
  >(null);
  const [savedImageIds, setSavedImageIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [versionIdInput, setVersionIdInput] = useState<number | null>(
    curVersion || modelData?.data?.modelVersions[0].id || null,
  );
  const [postIdInput, setPostIdInput] = useState({ value: "", isValid: false });
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const nsfwLevel = useAppSelector((state) => state.general.nsfwLevel);
  const dispatch = useAppDispatch();

  const loadPostImagesHandler = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setShowErrorMessage(true);

      if (!postIdInput.isValid) {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throw new AppError(ERROR_MESSAGE_OFFLINE);
      }

      if (!postIdInput?.value) return;

      setIsLoading(true);

      const postId = getPostIdFromInput(postIdInput.value);

      if (!postId) {
        throw new AppError(ERROR_MESSAGE_INVALID_POST_ID);
      }

      const data = await fetchCivitaiPostImagesForSelection({
        postId,
        modelId: filterDisabledInput ? modelData?.id : undefined,
        nsfwLevel,
      });

      setImages(fixCivImagesMeta(data.items));

      let curPostData = null;
      let curImageIds = null;

      if (location === "models" && savedModelPosts && versionIdInput) {
        curPostData = savedModelPosts[versionIdInput]?.find(
          (post) => post.postId === postId,
        );
        curImageIds = curPostData?.imagesId;
      }
      if (location === "collections") {
        curPostData = savedPosts?.find((post) => post.postId === postId);
        curImageIds = curPostData?.imageIds;
      }

      if (curPostData) {
        setPostData(curPostData);
        setSavedImageIds(curImageIds || []);
      }

      if (!data?.items?.length) {
        throw new AppError(ERROR_MESSAGE_EMPTY);
      }

      setImagesListIsOpen(true);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  let versionSelectOptions = modelData?.data?.modelVersions?.map((version) => {
    return {
      name: version.name,
      value: version.id,
    };
  });

  const saveExampleHandler = async (
    location: ResourceFirestoreCollection,
    ids: number[] | null,
    collectionData: UploadingCollectionData | null,
  ) => {
    const postId = getPostIdFromInput(postIdInput.value);

    if (!postId) {
      throw new AppError(ERROR_MESSAGE_INVALID_POST_ID);
    }

    const imagesForSaving = ids?.length
      ? images.filter((image) => ids.includes(image?.id))
      : images;

    let curPostData;

    if (
      location === "models" &&
      modelData &&
      versionIdInput &&
      modelData?.savedImages &&
      Object.hasOwn(modelData, "savedImages")
    ) {
      curPostData = modelData?.savedImages[versionIdInput]?.find(
        (post) => post.postId === +postId,
      );
    }

    if (location === "collections") {
      curPostData = savedPosts?.find((post) => post.postId === postId);
    }

    dispatch(
      uploadActions.addToQueue({
        postId: postId,
        modelId: modelData?.id || null,
        modelName: modelData?.name || null,
        versionId: versionIdInput ? +versionIdInput : null,
        nsfwMode,
        postData: curPostData || null,
        imgUrl: imagesForSaving[0].url,
        imgType: imagesForSaving[0].type || "image",
        ids: ids || [],
        images: imagesForSaving,
        location,
        collectionData,
      }),
    );
    setSuccessMessage("Added to download queue");
    setPostIdInput({ value: "", isValid: false });
    setShowErrorMessage(false);
    setImagesListIsOpen(false);
  };

  const changePostId = (e: ChangeEvent<HTMLInputElement>, isValid: boolean) => {
    setPostIdInput({ value: e.target.value, isValid });
  };

  const changeVersion = (value: string | number | null) => {
    if (!value) return;
    setVersionIdInput(+value);
  };

  const changeModelFilter = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterDisabledInput(e.target.checked);
  };

  const backToPost = () => {
    setImagesListIsOpen(false);
  };

  return {
    fields: {
      postId: { ...postIdInput, onChange: changePostId },
      version: { value: versionIdInput, options: versionSelectOptions, onChange: changeVersion },
      modelFilter: { checked: filterDisabledInput, onChange: changeModelFilter },
    },
    selection: { isOpen: imagesListIsOpen, images, postData, savedImageIds, onBack: backToPost, onSave: saveExampleHandler },
    status: { isLoading, errorMessage, showErrorMessage, successMessage },
    loadPostImages: loadPostImagesHandler,
  };
};

export default usePostImageImport;
