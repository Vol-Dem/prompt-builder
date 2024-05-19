import React, { useState } from "react";
import classes from "./SaveImageForm.module.scss";
import { getImagesInfo, makeBatchRequest } from "../../../utils/fetchUtils";
import firebaseApp from "../../../firebase-config";
import { arrayUnion, doc, getFirestore, setDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import { useValidation } from "../../../hooks/use-validation";
import ButttonSecondary from "../../ui/ButtonSecondary";
import Checkbox from "../../ui/Checkbox";
import Buttton from "../../ui/Button";
import Fieldset from "../../ui/Fieldset";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";

const firestore = getFirestore(firebaseApp);

const SaveImageForm = ({ modelData, curVersion }) => {
  const [filterDisabledInput, setFilterDisabledInput] = useState(true);
  const [imageIsSaving, setImageIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [versionIdInput, setVersionIdInput] = useState(
    curVersion || modelData?.data?.modelVersions[0].id
  );
  const [postIdInput, setPostIdInput] = useState("");
  const [imagesIdInputs, setImagesIdInputs] = useState([
    {
      type: "text",
      id: "exmpl-image-id",
      name: "image-id",
      placeholder: "image id",
      value: "",
    },
  ]);

  const [postIdState, validatePostId] = useValidation("minLength", {
    minLength: 5,
  });
  const { isValid: postIdIsValid, errorMessage: postIdErrorMessage } =
    postIdState;

  const uid = useSelector((state) => state.auth.user.uid);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);

  const saveImagesHandler = async (e) => {
    try {
      e.preventDefault();
      setImageIsSaving(true);
      setErrorMessage("");
      seteSuccessMessage("");
      const curVersionId = +versionIdInput;
      const postId = postIdInput.trim().toLowerCase().trim();
      const imagesId = imagesIdInputs
        .map((imageIdInput) => +imageIdInput.value?.trim())
        .filter(Boolean);

      console.log(postIdIsValid);
      if (!postIdIsValid) {
        setErrorMessage(postIdErrorMessage);
      }

      // return;
      const clearObjectKeys = (obj) => {
        const convertedMetaArr = Object.entries(obj).map((entry, i) => {
          const newKey = entry[0]
            ? entry[0].replace(/[^\w\s]/gi, " ")
            : `key${i}`;
          return [newKey, entry[1]];
        });
        return Object.fromEntries(convertedMetaArr);
      };

      if (!postId) {
        throw new Error("Empty post id");
      }

      if (
        modelData?.savedImages?.hasOwnProperty(`${curVersionId}`) &&
        modelData?.savedImages[`${curVersionId}`].some(
          (post) => post.postId === postId
        )
      ) {
        throw new Error("Exists");
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
        throw new Error("0 items");
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

      const examplesDataWithRes = await makeBatchRequest(
        dataFiltered.items,
        getImagesInfo
      );

      examplesDataWithRes.curVersionId = curVersionId;

      console.log(examplesDataWithRes);

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

      await setDoc(
        modelImagesRef,
        {
          items: examplesDataWithRes,
          versionId: curVersionId,
          createdAt: examplesDataWithRes[0].createdAt,
          savedAt: new Date().toISOString(),
          nsfw: examplesDataWithRes[0].nsfw,
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
      seteSuccessMessage("Saved");
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

  const imageIdHandler = (e) => {
    setImagesIdInputs((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex((imageId) => {
        return imageId.id === e.target.id;
      });

      newState[curIndex].value = e.target.value;
      console.log(newState);
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
      />
    );
  });

  let versionSelectOption = modelData?.data?.modelVersions?.map((version) => {
    return {
      name: version.name,
      value: version.id,
    };
  });

  return (
    <form onSubmit={saveImagesHandler} className={classes["form"]}>
      {/* <label htmlFor="version-select">Select version:</label> */}

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
        input={{ disabled: imageIsSaving }}
        value={postIdInput}
        onChange={(e) => {
          validatePostId(e.target.value);
          setPostIdInput(e.target.value);
        }}
        className={`${classes["auth__input"]} ${
          !postIdIsValid ? classes.invalid : ""
        }`}
        error={postIdErrorMessage}
      />
      <div className={classes["imputs-container"]}>
        <Fieldset legend="Image IDs" className={classes.fieldset}>
          {imagesIdInputsHtml}
          <ButttonSecondary
            type="button"
            onClick={addExampleInputHandler}
            disabled={imageIsSaving}
            className={classes["btn-secondary"]}
          >
            + add image ID
          </ButttonSecondary>
        </Fieldset>
      </div>
      <div className={classes.filter}>
        <Checkbox
          id="filter"
          label="Only related to this model"
          value={filterDisabledInput}
          checked={filterDisabledInput}
          className={classes["checkbox"]}
          onChange={(e) => {
            setFilterDisabledInput(e.target.checked);
          }}
        />
      </div>
      <Buttton type="submit" disabled={imageIsSaving}>
        Save
      </Buttton>
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </form>
  );
};

export default SaveImageForm;
