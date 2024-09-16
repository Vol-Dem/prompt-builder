import React, { useState } from "react";
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
  DEF_ERROR_MESSAGE,
  DEF_INPUT_ERROR_MESSAGE,
  EMPTY_ERROR_MESSAGE,
  ID_MAX_LENGTH,
  OFFLINE_ERROR_MESSAGE,
} from "../../../variables/constants";
import ChooseImageForm from "../choose-image-form/ChooseImageForm";
import { uploadActions } from "../../../store/upload";
import BackSvg from "../../../assets/BackSvg";

const SaveImageForm = ({ modelData, curVersion }) => {
  const [filterDisabledInput, setFilterDisabledInput] = useState(true);
  const [imagesListIsOpen, setImagesListIsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, seteSuccessMessage] = useState("");
  const [versionIdInput, setVersionIdInput] = useState(
    curVersion || modelData?.data?.modelVersions[0].id
  );
  const [postIdInput, setPostIdInput] = useState({ value: "", isValid: false });
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();

  const loadPostImagesHandler = async () => {
    try {
      setErrorMessage("");
      seteSuccessMessage("");
      setShowErrorMessage(true);

      if (!postIdInput.isValid) {
        throw new Error(DEF_INPUT_ERROR_MESSAGE);
      }
      if (!navigator?.onLine) {
        throw new Error(OFFLINE_ERROR_MESSAGE);
      }

      if (!postIdInput?.value) return;

      setIsLoading(true);

      const imgExampleResponse = await fetch(
        `https://civitai.com/api/v1/images?postId=${postIdInput.value}${
          filterDisabledInput ? `&modelId=${modelData?.id}` : ""
        }${nsfwMode ? `&nsfw=X` : `&nsfw=None`}`
      );
      const data = await imgExampleResponse.json();
      // console.log(data);
      setImages(data.items);

      if (!data.items.length) {
        throw new Error(EMPTY_ERROR_MESSAGE);
      }

      setImagesListIsOpen(true);
      setIsLoading(false);
    } catch (err) {
      setErrorMessage(DEF_ERROR_MESSAGE);
      setIsLoading(false);
    }
  };

  let versionSelectOption = modelData?.data?.modelVersions?.map((version) => {
    return {
      name: version.name,
      value: version.id,
    };
  });

  const saveExampleHandler = async (e, ids) => {
    const postData =
      modelData.hasOwnProperty("savedImages") &&
      modelData?.savedImages[versionIdInput?.value]?.find(
        (post) => post.postId === +postIdInput?.value
      );

    dispatch(
      uploadActions.addToQueue({
        postId: +postIdInput?.value,
        modelId: +modelData?.id,
        modelName: modelData?.name,
        versionId: +versionIdInput,
        nsfwMode,
        postData: postData || null,
        imgUrl: images[0].url,
        ids: ids || [],
        images,
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
        <Input
          id="post-id"
          name="post-id"
          type="text"
          label="Post ID"
          placeholder="post id"
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
            maxLength: ID_MAX_LENGTH,
            number: true,
          }}
          showError={showErrorMessage}
        />
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
          type="save"
          modelId={modelData?.id}
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
