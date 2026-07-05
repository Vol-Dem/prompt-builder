import { memo, useEffect, useState, type ChangeEvent } from "react";

import Button from "../../ui/buttons/Button";
import classes from "./ChooseImageForm.module.scss";
import Spinner from "../../ui/Spinner";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import ErrorMessage from "../../ui/ErrorMessage";
import { ERROR_MESSAGE_OFFLINE } from "../../../variables/constants";
import ImageLabel from "../../ui/forms/ImageLabel";
import SuccessMessage from "../../ui/SuccessMessage";
import { useAppSelector } from "../../../store/hooks/hooks";
import type { ResourceFirestoreCollection } from "../../../types/models.types";
import type { Image } from "../../../../shared/types/image";
import type { ModelSavedPostInfo } from "../../../../shared/types/model";
import type {
  UploadingCollectionData,
  UploadingPostData,
} from "../../../types/upload.types";
import { CheckIcon } from "@heroicons/react/24/outline";
import type { CollectionSavedPost } from "../../../../shared/types/collection";

type ChooseImageFormProps = {
  type: "del" | "save";
  location: ResourceFirestoreCollection | null;
  collectionInfo?: UploadingCollectionData | null;
  images: Image[];
  modelId?: number | null;
  versionId?: number | null;
  activeImageIndex?: number;
  onSave: (
    location: ResourceFirestoreCollection,
    ids: number[] | null,
    collectionData: UploadingCollectionData | null,
    postData?: UploadingPostData | null,
  ) => void;
  isDeleting?: boolean;
  postData: ModelSavedPostInfo | CollectionSavedPost | null;
  savedImageIds: number[] | null;
};

type VersionStatusInputData = {
  type: string;
  id: number;
  name: number;
  data: Image;
  width: number;
  height: number;
  value: boolean;
  saved: boolean;
};

/**
 * Choose Image form component.
 *
 * Provides image saving and deleting flows for models and collections.
 * Displays a list of post images and allows selecting which images to save or delete by clicking them.
 * Already saved images are displayed as disabled and cannot be selected for saving.
 * Renders controls to save/delete all images at once or only the selected ones.
 *
 * Responsibilities:
 * - Renders a selectable list of post images.
 * - Detects and disables already saved images.
 * - Tracks active and selected image state.
 * - Displays validation and error messages.
 * - Prevents submission when the user is offline.
 *
 * Side effects:
 * - Adds selected images to the uploading queue.
 * - Dispatches image save/delete actions.
 *
 * @component
 * @param props
 * @param props.type - Defines whether images are being saved or deleted.
 * @param props.location - Target entity type for saving/deleting images.
 * @param props.collectionInfo - Target collection data (used when location is "collections").
 * @param props.images - List of post images.
 * @param props.modelId - Target model ID (used when location is "models").
 * @param props.activeImageIndex - Index of the image active when the form was opened.
 * @param props.onSave - Callback triggered with selected image IDs on submit.
 * @param props.isDeleting - Indicates whether delete operation is in progress.
 * @param props.postData - Source post data.
 * @param props.savedImageIds - IDs of images already saved.
 * @returns Choose Image form.
 */
const ChooseImageForm = memo(
  ({
    type,
    location,
    collectionInfo,
    images,
    modelId,
    versionId,
    activeImageIndex,
    onSave,
    isDeleting,
    postData,
    savedImageIds,
  }: ChooseImageFormProps) => {
    const [imagesInputs, setImagesInputs] = useState<VersionStatusInputData[]>(
      [],
    );
    const [successMessage, setSuccessMessage] = useState("");
    const uid = useAppSelector((state) => state.auth.user.uid);
    const savedImages = useAppSelector((state) => state.model.savedImages);
    const isOnline = useOnlineStatus();
    const selectedAmount = imagesInputs.filter(
      (input) => input?.value && !input?.saved,
    )?.length;

    useEffect(() => {
      if (!images.length || imagesInputs.length) return;

      const versionStatusInputData = images?.map((image, i) => {
        const checked = activeImageIndex === i;
        let saved;

        if (savedImageIds?.length && type === "save") {
          saved = savedImageIds.includes(image?.id);
        }

        return {
          type: "checkbox",
          id: image.id,
          name: image.id,
          data: image,
          width: image.width,
          height: image.height,
          value: saved || checked || false,
          saved: saved || false,
        };
      });

      const hasNotSaved = versionStatusInputData.find((image) => !image.saved);

      if (!hasNotSaved) {
        setSuccessMessage("All images are already in the collection");
      }

      setImagesInputs(versionStatusInputData || []);
    }, [
      images,
      activeImageIndex,
      savedImageIds,
      modelId,
      type,
      uid,
      savedImages,
      versionId,
      imagesInputs,
    ]);

    const imageStatusChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      if (!(e.target instanceof HTMLInputElement)) return;
      setImagesInputs((prevState) => {
        const newState = [...prevState];
        const curIndex = newState.findIndex(
          (version) => version.id === +(e.target as HTMLInputElement).id,
        );
        if (!newState[curIndex].saved) {
          newState[curIndex].value = (e.target as HTMLInputElement).checked;
        }
        return newState;
      });
    };

    const imagesListHtml = imagesInputs?.map((image, i) => {
      return (
        <li key={i} className={classes["images-list__item"]}>
          {image?.saved && (
            <div className={classes["images-list__icon"]}>
              <CheckIcon />
            </div>
          )}
          <ImageLabel imageData={image} type={type}>
            <input
              title={image.id + ""}
              type="checkbox"
              className={classes["checkbox"]}
              id={image.id + ""}
              name={image.name + ""}
              checked={image.value}
              onChange={imageStatusChangeHandler}
              readOnly={!!image?.saved}
            />
          </ImageLabel>
        </li>
      );
    });

    const submitHandler = (saveAll: boolean) => {
      setSuccessMessage("");
      let imageIds;

      if (saveAll) {
        imageIds = null;
      } else {
        imageIds = imagesInputs
          .filter((input) => !!input.value)
          .map((input) => input.id);
      }

      let collectionData = null;

      if (location === "collections" && collectionInfo) {
        collectionData = collectionInfo;
      }

      if (location) onSave(location, imageIds, collectionData, postData);
    };

    return (
      <form className={classes["container"]}>
        {isOnline && (
          <ul className={classes["images-list"]}>{imagesListHtml}</ul>
        )}
        {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
        {!successMessage && (
          <div className={classes["btns"]}>
            <Button
              className={`${type === "del" ? classes["btn-del"] : ""}`}
              type="button"
              onClick={submitHandler.bind(null, true)}
              disabled={!!isDeleting || !isOnline}
            >
              {type === "save" ? "Save all" : "Delete all"}
            </Button>
            <Button
              className={`${type === "del" ? classes["btn-del"] : ""}`}
              type="button"
              disabled={!!isDeleting || !isOnline || !selectedAmount}
              onClick={submitHandler.bind(null, false)}
            >
              {type === "save" ? `Save (${selectedAmount}) selected` : ""}
              {type === "del" && !isDeleting ? "Delete selected" : ""}
              {!!isDeleting && <Spinner size="small" />}
            </Button>
          </div>
        )}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      </form>
    );
  },
);

export default ChooseImageForm;
