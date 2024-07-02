import React, { useEffect, useState } from "react";
import classes from "./VersionForm.module.scss";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";
import Textarea from "../../ui/Textarea";
import Buttton from "../../ui/Button";
import Input from "../../ui/Input";
import ButttonSecondary from "../../ui/ButtonSecondary";
import Fieldset from "../../ui/Fieldset";
import FieldCategory from "../../ui/FieldCategory";
import { clearFileExtension, validateInput } from "../../../utils/generalUtils";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  DEF_INPUT_ERROR_MESSAGE,
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NUMBER_MAX_LENGTH,
  OFFLINE_ERROR_MESSAGE,
  SAVED_SUCCESS_MESSAGE,
  TITLE_MAX_LENGTH,
  TRIGER_WORDS_MAX_LENGTH,
} from "../../../variables/constants";
import InputNumber from "../../ui/InputNumber";
import { useOnlineStatus } from "../../../hooks/use-online-status";

const firestore = getFirestore(firebaseApp);

const VersionForm = ({ versionData, defaultData, modelId, modelType }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, seteSuccessMessage] = useState("");
  const [mainTagInput, setMainTagInput] = useState({
    value: "",
    isValid: true,
  });
  const [titleInput, setTitleInput] = useState({
    value: "",
    isValid: true,
  });
  const [descriptionInput, setDescriptionInput] = useState({
    value: "",
    isValid: true,
  });
  const [trigerInput, setTrigerInput] = useState({
    value: [],
    isValid: true,
  });
  const [fileNameInput, setFileNameInput] = useState({
    value: "",
    isValid: true,
  });
  const [weightInput, setWeightInput] = useState({
    value: "",
    isValid: true,
  });
  const [minWeightInput, setMinWeightInput] = useState({
    value: "",
    isValid: true,
  });
  const [maxWeightInput, setMaxWeightInput] = useState({
    value: "",
    isValid: true,
  });
  const [sizetInput, setSizeInput] = useState({
    value: "",
    isValid: true,
  });
  const [helperTagsInput, setHelperTagsInput] = useState({
    value: [],
    isValid: true,
  });
  const [negativeTagsInput, setNegativeTagsInput] = useState({
    value: [],
    isValid: true,
  });
  const [vaeInput, setVaeInput] = useState({
    value: "",
    isValid: true,
  });
  const [denoisingStrengthtInput, setDenoisingStrengthInput] = useState({
    value: "",
    isValid: true,
  });
  const [hiresUpscaleInput, setHiresUpscaleInput] = useState({
    value: "",
    isValid: true,
  });
  const [hiresUpscaleStepsInput, setHiresUpscaleStepsInput] = useState({
    value: "",
    isValid: true,
  });
  const [hiresUpscalerInput, setHiresUpscalerInput] = useState({
    value: "",
    isValid: true,
  });
  const [cfgScaleInput, setCfgScaleInput] = useState({
    value: "",
    isValid: true,
  });
  const [samplerInput, setSamplerInput] = useState({
    value: "",
    isValid: true,
  });
  const [stepsInput, setStepsInput] = useState({
    value: "",
    isValid: true,
  });
  const [tagSetsInputs, setTagSetsInputs] = useState([
    [
      {
        type: "text",
        id: "set-name-def",
        name: "set-name",
        placeholder: "Set name",
        value: "",
        isValid: true,
        errorMessage: "",
      },
      {
        id: "set-value-def",
        name: "set-value",
        placeholder: "Trigger words",
        value: "",
        isValid: true,
        errorMessage: "",
      },
    ],
  ]);
  // console.log(versionData);
  // console.log(defaultData);
  // console.log(modelType);
  const uid = useSelector((state) => state.auth.user.uid);
  const model = useSelector((state) => state.model.model);

  useEffect(() => {
    setErrorMessage("");
    seteSuccessMessage("");
    setMainTagInput({ value: versionData?.mainTag || "", isValid: true });
    setTitleInput({
      value: versionData?.name || defaultData.name || "",
      isValid: true,
    });
    setDescriptionInput({
      value: versionData?.description || defaultData.description || "",
      isValid: true,
    });
    setTrigerInput({
      value:
        versionData?.trainedWords?.join(", ") ||
        defaultData.trainedWords?.join(", ") ||
        [],
      isValid: true,
    });
    setFileNameInput({ value: versionData?.fileName || "", isValid: true });
    setWeightInput({ value: versionData?.weight || "", isValid: true });
    setMinWeightInput({ value: versionData?.minWeight || "", isValid: true });
    setMaxWeightInput({ value: versionData?.maxWeight || "", isValid: true });
    setSizeInput({ value: versionData?.size || "", isValid: true });
    setHelperTagsInput({ value: versionData?.helperTags || [], isValid: true });
    setNegativeTagsInput({
      value: versionData?.negativeTags || [],
      isValid: true,
    });
    setVaeInput({ value: versionData?.vae || "", isValid: true });
    setDenoisingStrengthInput({
      value: versionData?.denoisingStrength || "",
      isValid: true,
    });
    setHiresUpscaleInput({
      value: versionData?.hiresUpscaleBy || "",
      isValid: true,
    });
    setHiresUpscalerInput({
      value: versionData?.hiresUpscaler || "",
      isValid: true,
    });
    setCfgScaleInput({ value: versionData?.cfgScale || "", isValid: true });
    setSamplerInput({ value: versionData?.sampler || "", isValid: true });
    setStepsInput({ value: versionData?.steps || "", isValid: true });
    setHiresUpscaleStepsInput({
      value: versionData?.hiresUpscaleSteps || "",
      isValid: true,
    });
  }, [versionData, defaultData]);

  useEffect(() => {
    if (!versionData) return;
    if (!versionData.tagSetsData?.length) return;
    const tagSets = versionData.tagSetsData.map((tagSet, i) => {
      // console.log(tagSet);
      return [
        {
          type: "text",
          id: "set-name" + i,
          name: "set-name",
          placeholder: "Set name",
          value: tagSet.name,
          isValid: true,
          errorMessage: "",
        },
        {
          id: "set-value" + i,
          name: "set-value",
          placeholder: "Trigger words",
          value: tagSet.value,
          isValid: true,
          errorMessage: "",
        },
      ];
    });
    setTagSetsInputs(tagSets);
  }, [versionData]);

  const saveVersionHandler = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      seteSuccessMessage("");
      setShowErrorMessage(true);
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false
      );

      // console.log("TAG", tagsetsIsNotValid);

      // console.log(
      //   !titleInput.isValid,
      //   !descriptionInput.isValid,
      //   !mainTagInput.isValid,
      //   !trigerInput.isValid,
      //   !helperTagsInput.isValid,
      //   !negativeTagsInput.isValid,
      //   tagsetsIsNotValid,
      //   !fileNameInput.isValid,
      //   !weightInput.isValid,
      //   !minWeightInput.isValid,
      //   !maxWeightInput.isValid,
      //   !sizetInput.isValid,
      //   !vaeInput.isValid,
      //   !denoisingStrengthtInput.isValid,
      //   !hiresUpscaleInput.isValid,
      //   !hiresUpscaleStepsInput.isValid,
      //   !hiresUpscalerInput.isValid,
      //   !cfgScaleInput.isValid,
      //   !samplerInput.isValid,
      //   !stepsInput.isValid
      // );

      const baseInputsIsNotValid =
        !titleInput.isValid ||
        !descriptionInput.isValid ||
        !mainTagInput.isValid ||
        !trigerInput.isValid ||
        !helperTagsInput.isValid ||
        !negativeTagsInput.isValid ||
        tagsetsIsNotValid ||
        !fileNameInput.isValid ||
        !weightInput.isValid ||
        !minWeightInput.isValid ||
        !maxWeightInput.isValid ||
        !sizetInput.isValid;

      const aditionalInputsIsNotValid =
        !vaeInput.isValid ||
        !denoisingStrengthtInput.isValid ||
        !hiresUpscaleInput.isValid ||
        !hiresUpscaleStepsInput.isValid ||
        !hiresUpscalerInput.isValid ||
        !cfgScaleInput.isValid ||
        !samplerInput.isValid ||
        !stepsInput.isValid;

      // console.log("ALL INP", baseInputsIsNotValid, aditionalInputsIsNotValid);

      if (
        baseInputsIsNotValid ||
        (modelType === "checkpoint" && aditionalInputsIsNotValid)
      ) {
        // console.log("NO");
        throw new Error(DEF_INPUT_ERROR_MESSAGE);
      }
      if (!navigator?.onLine) {
        throw new Error(OFFLINE_ERROR_MESSAGE);
      }
      // console.log("YES");
      // return;

      setIsSaving(true);

      const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

      const formdata = new FormData(e.target);
      const mainTag = formdata.get("main-tag").trim();
      const name = titleInput?.value?.trim();
      const description = descriptionInput?.value?.trim();
      const weight = +formdata.get("weight").trim();
      const minWeight = +minWeightInput?.value;
      const maxWeight = +maxWeightInput?.value;
      const size = formdata.get("size").trim();
      const fileName = formdata.get("file-name").trim();
      const tagSetsValues = formdata.getAll("set-value");
      const sampler = formdata.get("sampler")?.trim().toLowerCase() || "";
      const cfgScale = formdata.get("cfgScale")?.trim().toLowerCase() || "";
      const hiresUpscaler =
        formdata.get("hiresUpscaler")?.trim().toLowerCase() || "";
      const hiresUpscaleBy =
        formdata.get("hiresUpscaleBy")?.trim().toLowerCase() || "";
      const hiresUpscaleSteps =
        formdata.get("hiresUpscaleSteps")?.trim().toLowerCase() || "";
      const denoisingStrength =
        formdata.get("denoisingStrength")?.trim().toLowerCase() || "";
      const vae = formdata.get("vae")?.trim().toLowerCase() || "";
      const steps = formdata.get("steps")?.trim() || "";
      const trainedWords = formdata
        .get("triger")
        .trim()
        .split(splitRegEx)
        .filter(Boolean)
        .map((tag) => tag.trim());
      const tagSetNames = formdata.getAll("set-name");
      const tagSetsData = tagSetNames.flatMap((setName, i) => {
        if (!setName && !tagSetsValues[i]) return [];
        return [{ name: setName, value: tagSetsValues[i] }];
      });
      const helperTags = formdata
        .get("helper-tags")
        .trim()
        .split(splitRegEx)
        .filter(Boolean)
        .map((tag) => tag.trim());
      const negativeTags = formdata
        .get("negative-tags")
        .trim()
        .split(splitRegEx)
        .filter(Boolean)
        .map((tag) => tag.trim());

      const updatedVersionData = {
        ...versionData,
        mainTag,
        name,
        description,
        trainedWords,
        fileName,
        tagSetsData,
        weight,
        minWeight,
        maxWeight,
        size,
        helperTags,
        negativeTags,
        ...(modelType === "checkpoint" && {
          steps,
          sampler,
          cfgScale,
          hiresUpscaler,
          hiresUpscaleBy,
          hiresUpscaleSteps,
          denoisingStrength,
          vae,
        }),
      };

      // console.log(updatedVersionData);

      const allUpdatedVersions = {
        ...model.modelVersionsCustomData,
        [versionData.versionId]: updatedVersionData,
      };

      const mainTags = Object.values(allUpdatedVersions)
        .map((version) => {
          const mainTagArr = version?.mainTag?.split(":");
          if (mainTagArr?.length === 3) {
            return mainTagArr[1];
          }
          return version?.mainTag?.toLowerCase();
        })
        .filter(Boolean);

      const customFileNames = Object.values(allUpdatedVersions)
        ?.map((version) => {
          return clearFileExtension(version?.fileName)?.toLowerCase();
        })
        .filter(Boolean);

      const modelsRef = doc(firestore, "users", uid, "models", modelId + "");
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        modelId + ""
      );

      // console.log(updatedVersionData);
      const versionPath = `modelVersionsCustomData.${versionData.versionId}`;
      // console.log(versionPath);
      await updateDoc(
        modelsRef,
        {
          [versionPath]: updatedVersionData,
        },
        { merge: true }
      );
      await updateDoc(
        modelsPrevRef,
        {
          [versionPath]: updatedVersionData,
          mainTags: mainTags,
          customFileNames: customFileNames,
        },
        { merge: true }
      );
      seteSuccessMessage(SAVED_SUCCESS_MESSAGE);
      setIsSaving(false);
    } catch (err) {
      console.log(err.message);
      setErrorMessage(err.message);
      setIsSaving(false);
    }
  };

  const addtagSetHandler = () => {
    const newFields = [...tagSetsInputs];
    newFields.push([
      {
        type: "text",
        id: `set-name-${Date.now()}`,
        name: "set-name",
        placeholder: "Set name",
        value: "",
        isValid: true,
      },
      {
        type: "text",
        id: `set-value-${Date.now()}`,
        name: "set-value",
        placeholder: "Trigger words",
        value: "",
        isValid: true,
      },
    ]);
    // console.log(newFields);
    setTagSetsInputs(newFields);
  };

  const tagSetsHandler = (e, isValid) => {
    setTagSetsInputs((prevState) => {
      const newState = [...prevState];
      const curSetNameIndex = newState.findIndex((imageId) => {
        return imageId[0].id + "" === e.target.id;
      });
      const curSetTagsIndex = newState.findIndex((imageId) => {
        return imageId[1].id + "" === e.target.id;
      });

      // const { isValid, errorMessage } = validateInput(
      //   {
      //     maxLength:
      //       curSetNameIndex !== -1 ? NAME_MAX_LENGTH : TRIGER_WORDS_MAX_LENGTH,
      //   },
      //   e.target.value
      // );

      if (curSetNameIndex !== -1) {
        newState[curSetNameIndex][0].value = e.target.value;
        newState[curSetNameIndex][0].isValid = isValid;
        // newState[curSetNameIndex][0].errorMessage = errorMessage;
      }
      if (curSetTagsIndex !== -1) {
        newState[curSetTagsIndex][1].value = e.target.value;
        newState[curSetTagsIndex][1].isValid = isValid;
        // newState[curSetTagsIndex][1].errorMessage = errorMessage;
      }
      // newState[curIndex] = [];

      return newState;
    });
  };

  const tagSetsHtml = tagSetsInputs.map((tagSet) => {
    return (
      <div key={tagSet[0].id} className={classes["input-group"]}>
        <Input
          id={tagSet[0].id}
          name={tagSet[0].name}
          type={tagSet[0].type}
          placeholder={tagSet[0].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[0].value}
          isValid={tagSet[0].isValid}
          // error={tagSet[0].errorMessage}
          showError={showErrorMessage}
          validation={{
            maxLength: NAME_MAX_LENGTH,
          }}
        />
        <Textarea
          id={tagSet[1].id}
          name={tagSet[1].name}
          rows="5"
          placeholder={tagSet[1].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[1].value}
          isValid={tagSet[1].isValid}
          // error={tagSet[1].errorMessage}
          showError={showErrorMessage}
          validation={{
            maxLength: TRIGER_WORDS_MAX_LENGTH,
          }}
        ></Textarea>
      </div>
    );
  });

  return (
    <form onSubmit={saveVersionHandler} className={classes["form"]}>
      <div className={classes.subtitle}>
        Version ID: {versionData.id || defaultData.id}
      </div>
      <Input
        label="Version name"
        name="name"
        type="text"
        placeholder="name"
        value={titleInput.value}
        onChange={(e, isValid) => {
          setTitleInput({ value: e.target.value, isValid });
        }}
        validation={{
          required: true,
          maxLength: NAME_MAX_LENGTH,
        }}
        showError={showErrorMessage}
      />
      <Textarea
        label="Description"
        name="description"
        rows="5"
        placeholder="Description"
        value={descriptionInput.value}
        onChange={(e, isValid) => {
          setDescriptionInput({ value: e.target.value, isValid });
        }}
        validation={{
          maxLength: DESCRIPTION_MAX_LENGTH,
        }}
        showError={showErrorMessage}
      ></Textarea>
      <div className={classes.fields}>
        <FieldCategory title="Trigger words">
          <Input
            label="Activation tag"
            name="main-tag"
            type="text"
            placeholder="<lora:activation tag:1>"
            value={mainTagInput.value}
            onChange={(e, isValid) => {
              setMainTagInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: TRIGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />

          <Textarea
            label="Trigger words"
            name="triger"
            type="text"
            placeholder="Trigger words"
            value={trigerInput.value}
            onChange={(e, isValid) => {
              setTrigerInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: TRIGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Textarea
            label="Helper words"
            name="helper-tags"
            id=""
            rows="5"
            placeholder="Helper words"
            value={helperTagsInput.value}
            onChange={(e, isValid) => {
              setHelperTagsInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: TRIGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          ></Textarea>
          <Textarea
            label="Negative words"
            name="negative-tags"
            id=""
            rows="5"
            placeholder="Negative words"
            value={negativeTagsInput.value}
            onChange={(e, isValid) => {
              setNegativeTagsInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: TRIGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          ></Textarea>
          <Fieldset legend="Tag sets">
            {tagSetsHtml}
            <ButttonSecondary
              type="button"
              onClick={addtagSetHandler}
              disabled={isSaving}
              className={classes["btn-secondary"]}
            >
              + add new set
            </ButttonSecondary>
          </Fieldset>
        </FieldCategory>
        <FieldCategory title="Info">
          <Input
            label="File name"
            name="file-name"
            type="text"
            placeholder="File name"
            value={fileNameInput.value}
            onChange={(e, isValid) => {
              setFileNameInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <div>
            <span className={classes["weight__label"]}>Weight</span>
            <div className={classes.weight}>
              <InputNumber
                name="minWeight"
                type="number"
                step={0.1}
                placeholder="Min"
                value={minWeightInput.value}
                onChange={(e, isValid) => {
                  setMinWeightInput({ value: e.target.value, isValid });
                }}
                validation={{
                  number: true,
                  maxLength: NUMBER_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <InputNumber
                name="maxWeight"
                type="number"
                step={0.1}
                placeholder="Max"
                value={maxWeightInput.value}
                onChange={(e, isValid) => {
                  setMaxWeightInput({ value: e.target.value, isValid });
                }}
                validation={{
                  number: true,
                  maxLength: NUMBER_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <InputNumber
                name="weight"
                type="number"
                step={0.1}
                placeholder="Recomended"
                value={weightInput.value}
                onChange={(e, isValid) => {
                  setWeightInput({ value: e.target.value, isValid });
                }}
                validation={{
                  number: true,
                  maxLength: NUMBER_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
            </div>
          </div>
          <Input
            label="Image size"
            name="size"
            type="text"
            placeholder="Image size"
            value={sizetInput.value}
            onChange={(e, isValid) => {
              setSizeInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: TITLE_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          {modelType === "checkpointsss" && (
            <>
              <Input
                label="Sampling method"
                name="sampler"
                type="text"
                placeholder="Sampling method"
                value={samplerInput.value}
                onChange={(e, isValid) => {
                  setSamplerInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Sampling steps"
                name="steps"
                type="text"
                placeholder="Sampling steps"
                value={stepsInput.value}
                onChange={(e, isValid) => {
                  setStepsInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />

              <Input
                label="CFG Scale"
                name="cfgScale"
                type="text"
                placeholder="CFG Scale"
                value={cfgScaleInput.value}
                onChange={(e, isValid) => {
                  setCfgScaleInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Upscaler"
                name="hiresUpscaler"
                type="text"
                placeholder="Upscaler"
                value={hiresUpscalerInput.value}
                onChange={(e, isValid) => {
                  setHiresUpscalerInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Upscale by"
                name="hiresUpscaleBy"
                type="text"
                placeholder="Upscale by"
                value={hiresUpscaleInput.value}
                onChange={(e, isValid) => {
                  setHiresUpscaleInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Hires steps"
                name="hiresUpscaleSteps"
                type="text"
                placeholder="Hires steps"
                value={hiresUpscaleStepsInput.value}
                onChange={(e, isValid) => {
                  setHiresUpscaleStepsInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Denoising strength"
                name="denoisingStrength"
                type="text"
                placeholder="Denoising strength"
                value={denoisingStrengthtInput.value}
                onChange={(e, isValid) => {
                  setDenoisingStrengthInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="VAE"
                name="vae"
                type="text"
                placeholder="VAE"
                value={vaeInput.value}
                onChange={(e, isValid) => {
                  setVaeInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
            </>
          )}
        </FieldCategory>
      </div>
      <Buttton type="submit" disabled={isSaving} className={classes.submit}>
        Save
      </Buttton>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </form>
  );
};

export default VersionForm;
