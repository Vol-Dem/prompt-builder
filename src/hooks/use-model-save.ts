import { useState } from "react";

import { AppError, handleErrors, normalizeError } from "../utils/generalUtils";
import { parseModelIds } from "../utils/modelUtils";
import { saveModelData } from "../utils/fetch/fetchModel";
import { modelActions } from "../store/model";
import { tabActions } from "../store/tabs";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import {
  ERROR_MESSAGE_INPUT_DEF, ERROR_MESSAGE_OFFLINE, ERROR_MESSAGE_INVALID_MODEL_ID,
  ERROR_MESSAGE_EXISTS, SUCCESS_MESSAGE_UPLOADED,
  SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT, SETTINGS_FORMS_TAGSETS_MAX_AMOUNT,
} from "../variables/constants";
import type { ModelData } from "../types/models.types";
import type { SelectInput, SubcategoryInput, VersionStatusInput } from "../types/forms.types";
import type { TagSetInputData } from "../types/prompt.types";
import type { ModelPreviewDoc } from "../../shared/types/firestore";

type TextInput = { value: string; isValid: boolean };

type ModelSaveDraft = {
  idInput: TextInput;
  srcInput: TextInput;
  titleInput: TextInput;
  descriptionInput: TextInput;
  hashtagsInput: TextInput;
  modelTypeInput: string;
  mainCategorySelected: SelectInput<string>;
  subCatInputs: SubcategoryInput[];
  tagSetsInputs: TagSetInputData[];
  versionsDownloadStatus: VersionStatusInput[];
  nsfwInput: boolean;
};

type ModelSaveOptions = {
  modelData?: ModelData;
  newModelVersionId?: number | null;
  onSave?: (preview: ModelPreviewDoc) => void;
  onReset: () => void;
};

/** Validates and saves a model draft; the form owns fields, hydration and resets. */
const useModelSave = ({ modelData, newModelVersionId, onSave, onReset }: ModelSaveOptions) => {
  const [modelIsSaving, setModelIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [savedModel, setSavedModel] = useState<number | null>(null);
  const categories = useAppSelector((state) => state.tabs.categoriesData);
  const curBaseModels = useAppSelector((state) => state.tabs.baseModels);
  const curModel = useAppSelector((state) => state.model.model);
  const dispatch = useAppDispatch();

  const submit = async ({
    idInput, srcInput, titleInput, descriptionInput, hashtagsInput,
    modelTypeInput, mainCategorySelected, subCatInputs, tagSetsInputs,
    versionsDownloadStatus, nsfwInput,
  }: ModelSaveDraft) => {
    setErrorMessage("");
    setSuccessMessage("");
    setShowErrorMessage(true);
    setModelIsSaving(true);

    let modelId: number | null = null;
    let modelVersionId: number | null = null;

    try {
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false,
      );
      const subcatsIsValid = !!subCatInputs.find(
        (input) => input.isValid === true,
      );
      const mainInputsIsNotValid =
        !idInput.isValid || !mainCategorySelected.isValid || !subcatsIsValid;
      const baseInputsIsNotValid =
        !srcInput.isValid ||
        !titleInput.isValid ||
        !descriptionInput.isValid ||
        tagsetsIsNotValid ||
        !hashtagsInput.isValid;

      if (
        subCatInputs.length > SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT ||
        tagSetsInputs.length > SETTINGS_FORMS_TAGSETS_MAX_AMOUNT ||
        mainInputsIsNotValid ||
        (!!modelData && baseInputsIsNotValid)
      ) {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throw new AppError(ERROR_MESSAGE_OFFLINE);
      }

      [modelId, modelVersionId] = parseModelIds(idInput.value);

      if (!modelId) {
        throw new AppError(ERROR_MESSAGE_INVALID_MODEL_ID);
      }

      if (newModelVersionId) {
        modelVersionId = newModelVersionId;
      }

      const modelType = modelTypeInput;
      const modelName = titleInput.value.trim();
      const main = mainCategorySelected.name;
      const hashtags = hashtagsInput.value
        .split(",")
        .map((hashtag) => hashtag.trim())
        .filter(Boolean);
      const sub = [
        ...new Set(subCatInputs.map((el) => el?.selected?.name?.trim())),
      ].filter((el) => el !== undefined);

      const newModelData = {
        modelId,
        modelVersionId,
        modelType,
        modelName,
        categories,
        main,
        sub,
        hashtags,
        versionsDownloadStatus,
        nsfw: nsfwInput,
      };

      const {
        preview,
        baseModels,
        modelData: userModelData,
      } = await saveModelData(
        newModelData,
        categories,
        curBaseModels,
        modelData,
      );

      if (baseModels) {
        dispatch(tabActions.setBaseModels(baseModels));
      }

      if (onSave) onSave(preview);

      if (!modelData) onReset();

      if (curModel?.id && modelId === curModel?.id) {
        dispatch(modelActions.updateModelDataField(userModelData));
      }
      setSavedModel(modelId);
      setSuccessMessage(SUCCESS_MESSAGE_UPLOADED);
      setShowErrorMessage(false);
      setModelIsSaving(false);
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      if (errorMessage === ERROR_MESSAGE_EXISTS) {
        setSavedModel(modelId);
      }
      setErrorMessage(errorMessage);
      setModelIsSaving(false);
    }
  };

  return {
    status: { modelIsSaving, errorMessage, showErrorMessage, successMessage, savedModel },
    submit,
  };
};

export default useModelSave;
