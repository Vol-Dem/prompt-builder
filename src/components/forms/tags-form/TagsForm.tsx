import { useEffect, useState, type SubmitEvent } from "react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

import firebaseApp from "../../../firebase-config";
import classes from "./TagsForm.module.scss";
import Textarea from "../../ui/forms/Textarea";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/forms/Input";
import FieldCategory from "../../ui/forms/FieldCategory";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  ERROR_MESSAGE_INPUT_DEF,
  VALIDATION_NAME_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
  VALIDATION_TRIGER_WORDS_MAX_LENGTH,
} from "../../../variables/constants";
import Spinner from "../../ui/Spinner";
import { modelActions } from "../../../store/model";
import {
  AppError,
  getFormData,
  handleErrors,
  normalizeError,
} from "../../../utils/generalUtils";
import { createTagSetsInputData, splitTags } from "../../../utils/promptUtils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type {
  ModelVersionCustomData,
  UserModelDefaultCustomData,
} from "../../../../shared/types/model";
import { FORMS_DEF_TAGS_INPUT } from "../../../variables/structures";
import type { TagSetInputData } from "../../../types/prompt.types";

const firestore = getFirestore(firebaseApp);

type TagsFormProps = {
  versionData: ModelVersionCustomData;
  defaultData?: UserModelDefaultCustomData;
  modelId: number;
  onClose: () => void;
};

/**
 * Tags form component.
 *
 * Provides editing flow for model tags.
 *
 * Responsibilities:
 * - Renders editable tags fields.
 * - Validates user input.
 * - Displays validation and error messages.
 * - Submits tags data and closes the form on success.
 *
 * Side effects:
 * - Dispatches setModelData actions.
 *
 * @component
 *
 * @param props
 * @param props.modelId - Model ID.
 * @param props.versionData - Version tags data.
 * @param props.defaultData - Default tags data.
 * @param props.onClose - Callback triggered after successful submit to close the form.
 * @returns Tags management form.
 */
const TagsForm = ({
  versionData,
  defaultData,
  modelId,
  onClose,
}: TagsFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [mainTagInput, setMainTagInput] = useState({
    value: "",
    isValid: true,
  });
  const [trigerInput, setTrigerInput] = useState({ value: "", isValid: true });
  const [helperTagsInput, setHelperTagsInput] = useState({
    value: "",
    isValid: true,
  });
  const [negativeTagsInput, setNegativeTagsInput] = useState({
    value: "",
    isValid: true,
  });
  const [tagSetsInputs, setTagSetsInputs] = useState<TagSetInputData[]>([]);

  const uid = useAppSelector((state) => state.auth.user.uid);
  const model = useAppSelector((state) => state.model.model);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (versionData?.mainTag) {
      setMainTagInput({ value: versionData?.mainTag || "", isValid: true });
    }

    if (!!defaultData?.trainedWords?.length) {
      setTrigerInput({
        value: defaultData?.trainedWords?.join(", "),
        isValid: true,
      });
    }

    if (!!versionData?.trainedWords?.length) {
      setTrigerInput({
        value: versionData?.trainedWords?.join(", "),
        isValid: true,
      });
    }

    if (versionData?.helperTags) {
      setHelperTagsInput({
        value: versionData?.helperTags.join(", "),
        isValid: true,
      });
    }

    if (versionData?.negativeTags) {
      setNegativeTagsInput({
        value: versionData?.negativeTags.join(", "),
        isValid: true,
      });
    }
  }, [versionData, defaultData]);

  useEffect(() => {
    if (!versionData) return;

    setTagSetsInputs(
      createTagSetsInputData(versionData?.tagSetsData, FORMS_DEF_TAGS_INPUT),
    );
  }, [versionData]);

  const saveVersionHandler = async (e: SubmitEvent) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");
      setShowErrorMessage(true);
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false,
      );

      if (
        !mainTagInput.isValid ||
        !trigerInput.isValid ||
        !helperTagsInput.isValid ||
        !negativeTagsInput.isValid ||
        tagsetsIsNotValid
      ) {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throw new AppError(ERROR_MESSAGE_OFFLINE);
      }

      setIsSaving(true);

      const formData = getFormData(e.target);

      const mainTag = formData["main-tag"];
      const trainedWords = splitTags(formData.triger);
      const helperTags = splitTags(formData["helper-tags"]);
      const negativeTags = splitTags(formData["negative-tags"]);

      const updatedVersionData = {
        ...versionData,
        mainTag,
        helperTags,
        negativeTags,
        trainedWords,
      };

      const modelsRef = doc(firestore, "users", uid, "models", modelId + "");
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        modelId + "",
      );

      const versionPath = `modelVersionsCustomData.${versionData.versionId}`;

      await updateDoc(modelsRef, {
        [versionPath]: updatedVersionData,
      });
      await updateDoc(modelsPrevRef, {
        [versionPath]: updatedVersionData,
      });

      const updatedCustomData = {
        ...model?.modelVersionsCustomData,
        [versionData.versionId]: updatedVersionData,
      };

      dispatch(
        modelActions.updateModelDataField({
          modelVersionsCustomData: updatedCustomData,
        }),
      );
      setSuccessMessage(SUCCESS_MESSAGE_UPLOADED);
      setIsSaving(false);
      onClose();
    } catch (err) {
      const errorMeessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMeessage);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={saveVersionHandler} className={classes["form"]}>
      <div className={classes.inputs}>
        <div className={classes.fields}>
          <FieldCategory>
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
                maxLength: VALIDATION_NAME_MAX_LENGTH,
              }}
              showError={showErrorMessage}
            />
            <Textarea
              label="Trigger words"
              id="triger"
              name="triger"
              rows={4}
              placeholder="Triger word"
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
              rows={4}
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
              rows={4}
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
          </FieldCategory>
        </div>
      </div>
      <Button type="submit" disabled={isSaving} className={classes.submit}>
        {!isSaving ? "Save" : <Spinner size="small" />}
      </Button>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </form>
  );
};

export default TagsForm;
