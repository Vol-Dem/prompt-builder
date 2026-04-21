import { useState } from "react";

import classes from "./SaveImageForm.module.scss";
import Input from "../../ui/forms/Input";
import Select from "../../ui/forms/Select";
import Checkbox from "../../ui/forms/Checkbox";
import Button from "../../ui/buttons/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import Spinner from "../../ui/Spinner";
import {
  ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_EMPTY,
  ERROR_MESSAGE_OFFLINE,
  VALIDATION_POST_URL_MAX_LENGTH,
  ERROR_MESSAGE_INVALID_POST_ID,
  URL_CIV_IMAGES,
  ERROR_MESSAGE_CIV_CONNECTION,
} from "../../../variables/constants";
import ChooseImageForm from "../choose-image-form/ChooseImageForm";
import { uploadActions } from "../../../store/upload";
import {
  AppError,
  handleErrors,
  normalizeError,
} from "../../../utils/generalUtils";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import InfoPostId from "../../general-elements/info/InfoPostId";
import { getPostIdFromInput } from "../../../utils/imageUtils";
import { fixCivImagesMeta } from "../../../../shared/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type {
  ModelData,
  ResourceFirestoreCollection,
} from "../../../types/models.types";
import type { CollectionSavedPost } from "../../../../shared/types/collection";
import type { CollectionData } from "../../../types/collections.types";
import type {
  ModelSavedImages,
  ModelSavedPostInfo,
} from "../../../../shared/types/model";
import type { Image } from "../../../../shared/types/image";
import type { UploadingCollectionData } from "../../../types/upload.types";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

type SaveImageForm = {
  modelData?: ModelData;
  curVersion?: number;
  location: ResourceFirestoreCollection;
  collectionInfo?: CollectionData;
  savedPosts?: CollectionSavedPost[];
  savedModelPosts?: ModelSavedImages;
};

/**
 * Save Image form component.
 *
 * Allows saving images to the current model or collection using a post ID or URL.
 * Accepts a numeric post ID or a full Civitai URL, parses the ID when needed,
 * fetches post images from the Civitai API, and forwards the result to
 * ChooseImageForm for selection and saving.
 *
 * Model-specific behavior:
 * - When location is "models", renders additional inputs for model version.
 * - Provides a "Show only images related to this model" option to filter
 *   fetched post images to those generated with the selected model version.
 *
 * Responsibilities:
 * - Renders input for post ID / URL parsing.
 * - Extracts post ID from URLs.
 * - Fetches post image data from the Civitai API.
 * - Passes fetched images to ChooseImageForm.
 * - Displays validation and error messages.
 *
 * Side effects:
 * - Fetches post images from the Civitai API.
 *
 * @component
 * @param {object} props
 * @param {object} [props.modelData] - Current model data (used when location is "models").
 * @param {number} [props.curVersion] - Currently selected model version ID.
 * @param {('models' | 'collections')} props.location - Target entity type for saving images.
 * @param {object} [props.collectionInfo] - Target collection data (used when location is "collections").
 * @param {Array<Object>} [props.savedPosts] - IDs of images already saved to the collection.
 * @param {object} [props.savedModelPosts] - Map of version IDs to saved image IDs for models.
 * @returns {JSX.Element} Save Image form.
 */
const SaveImageForm = ({
  modelData,
  curVersion,
  location,
  collectionInfo,
  savedPosts,
  savedModelPosts,
}: SaveImageForm) => {
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
  const [successMessage, seteSuccessMessage] = useState("");
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
      seteSuccessMessage("");
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

      const imgExampleResponse = await fetch(
        `${URL_CIV_IMAGES}?postId=${postId}${
          filterDisabledInput && modelData?.id
            ? `&modelId=${modelData?.id}`
            : ""
        }&nsfw=${nsfwLevel}`,
      );
      console.log(imgExampleResponse);

      if (imgExampleResponse.status === 500) {
        throw new AppError(ERROR_MESSAGE_CIV_CONNECTION);
      }
      const data = (await imgExampleResponse.json()) as { items: Image[] };
      console.log(data);

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
        ids: ids || [],
        images: imagesForSaving,
        location,
        collectionData,
      }),
    );
    seteSuccessMessage("Added to download queue");
    setPostIdInput({ value: "", isValid: false });
    setShowErrorMessage(false);
    setImagesListIsOpen(false);
  };

  return (
    <>
      {imagesListIsOpen && (
        <button
          type="button"
          title="Back"
          className={classes["btn-back"]}
          onClick={() => {
            setImagesListIsOpen(false);
          }}
        >
          <ArrowUturnLeftIcon />
        </button>
      )}
      <div
        className={`${classes["form"]} ${
          imagesListIsOpen ? classes["hidden"] : ""
        }`}
      >
        {location === "models" && versionSelectOptions && (
          <Select
            label="Select version:"
            name="curVersionId"
            id="version-select"
            selected={versionIdInput || undefined}
            onChange={(value) => {
              setVersionIdInput(+value);
            }}
            options={versionSelectOptions}
          />
        )}
        <Input
          id="post-id"
          name="post-id"
          type="text"
          label={
            <>
              Post ID or URL{" "}
              <ButtonInfo className={classes["btn-info"]}>
                <InfoPostId />
              </ButtonInfo>
            </>
          }
          autoFocus
          placeholder="post id or url"
          disabled={isLoading}
          value={postIdInput.value}
          onChange={(e, isValid) => {
            setPostIdInput({ value: e.target.value, isValid });
          }}
          className={`${classes["auth__input"]} ${
            !postIdInput.isValid ? classes.invalid : ""
          }`}
          validation={{
            required: true,
            maxLength: VALIDATION_POST_URL_MAX_LENGTH,
          }}
          showError={showErrorMessage}
        />
        {location === "models" && (
          <div className={classes.filter}>
            <Checkbox
              id="filter"
              label="Show only images related to this model"
              checked={filterDisabledInput}
              className={classes["checkbox"]}
              onChange={(e) => {
                setFilterDisabledInput(e.target.checked);
              }}
            />
          </div>
        )}
        <Button
          type="button"
          disabled={isLoading}
          className={classes.submit}
          onClick={() => {
            loadPostImagesHandler();
          }}
        >
          {!isLoading ? "Select images" : <Spinner size="small" />}
        </Button>
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </div>
      {imagesListIsOpen && (
        <ChooseImageForm
          type="save"
          postData={postData}
          savedImageIds={savedImageIds}
          modelId={modelData?.id}
          location={location}
          collectionInfo={collectionInfo}
          images={images}
          onSave={saveExampleHandler}
        />
      )}
    </>
  );
};

export default SaveImageForm;
