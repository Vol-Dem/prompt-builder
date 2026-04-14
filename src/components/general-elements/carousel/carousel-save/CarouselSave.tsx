import {
  FolderArrowDownIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import classes from "./CarouselSave.module.scss";
import Spinner from "../../../ui/Spinner";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/buttons/Button";
import type { Image } from "../../../../../shared/types/image";
import type { ModelSavedPostInfo } from "../../../../../shared/types/model";
import { useAppSelector } from "../../../../store/hooks/hooks";
import type { CarouselImageFormState } from "../CarouselContent";
import type { ResourceFirestoreCollection } from "../../../../types/models.types";
import type {
  UploadingCollectionData,
  UploadingPostData,
} from "../../../../types/upload.types";

type CarouselSaveProps = {
  images: Image[];
  saved: boolean;
  postId: number;
  existedImgsAmount: number | null;
  onSave: (
    location: ResourceFirestoreCollection,
    ids: number[] | null,
    collectionData: UploadingCollectionData | null,
    postData: UploadingPostData | null,
  ) => void;
  onOpenForm: (formState: CarouselImageFormState | null) => void;
  postData: ModelSavedPostInfo | null;
};

/**
 * Carousel save buttons component.
 *
 * Renders controls for saving images from the active carousel to a model or collection.
 * If the post originates from an external source, also displays controls to save images
 * to the current model and shows how many images from the post are already saved.
 *
 * Behavior:
 * - Displays save buttons for post images.
 * - Shows the number of already saved images when used on a model page.
 * - Disables "Save to model" when all post images are already saved.
 * - Disables "Save to model" and displays a spinner while any image from the post
 *   is currently being uploaded.
 * - When saving to a collection, opens `SaveToCollectionForm`.
 * - When saving to a model:
 *   - If the carousel contains a single image, saves it immediately.
 *   - Otherwise opens `ChooseImageForm` to select images.
 *
 * Responsibilities:
 * - Determines available save actions based on post source and save state.
 * - Controls which save form should be opened.
 *
 * @component
 *
 * @param {object} props
 * @param {Array<object>} props.images - List of post images.
 * @param {boolean} props.saved - Whether the images were loaded from the application database.
 * @param {number} props.postId - Post ID.
 * @param {object} props.curPostData - Metadata of the current post.
 * @param {({ type: string, location: string, isOpen: boolean }) => void} props.onOpenForm
 *   Callback to open the appropriate save form.
 * @param {(type: string, location: string, isOpen: boolean, postData:Object) => void} props.onSave
 *   Callback triggered when a single image is saved directly to the model.
 *
 * @returns {JSX.Element} Carousel save buttons.
 */
const CarouselSave = ({
  images,
  saved,
  postId,
  existedImgsAmount,
  onSave,
  onOpenForm,
  postData,
}: CarouselSaveProps) => {
  const [chooseSaveLocationIsOpen, setChooseSaveLocationIsOpen] =
    useState(false);
  const queue = useAppSelector((state) => state.upload.queue);
  const isUploading = !!queue.find((item) => item.postId === postId);

  const showSaveImagesListHandler = (location: ResourceFirestoreCollection) => {
    if (images.length === 1 && location === "models") {
      onSave("models", null, null, postData);
    } else {
      onOpenForm({
        type: "save",
        location: location || null,
        isOpen: true,
      });
    }
  };

  return (
    <div className={classes["save"]}>
      {!saved && !!postId && (
        <div
          className={`${classes["save__btn"]} ${classes["save__btn--mobile"]}`}
        >
          <button
            className={`${classes["btn-save"]} ${
              isUploading ? classes["btn-save--saving"] : ""
            }`}
            onClick={() => {
              setChooseSaveLocationIsOpen(true);
            }}
            disabled={
              !!isUploading ||
              (existedImgsAmount !== null &&
                existedImgsAmount >= images?.length)
            }
            title="Save"
          >
            {!isUploading ? <FolderArrowDownIcon /> : <Spinner size="small" />}
          </button>
        </div>
      )}
      {!saved && !!postId && (
        <div className={classes["save__btn"]}>
          <button
            className={`${classes["btn-save"]} ${
              isUploading ? classes["btn-save--saving"] : ""
            }`}
            onClick={() => showSaveImagesListHandler("models")}
            disabled={
              !!isUploading ||
              (existedImgsAmount !== null &&
                existedImgsAmount >= images?.length)
            }
            title="Save to model"
          >
            {!isUploading ? <FolderArrowDownIcon /> : <Spinner size="small" />}
          </button>
          <span className={classes["save__btn-text"]}>Save to model</span>
        </div>
      )}
      <div
        className={`${classes["save__btn"]} ${
          classes["save__btn--collection"]
        } ${!saved && !!postId ? classes["save__btn--collection-hidden"] : ""}`}
      >
        <button
          className={`${classes["btn-save"]} ${
            isUploading ? classes["d"] : ""
          }`}
          onClick={() => showSaveImagesListHandler("collections")}
          title="Save to collection"
        >
          <FolderPlusIcon />
        </button>
        <span className={classes["save__btn-text"]}>Save to collection</span>
      </div>

      {existedImgsAmount && !saved && (
        <div className={classes["btn-save__amount"]}>
          {existedImgsAmount}/{images.length}
        </div>
      )}
      {chooseSaveLocationIsOpen && (
        <Modal
          onClose={() => {
            setChooseSaveLocationIsOpen(false);
          }}
        >
          <Button
            className={classes["btn-choose"]}
            onClick={() => {
              showSaveImagesListHandler("models");
              setChooseSaveLocationIsOpen(false);
            }}
          >
            Save to model
          </Button>
          <Button
            className={classes["btn-choose"]}
            onClick={() => {
              showSaveImagesListHandler("collections");
              setChooseSaveLocationIsOpen(false);
            }}
          >
            Save to collection
          </Button>
        </Modal>
      )}
    </div>
  );
};

export default CarouselSave;
