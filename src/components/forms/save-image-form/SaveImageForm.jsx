import React, { useState } from "react";
import classes from "./SaveImageForm.module.scss";
import { getImagesInfo, makeBatchRequest } from "../../../utils/fetchUtils";
import firebaseApp from "../../../firebase-config";
import { arrayUnion, doc, getFirestore, setDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import { useValidation } from "../../../hooks/use-validation";
import ButttonSecondary from "../../ui/ButtonSecondary";
import Checkbox from "../../ui/Checkbox";
import Buttton from "../../ui/Button";
import Fieldset from "../../ui/Fieldset";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import Spinner from "../../ui/Spinner";
import {
  DEF_INPUT_ERROR_MESSAGE,
  EMPTY_ERROR_MESSAGE,
  EXISTS_ERROR_MESSAGE,
  ID_MAX_LENGTH,
  OFFLINE_ERROR_MESSAGE,
  SAVED_SUCCESS_MESSAGE,
} from "../../../variables/constants";
import { validateInput } from "../../../utils/generalUtils";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import ChooseImageForm from "../choose-image-form/ChooseImageForm";
import Modal from "../../ui/Modal";
import { uploadActions } from "../../../store/upload";
import BackSvg from "../../../assets/BackSvg";

const firestore = getFirestore(firebaseApp);

const SaveImageForm = ({ modelData, curVersion }) => {
  const [filterDisabledInput, setFilterDisabledInput] = useState(true);
  const [imagesListIsOpen, setImagesListIsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [imageIsSaving, setImageIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, seteSuccessMessage] = useState("");
  const [versionIdInput, setVersionIdInput] = useState(
    curVersion || modelData?.data?.modelVersions[0].id
  );
  const [postIdInput, setPostIdInput] = useState({ value: "", isValid: false });
  const [postIdIsValid, setPostIdIsValid] = useState(false);
  const [imagesIdInputs, setImagesIdInputs] = useState([
    {
      type: "text",
      id: "exmpl-image-id",
      name: "image-id",
      placeholder: "image id",
      value: "",
      isValid: true,
      errorMessage: "",
    },
  ]);

  // const [postIdState, validatePostId] = useValidation("minLength", {
  //   minLength: 5,
  // });
  // const { isValid: postIdIsValid, errorMessage: postIdErrorMessage } =
  //   postIdState;

  const uid = useSelector((state) => state.auth.user.uid);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();

  // const [postIdState, validatePostId] = useValidation({
  //   required: true,
  //   maxLength: ID_MAX_LENGTH,
  // });
  // const { isValid: postIdIsValid, errorMessage: postIdErrorMessage } =
  //   postIdState;

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
      console.log(data);
      setImages(data.items);

      if (!data.items.length) {
        throw new Error(EMPTY_ERROR_MESSAGE);
      }

      setImagesListIsOpen(true);
      setIsLoading(false);
    } catch (err) {
      console.log(err.message);
      setErrorMessage(err.message);
      setIsLoading(false);
    }
  };

  const saveImagesHandler = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      seteSuccessMessage("");
      setShowErrorMessage(true);
      // console.log("INV", postIdInput.isValid);
      const imagesIdInputsIsNotValid = imagesIdInputs
        .map((imageInput) => imageInput.isValid)
        .includes(false);
      // console.log("IMG INP VAL", imagesIdInputsIsNotValid);

      if (!postIdInput.isValid || imagesIdInputsIsNotValid) {
        throw new Error(DEF_INPUT_ERROR_MESSAGE);
      }
      if (!navigator?.onLine) {
        throw new Error(OFFLINE_ERROR_MESSAGE);
      }
      // return;
      setImageIsSaving(true);

      const curVersionId = +versionIdInput;
      const postId = postIdInput.value.trim().toLowerCase().trim();
      const imagesId = imagesIdInputs
        .map((imageIdInput) => +imageIdInput.value?.trim())
        .filter(Boolean);

      const clearObjectKeys = (obj) => {
        const convertedMetaArr = Object.entries(obj).map((entry, i) => {
          const newKey = entry[0]
            ? entry[0].replace(/[^\w\s]/gi, " ")
            : `key${i}`;
          return [newKey, entry[1]];
        });
        return Object.fromEntries(convertedMetaArr);
      };

      if (
        modelData?.savedImages?.hasOwnProperty(`${curVersionId}`) &&
        modelData?.savedImages[`${curVersionId}`].some(
          (post) => post.postId === postId
        )
      ) {
        throw new Error(EXISTS_ERROR_MESSAGE);
      }

      // const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
      //     versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
      //   }${amountPerPage ? `&limit=${amountPerPage}` : ""}${
      //     imagesSortValue ? `&sort=${imagesSortValue}` : ""
      //   }${cursor ? `&cursor=${cursor}` : ""}`;

      const imgExampleResponse = await fetch(
        `https://civitai.com/api/v1/images?postId=${postId}${
          filterDisabledInput ? `&modelId=${modelData?.id}` : ""
        }${nsfwMode ? `&nsfw=X` : `&nsfw=None`}`
      );
      const data = await imgExampleResponse.json();
      console.log(data);

      if (!data.items.length) {
        throw new Error(EMPTY_ERROR_MESSAGE);
      }

      data.items.forEach((image) => {
        if (image.meta) {
          image.meta.comfy = "";
          image.meta = clearObjectKeys(image.meta);
          if (image.meta.hashes)
            image.meta.hashes = clearObjectKeys(image.meta.hashes);
        }
      });

      let dataFiltered = data;

      if (imagesId.length) {
        const images = data.items.filter((image) => {
          return imagesId.some((id) => +id === image.id);
        });

        dataFiltered = { items: images };
      }

      // const examplesDataWithRes = await makeBatchRequest(
      //   dataFiltered.items,
      //   getImagesInfo
      // );
      const examplesDataWithRes = dataFiltered.items;

      examplesDataWithRes.curVersionId = curVersionId;

      // console.log(examplesDataWithRes);

      const modelRef = doc(
        firestore,
        "users",
        uid,
        "models",
        modelData.id + ""
      );
      const modelImagesRef = doc(
        firestore,
        "users",
        uid,
        "models",
        modelData.id + "",
        "images",
        postId + ""
      );

      const newImgData = {
        postId: +postId,
        amount: dataFiltered.items.length,
      };

      const nsfw = [...new Set(examplesDataWithRes.map((image) => image.nsfw))];

      await setDoc(
        modelImagesRef,
        {
          items: examplesDataWithRes,
          versionId: curVersionId,
          createdAt: examplesDataWithRes[0].createdAt,
          savedAt: new Date().toISOString(),
          nsfw: examplesDataWithRes[0].nsfw,
          nsfwTypes: nsfw,
          nsfwLevel: examplesDataWithRes[0]?.nsfwLevel || "",
        },
        { merge: true }
      );

      await setDoc(
        modelRef,
        {
          savedImages: {
            [`${curVersionId}`]: arrayUnion(newImgData),
          },
        },
        { merge: true }
      );

      setImageIsSaving(false);
      seteSuccessMessage(SAVED_SUCCESS_MESSAGE);
    } catch (err) {
      setImageIsSaving(false);
      setErrorMessage(err.message);
      console.log(err.message);
    }
  };

  const addExampleInputHandler = () => {
    const newFields = [...imagesIdInputs];
    newFields.push({
      id: `${Date.now() + "imid"}`,
      name: "image-id",
      placeholder: "image id",
      cols: "30",
      rows: "10",
      value: "",
    });

    setImagesIdInputs(newFields);
  };

  const imageIdHandler = (e, isValid) => {
    setImagesIdInputs((prevState) => {
      // const newState = [...prevState];
      // const curIndex = newState.findIndex((imageId) => {
      //   return imageId.id === id;
      // });

      // newState[curIndex].value = value;
      // newState[curIndex].isValid = isValid;
      // console.log(newState);
      // const { isValid, errorMessage } = validateInput(
      //   {
      //     // required: true,
      //     maxLength: ID_MAX_LENGTH,
      //     number: true,
      //   },
      //   e.target.value
      // );

      const newState = prevState.map((item) => {
        if (item.id === e.target.id) {
          return {
            ...item,
            value: e.target.value,
            isValid,
            // errorMessage,
          };
        }
        return item;
      });
      return newState;
    });
  };

  let imagesIdInputsHtml = imagesIdInputs.map((example, i) => {
    return (
      <Input
        key={i}
        id={example.id}
        name={example.name}
        type={example.type}
        placeholder={example.placeholder}
        onChange={imageIdHandler}
        value={example.value}
        // error={example.errorMessage}
        showError={showErrorMessage}
        validation={{
          maxLength: ID_MAX_LENGTH,
          number: true,
        }}
        // validation={{
        //   required: true,
        //   maxLength: ID_MAX_LENGTH,
        // }}
      />
    );
  });

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
    // console.log(postIdInput?.value);
    // console.log(modelData?.id);
    // console.log(versionIdInput);
    // return;
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
        // existedAmount: existedImgsAmount,
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
        {/* <div className={classes["imputs-container"]}>
        
      </div> */}
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
        {/* <Buttton
        type="submit"
        disabled={imageIsSaving}
        className={classes.submit}
      >
        {!imageIsSaving ? "Save" : <Spinner size="small" />}
      </Buttton> */}
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
        // <Modal
        //   onClose={() => {
        //     setImagesListIsOpen(false);
        //   }}
        // >
        <ChooseImageForm
          type="save"
          modelId={modelData?.id}
          images={images}
          onSave={saveExampleHandler}
          onClose={() => {
            setImagesListIsOpen(false);
          }}
        />
        // </Modal>
      )}
    </>
  );
};

export default SaveImageForm;
