import { useCallback, useState } from "react";

import { saveModelVersionChanges } from "../utils/fetch/fetchModelEdits";
import { AppError, handleErrors, normalizeError } from "../utils/generalUtils";
import { buildTagSets, splitTags } from "../utils/promptUtils";
import { clearFileExtension } from "../../shared/utils";
import { useAppSelector } from "../store/hooks/hooks";
import {
  ERROR_MESSAGE_INPUT_DEF,
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
} from "../variables/constants";
import type { ModelVersionCustomData, UserModelDefaultCustomData } from "../../shared/types/model";
import type { TagSetInputData } from "../types/prompt.types";

type TextInput = { value: string; isValid: boolean };

type VersionSaveDraft = {
  mainTagInput: TextInput;
  titleInput: TextInput;
  descriptionInput: TextInput;
  trigerInput: TextInput;
  fileNameInput: TextInput;
  weightInput: TextInput;
  minWeightInput: TextInput;
  maxWeightInput: TextInput;
  sizetInput: TextInput;
  helperTagsInput: TextInput;
  negativeTagsInput: TextInput;
  vaeInput: TextInput;
  denoisingStrengthtInput: TextInput;
  hiresUpscaleInput: TextInput;
  hiresUpscaleStepsInput: TextInput;
  hiresUpscalerInput: TextInput;
  cfgScaleInput: TextInput;
  samplerInput: TextInput;
  stepsInput: TextInput;
  tagSetsInputs: TagSetInputData[];
};

type VersionSaveOptions = {
  versionData?: ModelVersionCustomData | UserModelDefaultCustomData | null;
  modelId: number;
  modelType: string;
  isDefault: boolean;
};

/** Owns version/default persistence and status; draft fields and hydration stay in the form. */
const useVersionSave = ({ versionData, modelId, modelType, isDefault }: VersionSaveOptions) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const uid = useAppSelector((state) => state.auth.user.uid);
  const model = useAppSelector((state) => state.model.model);

  const clearMessages = useCallback(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const submit = async ({
    mainTagInput, titleInput, descriptionInput, trigerInput, fileNameInput,
    weightInput, minWeightInput, maxWeightInput, sizetInput, helperTagsInput,
    negativeTagsInput, vaeInput, denoisingStrengthtInput, hiresUpscaleInput,
    hiresUpscaleStepsInput, hiresUpscalerInput, cfgScaleInput, samplerInput,
    stepsInput, tagSetsInputs,
  }: VersionSaveDraft) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
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
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throw new AppError(ERROR_MESSAGE_OFFLINE);
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
      const tagSetsData = buildTagSets(
        tagSetNames,
        tagSetsValues,
        versionData?.tagSetsData,
      );

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

      await saveModelVersionChanges(
        uid,
        modelId,
        versionId === "def" ? "default" : versionId,
        updatedVersionData,
        { mainTags, customFileNames },
      );
      setSuccessMessage(SUCCESS_MESSAGE_UPLOADED);
      setIsSaving(false);
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
      setIsSaving(false);
    }
  };

  return {
    status: { isSaving, errorMessage, showErrorMessage, successMessage },
    submit,
    clearMessages,
  };
};

export default useVersionSave;
