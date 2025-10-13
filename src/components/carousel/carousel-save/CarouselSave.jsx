import { useSelector } from "react-redux";
import classes from "./CarouselSave.module.scss";
import {
  FolderArrowDownIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import Spinner from "../../ui/Spinner";

const CarouselSave = ({
  images,
  saved,
  postId,
  existedImgsAmount,
  onSave,
  onOpenForm,
  postData,
}) => {
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
        <div className={classes["save__btn"]}>
          <button
            className={`${classes["btn-save"]} ${
              isUploading ? classes["btn-save--saving"] : ""
            }`}
            onClick={() => showSaveImagesListHandler("models")}
            disabled={!!isUploading || existedImgsAmount >= images?.length}
            title="Save"
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
          title="Save"
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
    </div>
  );
};

export default CarouselSave;
