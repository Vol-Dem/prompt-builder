import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

import classes from "./VersionForm.module.scss";
import firebaseApp from "../../../firebase-config";
import Textarea from "../../ui/forms/Textarea";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/forms/Input";
import ButttonSecondary from "../../ui/buttons/ButtonSecondary";
import Fieldset from "../../ui/forms/Fieldset";
import FieldCategory from "../../ui/forms/FieldCategory";
import {
  handleErrors,
  normalizeError,
  throwCustomError,
} from "../../../utils/generalUtils";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  ERROR_MESSAGE_INPUT_DEF,
  VALIDATION_DESCRIPTION_MAX_LENGTH,
  VALIDATION_NAME_MAX_LENGTH,
  VALIDATION_NUMBER_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
  VALIDATION_TITLE_MAX_LENGTH,
  VALIDATION_TRIGER_WORDS_MAX_LENGTH,
} from "../../../variables/constants";
import InputNumber from "../../ui/forms/InputNumber";
import Spinner from "../../ui/Spinner";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import { createTagSetsInputData, splitTags } from "../../../utils/promptUtils";
import { clearFileExtension } from "../../../../shared/utils";
import { FORMS_DEF_TAGS_INPUT } from "../../../variables/structures";
import type {
  ModelVersion,
  ModelVersionCustomData,
  UserModelDefaultCustomData,
} from "../../../../shared/types/model";
import { useAppSelector } from "../../../store/hooks/hooks";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { TagSetInputData } from "../../../types/prompt.types";

const firestore = getFirestore(firebaseApp);

type VersionFormProps = {
  versionData?: ModelVersionCustomData | UserModelDefaultCustomData;
  defaultData?: UserModelDefaultCustomData | ModelVersion;
  modelId: number;
  modelType: string;
  isDefault: boolean;
};

/**
 * Model Version edit form component.
 *
 * Provides editing flow for saved model version data.
 * Supports both version-specific and model-wide default editing modes.
 *
 * Data population logic:
 * - versionData populates fields that were explicitly modified by the user.
 * - defaultData populates remaining fields that were not customized.
 *
 * Default override mode:
 * - When isDefault is true, the form updates model-level default values
 *   that will be applied to all versions.
 * - Default updates override model defaults but do NOT overwrite any
 *   version-specific user data.
 *
 * Handles form validation, loading and error states.
 *
 * Responsibilities:
 * - Renders version-specific or default editable fields.
 * - Merges user and default data for form population.
 * - Validates user input.
 * - Displays backend and client-side error messages.
 *
 * Side effects:
 * - Calls updateDoc to persist version or default model data.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.versionData - User-modified model version fields.
 * @param {object} props.defaultData - Model-level default version fields.
 * @param {number} props.modelId - Model ID.
 * @param {('checkpoint' | 'lora' | string)} props.modelType - Model type.
 * @param {boolean} props.isDefault - Enables model-wide default editing mode.
 * @returns {JSX.Element} Model Version edit form.
 */
