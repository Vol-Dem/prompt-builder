import { useEffect, useState, type SubmitEvent } from "react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

import firebaseApp from "../../../firebase-config";
import classes from "./TagSetsForm.module.scss";
import Button from "../../ui/buttons/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  ERROR_MESSAGE_INPUT_DEF,
  GUIDE_STEP_MODEL_TAGS_EDIT,
  GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
  ERROR_MESSAGE_DEFAULT,
} from "../../../variables/constants";
import Spinner from "../../ui/Spinner";
import { modelActions } from "../../../store/model";
import ModelTagsFormGuide from "../../general-elements/guide/model/ModelTagsEditGuide";
import { guideActions } from "../../../store/guide";
import {
  AppError,
  handleErrors,
  normalizeError,
} from "../../../utils/generalUtils";
import TagSetsInputFieldset from "../../ui/forms/TagSetsInputFieldset";
import { createTagSetsInputData } from "../../../utils/promptUtils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { TagSetInputData } from "../../../types/prompt.types";
import { FORMS_DEF_TAGS_INPUT } from "../../../variables/structures";

const firestore = getFirestore(firebaseApp);

type TagSetsFormProps = { modelId: number; onClose: () => void };

/**
 * Tag sets form component.
 *
 * Provides creation and editing flow for tag sets.
 *
 * Responsibilities:
 * - Renders editable tag sets fields.
 * - Validates user input.
 * - Displays validation and error messages.
 * - Submits tag sets data and closes the form on success.
 *
 * Side effects:
 * - Dispatches setModelData actions.
 *
 * @component
 *
 * @param props
 * @param props.modelId - Model ID.
 * @param props.onClose - Callback triggered after successful submit to close the form.
 * @returns Tag sets management form.
 */
const TagSetsForm = ({ modelId, onClose }: TagSetsFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [tagSetsInputs, setTagSetsInputs] = useState<TagSetInputData[]>([]);

  const uid = useAppSelector((state) => state.auth.user.uid);
  const model = useAppSelector((state) => state.model.model);
  const curVersion = useAppSelector((state) => state.model.curVersion);
  const versionData =
    curVersion &&
    model?.modelVersionsCustomData &&
    model?.modelVersionsCustomData[curVersion?.id];
  const guideActive = useAppSelector((state) => state.guide.model.active);
  const guideStep = useAppSelector((state) => state.guide.model.step);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (guideActive && guideStep === GUIDE_STEP_MODEL_TAGS_EDIT) {
      dispatch(
        guideActions.setGuideStep({
          type: "model",
          value: GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
        }),
      );
    }
  }, [guideActive, guideStep, dispatch]);

  useEffect(() => {
    if (!versionData) return;

    setTagSetsInputs(
      createTagSetsInputData(versionData.tagSetsData, FORMS_DEF_TAGS_INPUT),
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

      if (tagsetsIsNotValid) {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }

      if (!navigator?.onLine) {
        throw new AppError(ERROR_MESSAGE_OFFLINE);
      }

      if (!versionData) {
        throw new AppError(ERROR_MESSAGE_DEFAULT);
      }

      setIsSaving(true);

      const formdata = new FormData(e.target);
      const tagSetsValues = formdata.getAll("set-value");
      const tagSetNames = formdata.getAll("set-name");
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
            ...versionData.tagSetsData![i],
            ...tagSet,
          };
        });
      }

      const updatedVersionData = {
        ...versionData,
        tagSetsData,
      };

      const modelsRef = doc(firestore, "users", uid, "models", modelId + "");

      const versionPath = `modelVersionsCustomData.${versionData.versionId}`;

      await updateDoc(modelsRef, {
        [versionPath]: updatedVersionData,
      });

      const updatedCustomData = {
        ...model.modelVersionsCustomData,
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
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={saveVersionHandler} className={classes["form"]}>
      <div className={classes.inputs}>
        <div className={classes.fields}>
          <TagSetsInputFieldset
            tagSetsInputs={tagSetsInputs}
            setTagSetsInputs={setTagSetsInputs}
            showErrorMessage={showErrorMessage}
            isSaving={isSaving}
          />
        </div>
      </div>
      <Button type="submit" disabled={isSaving} className={classes.submit}>
        {!isSaving ? "Save" : <Spinner size="small" />}
      </Button>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      <ModelTagsFormGuide />
    </form>
  );
};

export default TagSetsForm;
