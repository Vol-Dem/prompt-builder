import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import Buttton from "../../ui/Button";
import classes from "./ChooseImageForm.module.scss";
import Spinner from "../../ui/Spinner";
import CheckSvg from "../../../assets/CheckSvg";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import ErrorMessage from "../../ui/ErrorMessage";
import { ERROR_MESSAGE_OFFLINE } from "../../../variables/constants";
import ImageLabel from "../../ui/forms/ImageLabel";
import SuccessMessage from "../../ui/SuccessMessage";

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
  }) => {
    const [imagesInputs, setImagesInputs] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const uid = useSelector((state) => state.auth.user.uid);
    const selectedAmount = imagesInputs.filter(
      (input) => input?.value && !input?.saved
    )?.length;
    const savedImages = useSelector((state) => state.model.savedImages);
    const isOnline = useOnlineStatus();

    useEffect(() => {
      if (!images.length || imagesInputs.length) return;

      const versionStatusInputData = images?.map((image, i) => {
        const checked = activeImageIndex === i;
        let saved;

        if (
          savedImageIds?.length &&
          type === "save"
          // location === "models"
        ) {
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

    const imageStatusChangeHandler = (e) => {
      setImagesInputs((prevState) => {
        const newState = [...prevState];
        const curIndex = newState.findIndex(
          (version) => version.id === +e.target.id
        );
        if (!newState[curIndex].saved) {
          newState[curIndex].value = e.target.checked;
        }
        return newState;
      });
    };

    const imagesListHtml = imagesInputs?.map((image, i) => {
      return (
        <li key={i} className={classes["images-list__item"]}>
          {image?.saved && (
            <div className={classes["images-list__icon"]}>
              <CheckSvg />
            </div>
          )}
          <ImageLabel htmlFor={image.id} imageData={image} type={type} />
          <input
            type="checkbox"
            className={classes["checkbox"]}
            id={image.id}
            name={image.name}
            checked={image.value}
            onChange={imageStatusChangeHandler}
            readOnly={!!image?.saved}
          />
        </li>
      );
    });

    const submitHandler = (saveAll) => {
      setSuccessMessage("");
      let imageIds;

      if (saveAll) {
        imageIds = null;
      } else {
        imageIds = imagesInputs
          .filter((input) => !!input.value)
          .map((input) => input.id);
      }

      let collectionData = {};

      if (location === "collections" && collectionInfo) {
        collectionData = collectionInfo;
      }

      onSave(location, imageIds, collectionData, postData);
    };

    return (
      <form className={classes["container"]}>
        {isOnline && (
          <ul className={classes["images-list"]}>{imagesListHtml}</ul>
        )}
        {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
        {!successMessage && (
          <div className={classes["btns"]}>
            <Buttton
              className={`${type === "del" ? classes["btn-del"] : ""}`}
              type="button"
              onClick={submitHandler.bind(null, true)}
              disabled={!!isDeleting || !isOnline}
            >
              {type === "save" ? "Save all" : "Delete all"}
            </Buttton>
            <Buttton
              className={`${type === "del" ? classes["btn-del"] : ""}`}
              type="button"
              disabled={!!isDeleting || !isOnline || !selectedAmount}
              onClick={submitHandler.bind(null, false)}
            >
              {type === "save" ? `Save (${selectedAmount}) selected` : ""}
              {type === "del" && !isDeleting ? "Delete selected" : ""}
              {!!isDeleting && <Spinner size="small" />}
            </Buttton>
          </div>
        )}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      </form>
    );
  }
);

export default ChooseImageForm;
