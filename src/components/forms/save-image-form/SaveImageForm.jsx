import { useState } from "react";
import classes from "./SaveImageForm.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Checkbox from "../../ui/Checkbox";
import Buttton from "../../ui/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import Spinner from "../../ui/Spinner";
import {
  ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_EMPTY,
  ERROR_MESSAGE_OFFLINE,
  VALIDATION_POST_URL_MAX_LENGTH,
  ERROR_MESSAGE_INVALID_POST_ID,
} from "../../../variables/constants";
import ChooseImageForm from "../choose-image-form/ChooseImageForm";
import { uploadActions } from "../../../store/upload";
import BackSvg from "../../../assets/BackSvg";
import { handleErrors, throwCustomError } from "../../../utils/generalUtils";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import InfoPostId from "../../ui/guide/info/InfoPostId";
import { getPostIdFromInput } from "../../../utils/imageUtils";
import { fixCivImagesMeta } from "../../../utils/tempUtils";

const SaveImageForm = ({
  modelData,
  curVersion,
  location,
  collectionInfo,
  savedPosts,
  savedModelPosts,
}) => {
  const [filterDisabledInput, setFilterDisabledInput] = useState(true);
  const [imagesListIsOpen, setImagesListIsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [postData, setPostData] = useState({});
  const [savedImageIds, setSavedImageIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, seteSuccessMessage] = useState("");
  const [versionIdInput, setVersionIdInput] = useState(
    curVersion || modelData?.data?.modelVersions[0].id
  );
  const [postIdInput, setPostIdInput] = useState({ value: "", isValid: false });
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
  const dispatch = useDispatch();

  const loadPostImagesHandler = async () => {
    try {
      setErrorMessage("");
      seteSuccessMessage("");
      setShowErrorMessage(true);

      if (!postIdInput.isValid) {
        throwCustomError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throwCustomError(ERROR_MESSAGE_OFFLINE);
      }

      if (!postIdInput?.value) return;

      setIsLoading(true);

      const postId = getPostIdFromInput(postIdInput.value);

      if (!postId) {
        throwCustomError(ERROR_MESSAGE_INVALID_POST_ID);
      }

      const imgExampleResponse = await fetch(
        `https://civitai.com/api/v1/images?postId=${postId}${
          filterDisabledInput && modelData?.id
            ? `&modelId=${modelData?.id}`
            : ""
        }&nsfw=${nsfwLevel}`
      );
      const data = await imgExampleResponse.json();
      setImages(fixCivImagesMeta(data.items));

      let curPostData;
      let curImageIds;

      if (location === "models") {
        curPostData = savedModelPosts[versionIdInput]?.find(
          (post) => post.postId === postId
        );
        curImageIds = curPostData?.imagesId;
      }
      if (location === "collections") {
        curPostData = savedPosts?.find((post) => post.postId === postId);
        curImageIds = curPostData?.imageIds;
      }

      if (curPostData) {
        setPostData(curPostData);
        setSavedImageIds(curImageIds);
      }

      if (!data.items.length) {
        throwCustomError(ERROR_MESSAGE_EMPTY);
      }

      setImagesListIsOpen(true);
      setIsLoading(false);
    } catch (err) {
      setErrorMessage(handleErrors(err));
      setIsLoading(false);
    }
  };

  let versionSelectOption = modelData?.data?.modelVersions?.map((version) => {
    return {
      name: version.name,
      value: version.id,
    };
  });

  const saveExampleHandler = async (location, ids, collectionData) => {
    const postId = getPostIdFromInput(postIdInput.value);
    const postData =
      modelData?.hasOwnProperty("savedImages") &&
      modelData?.savedImages[versionIdInput?.value]?.find(
        (post) => post.postId === +postId
      );

    const imagesForSaving = ids?.length
      ? images.filter((image) => ids.includes(image?.id))
      : images;

    dispatch(
      uploadActions.addToQueue({
        postId: postId,
        modelId: +modelData?.id || null,
        modelName: modelData?.name || null,
        versionId: +versionIdInput || null,
        nsfwMode,
        postData: postData || null,
        imgUrl: imagesForSaving[0].url,
        ids: ids || [],
        images: imagesForSaving,
        location,
        collectionData,
      })
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
          className={classes["btn-back"]}
          onClick={() => {
            setImagesListIsOpen(false);
          }}
        >
          <BackSvg />
        </button>
      )}
      <div
        className={`${classes["form"]} ${
          imagesListIsOpen ? classes["hidden"] : ""
        }`}
      >
        {location === "models" && (
          <Select
            label="Select version:"
            name="curVersionId"
            id="version-select"
            selected={versionIdInput}
            onChange={(value) => {
              setVersionIdInput(value);
            }}
            options={versionSelectOption}
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
          input={{ disabled: isLoading }}
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
              value={filterDisabledInput}
              checked={filterDisabledInput}
              className={classes["checkbox"]}
              onChange={(e) => {
                setFilterDisabledInput(e.target.checked);
              }}
            />
          </div>
        )}
        <Buttton
          type="button"
          disabled={isLoading}
          className={classes.submit}
          onClick={() => {
            loadPostImagesHandler();
          }}
        >
          {!isLoading ? "Select images" : <Spinner size="small" />}
        </Buttton>
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </div>
      {imagesListIsOpen && (
        <ChooseImageForm
          postId={getPostIdFromInput(postIdInput.value)}
          type="save"
          postData={postData}
          savedImageIds={savedImageIds}
          modelId={modelData?.id}
          location={location}
          collectionInfo={collectionInfo}
          images={images}
          onSave={saveExampleHandler}
          onClose={() => {
            setImagesListIsOpen(false);
          }}
        />
      )}
    </>
  );
};

export default SaveImageForm;
