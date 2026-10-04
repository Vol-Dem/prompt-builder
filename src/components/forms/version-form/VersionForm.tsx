import { useEffect, useState, type SubmitEvent } from "react";

import classes from "./VersionForm.module.scss";
import TagSetsInputFieldset from "../../ui/forms/TagSetsInputFieldset";
import useTagSetInputs from "../../../hooks/use-tag-set-inputs";
import VersionWeightFields from "./version-weight-fields/VersionWeightFields";
import Textarea from "../../ui/forms/Textarea";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/forms/Input";
import FieldCategory from "../../ui/forms/FieldCategory";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  VALIDATION_DESCRIPTION_MAX_LENGTH,
  VALIDATION_NAME_MAX_LENGTH,
  VALIDATION_TITLE_MAX_LENGTH,
  VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
} from "../../../variables/constants";
import Spinner from "../../ui/Spinner";
import { createTagSetsInputData } from "../../../utils/promptUtils";
import { FORMS_DEF_TAGS_INPUT } from "../../../variables/structures";
import type {
  ModelVersion,
  ModelVersionCustomData,
  UserModelDefaultCustomData,
} from "../../../../shared/types/model";
import useVersionSave from "../../../hooks/use-version-save";

type VersionFormProps = {
  versionData?: ModelVersionCustomData | UserModelDefaultCustomData | null;
  defaultData?: UserModelDefaultCustomData | ModelVersion | null;
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
 * - Persists version or default model data.
 *
 * @component
 *
 * @param props
 * @param props.versionData - User-modified model version fields.
 * @param props.defaultData - Model-level default version fields.
 * @param props.modelId - Model ID.
 * @param props.modelType - Model type.
 * @param props.isDefault - Enables model-wide default editing mode.
 * @returns Model Version edit form.
 */
const VersionForm = ({
  versionData,
  defaultData,
  modelId,
  modelType,
  isDefault,
}: VersionFormProps) => {
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
  const tagSets = useTagSetInputs();
  const { fields: tagSetsInputs, reset: resetTagSetsInputs } = tagSets;
  const {
    status: { isSaving, errorMessage, showErrorMessage, successMessage },
    submit,
    clearMessages,
  } = useVersionSave({ versionData, modelId, modelType, isDefault });

  useEffect(() => {
    clearMessages();
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
  }, [versionData, defaultData, clearMessages]);

  useEffect(() => {
    resetTagSetsInputs(
      createTagSetsInputData(versionData?.tagSetsData, FORMS_DEF_TAGS_INPUT),
    );
  }, [versionData, resetTagSetsInputs]);

  const saveVersionHandler = (e: SubmitEvent) => {
    e.preventDefault();
    return submit({
      mainTagInput, titleInput, descriptionInput, trigerInput, fileNameInput,
      weightInput, minWeightInput, maxWeightInput, sizetInput, helperTagsInput,
      negativeTagsInput, vaeInput, denoisingStrengthtInput, hiresUpscaleInput,
      hiresUpscaleStepsInput, hiresUpscalerInput, cfgScaleInput, samplerInput,
      stepsInput, tagSetsInputs,
    });
  };

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
              maxLength: VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
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
              maxLength: VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
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
              maxLength: VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
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
              maxLength: VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
            }}
            showError={showErrorMessage}
          ></Textarea>
          <TagSetsInputFieldset
            tagSets={tagSets}
            showErrorMessage={showErrorMessage}
            isSaving={isSaving}
          />
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
          <VersionWeightFields
            minWeight={minWeightInput.value}
            maxWeight={maxWeightInput.value}
            weight={weightInput.value}
            showError={showErrorMessage}
            onMinWeightChange={(value, isValid) => {
              setMinWeightInput({
                value,
                isValid: isValid === null ? true : isValid,
              });
            }}
            onMaxWeightChange={(value, isValid) => {
              setMaxWeightInput({
                value,
                isValid: isValid === null ? true : isValid,
              });
            }}
            onWeightChange={(value, isValid) => {
              setWeightInput({
                value,
                isValid: isValid === null ? true : isValid,
              });
            }}
          />
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