const VersionForm = ({
  versionData,
  defaultData,
  modelId,
  modelType,
  isDefault,
}: VersionFormProps) => {
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
    value: "",
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
    value: "",
    isValid: true,
  });
  const [negativeTagsInput, setNegativeTagsInput] = useState({
    value: "",
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
  const [tagSetsInputs, setTagSetsInputs] = useState<TagSetInputData[]>([]);
  const uid = useAppSelector((state) => state.auth.user.uid);
  const model = useAppSelector((state) => state.model.model);

  useEffect(() => {
    setErrorMessage("");
    seteSuccessMessage("");
    setMainTagInput({ value: versionData?.mainTag || "", isValid: true });
    setTitleInput({
      value: versionData?.name || defaultData?.name || "",
      isValid: true,
    });
    setDescriptionInput({
      value: versionData?.description || defaultData?.description || "",
      isValid: true,
    });
    setTrigerInput({
      value:
        versionData?.trainedWords?.join(", ") ||
        defaultData?.trainedWords?.join(", ") ||
        "",
      isValid: true,
    });
    setFileNameInput({ value: versionData?.fileName || "", isValid: true });
    setWeightInput({
      value: versionData?.weight ? versionData.weight + "" : "",
      isValid: true,
    });
    setMinWeightInput({
      value: versionData?.minWeight ? versionData.minWeight + "" : "",
      isValid: true,
    });
    setMaxWeightInput({
      value: versionData?.maxWeight ? versionData.maxWeight + "" : "",
      isValid: true,
    });
    setSizeInput({
      value: versionData?.size ? versionData.size + "" : "",
      isValid: true,
    });
    setHelperTagsInput({
      value: versionData?.helperTags?.join(", ") || "",
      isValid: true,
    });
    setNegativeTagsInput({
      value: versionData?.negativeTags?.join(", ") || "",
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
    setTagSetsInputs(
      createTagSetsInputData(versionData?.tagSetsData, FORMS_DEF_TAGS_INPUT),
    );
  }, [versionData]);

  const saveVersionHandler = async (e: SubmitEvent) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      seteSuccessMessage("");
      setShowErrorMessage(true);
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false,
      );

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

      if (
        baseInputsIsNotValid ||
        (modelType === "checkpoint" && aditionalInputsIsNotValid)
      ) {
        throwCustomError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throwCustomError(ERROR_MESSAGE_OFFLINE);
      }

      setIsSaving(true);

      const mainTag = mainTagInput.value.trim();
      const name = titleInput?.value?.trim();
      const description = descriptionInput?.value?.trim();
      const weight = +weightInput.value.trim();
      const minWeight = +minWeightInput?.value;
      const maxWeight = +maxWeightInput?.value;
      const size = sizetInput.value.trim();
      const fileName = fileNameInput.value.trim();
      const tagSetsValues = tagSetsInputs.map((set) => set[1].value);
      const sampler = samplerInput.value.trim().toLowerCase() || "";
      const cfgScale = cfgScaleInput.value.trim().toLowerCase() || "";
      const hiresUpscaler = hiresUpscalerInput.value.trim().toLowerCase() || "";
      const hiresUpscaleBy = hiresUpscaleInput.value.trim().toLowerCase() || "";
      const hiresUpscaleSteps =
        hiresUpscaleStepsInput.value.trim().toLowerCase() || "";
      const denoisingStrength =
        denoisingStrengthtInput.value.trim().toLowerCase() || "";
      const vae = vaeInput.value.trim().toLowerCase() || "";
      const steps = stepsInput.value.trim() || "";
      const trainedWords = splitTags(trigerInput.value);
      const tagSetNames = tagSetsInputs.map((set) => set[0].value);
      const tagSetsInputData = tagSetNames.flatMap((setName, i) => {
        if (!setName && !tagSetsValues[i]) return [];
        return [{ name: setName, value: tagSetsValues[i] }];
      });

      let tagSetsData;

      if (!versionData?.tagSetsData?.length) {
        tagSetsData = tagSetsInputData;
      } else {
        tagSetsData = tagSetsInputData.map((tagSet, i) => {
          return {
            ...(versionData?.tagSetsData && versionData.tagSetsData[i]),
            ...tagSet,
          };
        });
      }

      const helperTags = splitTags(helperTagsInput.value);
      const negativeTags = splitTags(negativeTagsInput.value);

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
      const versionId = isDefault ? "def" : versionData?.versionId;

      if (!versionId) return;

      const allUpdatedVersions = {
        ...model?.modelVersionsCustomData,
        [versionId]: updatedVersionData,
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
          return version?.fileName
            ? clearFileExtension(version?.fileName)?.toLowerCase()
            : "";
        })
        .filter(Boolean);

      const modelsRef = doc(firestore, "users", uid, "models", modelId + "");
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        modelId + "",
      );

      const versionPath = isDefault
        ? "defaultCustomData"
        : `modelVersionsCustomData.${versionData?.versionId}`;
      await updateDoc(modelsRef, {
        [versionPath]: updatedVersionData,
      });
      await updateDoc(modelsPrevRef, {
        [versionPath]: updatedVersionData,
        mainTags: mainTags,
        customFileNames: customFileNames,
      });
      seteSuccessMessage(SUCCESS_MESSAGE_UPLOADED);
      setIsSaving(false);
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
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

    setTagSetsInputs(newFields);
  };

  const tagSetsHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isValid: boolean,
  ) => {
    setTagSetsInputs((prevState) => {
      const newState = [...prevState];
      const curSetNameIndex = newState.findIndex((imageId) => {
        return imageId[0].id + "" === e.target.id;
      });
      const curSetTagsIndex = newState.findIndex((imageId) => {
        return imageId[1].id + "" === e.target.id;
      });

      if (curSetNameIndex !== -1) {
        newState[curSetNameIndex][0].value = e.target.value;
        newState[curSetNameIndex][0].isValid = isValid;
      }
      if (curSetTagsIndex !== -1) {
        newState[curSetTagsIndex][1].value = e.target.value;
        newState[curSetTagsIndex][1].isValid = isValid;
      }

      return newState;
    });
  };

  const deleteTagsetInputHandler = (index: number) => {
    setTagSetsInputs((prevState) => {
      return prevState.toSpliced(index, 1);
    });
  };

  const tagSetsHtml =
    !!tagSetsInputs.length &&
    tagSetsInputs.map((tagSet, i) => {
      return (
        <div key={tagSet[0].id} className={classes["tagset"]}>
          <div className={classes["tagset__header"]}>
            <span
              className={classes["tagset__title"]}
            >{`Tagset ${i + 1}`}</span>{" "}
            {i !== 0 && (
              <ButtonTertiary
                type="button"
                className={classes["input__btn-del"]}
                onClick={deleteTagsetInputHandler.bind(null, i)}
              >
                <XMarkIcon />
              </ButtonTertiary>
            )}
          </div>
          <Input
            id={tagSet[0].id}
            name={tagSet[0].name}
            type={tagSet[0].type}
            placeholder={tagSet[0].placeholder}
            onChange={tagSetsHandler}
            value={tagSet[0].value}
            showError={showErrorMessage}
            validation={{
              maxLength: VALIDATION_NAME_MAX_LENGTH,
            }}
          />
          <Textarea
            id={tagSet[1].id}
            name={tagSet[1].name}
            rows={5}
            placeholder={tagSet[1].placeholder}
            onChange={tagSetsHandler}
            value={tagSet[1].value}
            showError={showErrorMessage}
            validation={{
              maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
            }}
          ></Textarea>
        </div>
      );
    });

  return (
    <form onSubmit={saveVersionHandler} className={classes["form"]}>
      <div className={classes.subtitle}>
        Version ID:{" "}
        {isDefault ? "Default" : versionData?.versionId || defaultData?.id}
      </div>
      {!isDefault && (
        <>
          <Input
            label="Version name"
            id="name"
            name="name"
            type="text"
            placeholder="name"
            value={titleInput.value}
            onChange={(e, isValid) => {
              setTitleInput({ value: e.target.value, isValid });
            }}
            validation={{
              required: true,
              maxLength: VALIDATION_NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Textarea
            label="Version description"
            id="description"
            name="description"
            rows={5}
            placeholder="Version description"
            value={descriptionInput.value}
            onChange={(e, isValid) => {
              setDescriptionInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: VALIDATION_DESCRIPTION_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          ></Textarea>
        </>
      )}
      <div className={classes.fields}>
        <FieldCategory title="Trigger words">
          <Input
            label="Activation tag"
            id="main-tag"
            name="main-tag"
            type="text"
            placeholder="<lora:activation tag:1>"
            value={mainTagInput.value}
            onChange={(e, isValid) => {
              setMainTagInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />

          <Textarea
            label="Trigger words"
            id="triger"
            name="triger"
            placeholder="Trigger words"
            value={trigerInput.value}
            onChange={(e, isValid) => {
              setTrigerInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <Textarea
            label="Helper words"
            id="helper-tags"
            name="helper-tags"
            rows={5}
            placeholder="Helper words"
            value={helperTagsInput.value}
            onChange={(e, isValid) => {
              setHelperTagsInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          ></Textarea>
          <Textarea
            label="Negative words"
            id="negative-tags"
            name="negative-tags"
            rows={5}
            placeholder="Negative words"
            value={negativeTagsInput.value}
            onChange={(e, isValid) => {
              setNegativeTagsInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
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
            id="file-name"
            name="file-name"
            type="text"
            placeholder="File name"
            value={fileNameInput.value}
            onChange={(e, isValid) => {
              setFileNameInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: VALIDATION_NAME_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          <div>
            <span className={classes["weight__label"]}>Weight</span>
            <div className={classes.weight}>
              <InputNumber
                id="minWeight"
                name="minWeight"
                type="number"
                step={0.1}
                placeholder="Min"
                value={minWeightInput.value}
                onChange={(value, isValid) => {
                  setMinWeightInput({
                    value,
                    isValid: isValid === null ? true : isValid,
                  });
                }}
                validation={{
                  number: true,
                  maxLength: VALIDATION_NUMBER_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <InputNumber
                id="maxWeight"
                name="maxWeight"
                type="number"
                step={0.1}
                placeholder="Max"
                value={maxWeightInput.value}
                onChange={(value, isValid) => {
                  setMaxWeightInput({
                    value,
                    isValid: isValid === null ? true : isValid,
                  });
                }}
                validation={{
                  number: true,
                  maxLength: VALIDATION_NUMBER_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <InputNumber
                id="weight"
                name="weight"
                type="number"
                step={0.1}
                placeholder="Recomended"
                value={weightInput.value}
                onChange={(value, isValid) => {
                  setWeightInput({
                    value,
                    isValid: isValid === null ? true : isValid,
                  });
                }}
                validation={{
                  number: true,
                  maxLength: VALIDATION_NUMBER_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
            </div>
          </div>
          <Input
            label="Image size"
            id="size"
            name="size"
            type="text"
            placeholder="Image size"
            value={sizetInput.value}
            onChange={(e, isValid) => {
              setSizeInput({ value: e.target.value, isValid });
            }}
            validation={{
              maxLength: VALIDATION_TITLE_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          />
          {modelType === "checkpointsss" && (
            <>
              <Input
                label="Sampling method"
                id="sampler"
                name="sampler"
                type="text"
                placeholder="Sampling method"
                value={samplerInput.value}
                onChange={(e, isValid) => {
                  setSamplerInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: VALIDATION_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Sampling steps"
                id="steps"
                name="steps"
                type="text"
                placeholder="Sampling steps"
                value={stepsInput.value}
                onChange={(e, isValid) => {
                  setStepsInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: VALIDATION_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />

              <Input
                label="CFG Scale"
                id="cfgScale"
                name="cfgScale"
                type="text"
                placeholder="CFG Scale"
                value={cfgScaleInput.value}
                onChange={(e, isValid) => {
                  setCfgScaleInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: VALIDATION_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Upscaler"
                id="hiresUpscaler"
                name="hiresUpscaler"
                type="text"
                placeholder="Upscaler"
                value={hiresUpscalerInput.value}
                onChange={(e, isValid) => {
                  setHiresUpscalerInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: VALIDATION_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Upscale by"
                id="hiresUpscaleBy"
                name="hiresUpscaleBy"
                type="text"
                placeholder="Upscale by"
                value={hiresUpscaleInput.value}
                onChange={(e, isValid) => {
                  setHiresUpscaleInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: VALIDATION_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Hires steps"
                id="hiresUpscaleSteps"
                name="hiresUpscaleSteps"
                type="text"
                placeholder="Hires steps"
                value={hiresUpscaleStepsInput.value}
                onChange={(e, isValid) => {
                  setHiresUpscaleStepsInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: VALIDATION_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="Denoising strength"
                id="denoisingStrength"
                name="denoisingStrength"
                type="text"
                placeholder="Denoising strength"
                value={denoisingStrengthtInput.value}
                onChange={(e, isValid) => {
                  setDenoisingStrengthInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: VALIDATION_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
              <Input
                label="VAE"
                id="vae"
                name="vae"
                type="text"
                placeholder="VAE"
                value={vaeInput.value}
                onChange={(e, isValid) => {
                  setVaeInput({ value: e.target.value, isValid });
                }}
                validation={{
                  maxLength: VALIDATION_NAME_MAX_LENGTH,
                }}
                showError={showErrorMessage}
              />
            </>
          )}
        </FieldCategory>
      </div>
      <div className={classes["submit-container"]}>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        <Button type="submit" disabled={isSaving} className={classes.submit}>
          {!isSaving ? "Save" : <Spinner size="small" />}
        </Button>
      </div>
    </form>
  );
};

export default VersionForm;
