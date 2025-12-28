import { useSelector } from "react-redux";
import {
  FolderArrowDownIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import classes from "./CarouselSave.module.scss";
import Spinner from "../../../ui/Spinner";
import Modal from "../../../ui/Modal";
import Buttton from "../../../ui/buttons/Button";

const CarouselSave = ({
  images,
  saved,
  postId,
  existedImgsAmount,
  onSave,
  onOpenForm,
  postData,
}) => {
  const [chooseSaveLocationIsOpen, setChooseSaveLocationIsOpen] =
    useState(false);
  const queue = useSelector((state) => state.upload.queue);
  const isUploading = !!queue.find((item) => item.postId === postId);

  const showSaveImagesListHandler = (location) => {
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
            disabled={!!isUploading || existedImgsAmount >= images?.length}
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
            disabled={!!isUploading || existedImgsAmount >= images?.length}
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
          <Buttton
            className={classes["btn-choose"]}
            onClick={() => {
              showSaveImagesListHandler("models");
              setChooseSaveLocationIsOpen(false);
            }}
          >
            Save to model
          </Buttton>
          <Buttton
            className={classes["btn-choose"]}
            onClick={() => {
              showSaveImagesListHandler("collections");
              setChooseSaveLocationIsOpen(false);
            }}
          >
            Save to collection
          </Buttton>
        </Modal>
      )}
    </div>
  );
};

export default CarouselSave;
