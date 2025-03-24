import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Buttton from "../../ui/Button";
import Image from "../../ui/image/Image";
import classes from "./ChooseImageForm.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../../ui/Spinner";
import CheckSvg from "../../../assets/CheckSvg";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import ErrorMessage from "../../ui/ErrorMessage";
import {
  ERROR_MESSAGE_DEFAULT,
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  // SUBCATEGORIES_MAX_AMOUNT,
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_FADEOUT_EXIT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
  ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_NO_IMAGE_SELECTED,
} from "../../../variables/constants";
import { AnimatePresence, motion } from "framer-motion";
import ComboSelect from "../../ui/ComboSelect";
import Fieldset from "../../ui/Fieldset";
import ButttonSecondary from "../../ui/ButtonSecondary";
import ButtonTertiary from "../../ui/ButtonTertiary";
import CrossSvg from "../../../assets/CrossSvg";
import {
  createCategoryId,
  filterDuplicates,
  handleErrors,
} from "../../../utils/generalUtils";
import { savePostToCollections } from "../../../store/images";
import ImageLabel from "../../ui/forms/ImageLabel";
import SuccessMessage from "../../ui/SuccessMessage";
import { savePost } from "../../../store/upload";

// const SUBCATEGORIES_MAX_AMOUNT = 8;
// const subCatsDefData = {
//   type: "text",
//   id: "subcat-def",
//   name: "sub",
//   placeholder: "Subcategory",
//   value: "",
//   query: "",
//   selected: { id: null, name: "" },
//   isValid: true,
//   errorMessage: "",
// };

const ChooseImageForm = ({
  postId,
  type,
  location,
  collectionInfo,
  curCollectionSubcategories,
  images,
  modelId,
  versionId,
  activeImageIndex,
  // existedImgsAmount,
  onSave,
  isDeleting,
  postData,
  savedImageIds,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagesInputs, setImagesInputs] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const uid = useSelector((state) => state.auth.user.uid);
  const selectedAmount = imagesInputs.filter(
    (input) => input?.value && !input?.saved
  )?.length;
  // const model = useSelector((state) => state.model.model);
  const savedImages = useSelector((state) => state.model.savedImages);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const categories = useSelector((state) => state.images.categories);
  // const subcategories = useSelector((state) => state.images.subcategories);
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!images.length) return;
    // console.log(images);
    // console.log(savedImageIds);
    // console.log("CHECK");

    const versionStatusInputData = images?.map((image, i) => {
      let checked;
      let saved;
      if (
        savedImageIds?.length &&
        type === "save"
        // location === "models"
      ) {
        saved = savedImageIds.includes(image?.id);
      }
      const curStatus = imagesInputs.find((input) => input.id === image.id);
      checked = curStatus ? curStatus.value : activeImageIndex === i;
      // checked = activeImageIndex === i ? true : false;

      return {
        type: "checkbox",
        id: image.id,
        name: image.id,
        label: image.url,
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
    // imagesInputs,
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

  const saveToColection = async (imageIds, collectionData) => {
    try {
      setIsSaving(true);
      const imagesForSaving = imageIds?.length
        ? images.filter((image) => imageIds.includes(image?.id))
        : images;

      const postInfo = {
        postId,
        modelId: null,
        location,
        collectionData,
        modelName: null,
        versionId: null,
        nsfwMode,
        postData: postData,
        imgUrl: null,
        ids: imageIds || [],
        existedAmount: null,
        images: imagesForSaving,
      };

      await dispatch(savePost(postInfo));
      setSuccessMessage("Saved");
    } catch (err) {
      console.log(err);
      setErrorMessage(handleErrors(err));
    } finally {
      setIsSaving(false);
    }
  };

  const submitHandler = (saveAll) => {
    // console.log("TEST");
    setSuccessMessage("");
    // e.preventDefault();
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

    // console.log(location, imageIds, collectionData);

    // if (saveAll) {
    //   onSave(location, null, collectionData, postData);
    //   return;
    // }

    // return;
    // const hasNewImages =
    //   location === "collections"
    //     ? !!imageIds?.length
    //     : !!imageIds?.filter((id) => !savedImageIds.includes(id))?.length;

    // if (!hasNewImages) {
    //   setErrorMessage(ERROR_MESSAGE_NO_IMAGE_SELECTED);
    //   return;
    // }
    // console.log(type);
    // if (location === "collections" && type === "save") {
    //   saveToColection(imageIds, collectionData);
    // } else {
    //   onSave(location, imageIds, collectionData, postData);
    // }
    onSave(location, imageIds, collectionData, postData);
  };

  return (
    <form className={classes["container"]}>
      {!isLoading && isOnline && (
        <ul className={classes["images-list"]}>{imagesListHtml}</ul>
      )}
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
      {!!errorMessage && isOnline && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      {!successMessage && !isSaving && (
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
            disabled={isLoading || !!isDeleting || !isOnline || !selectedAmount}
            onClick={submitHandler.bind(null, false)}
          >
            {type === "save" ? `Save (${selectedAmount}) selected` : ""}
            {type === "del" && !isLoading && !isDeleting
              ? "Delete selected"
              : ""}
            {!!isDeleting && <Spinner size="small" />}
          </Buttton>
        </div>
      )}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {isSaving && (
        <div className={classes["uploading-message"]}>
          Uploading...
          <div className={classes.spiner}>
            <Spinner size="small" />
          </div>
        </div>
      )}
    </form>
  );
};

export default ChooseImageForm;
