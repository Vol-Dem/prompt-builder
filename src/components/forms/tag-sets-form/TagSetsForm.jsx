import classes from "./TagSetsForm.module.scss";
import { useEffect, useMemo, useState } from "react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useDispatch, useSelector } from "react-redux";
import Buttton from "../../ui/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  ERROR_MESSAGE_INPUT_DEF,
  GUIDE_STEP_MODEL_TAGS_EDIT,
  GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
} from "../../../variables/constants";
import Spinner from "../../ui/Spinner";
import { modelActions } from "../../../store/model";
import ModelTagsFormGuide from "../../ui/guide/model/ModelTagsEditGuide";
import { guideActions } from "../../../store/guide";
import {
  createTagSetsInputData,
  handleErrors,
  throwCustomError,
} from "../../../utils/generalUtils";
import TagSetsInputFieldset from "../../ui/TagSetsInputFieldset";

const firestore = getFirestore(firebaseApp);

const TagSetsForm = ({ modelId, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [tagSetsInputs, setTagSetsInputs] = useState([]);

  const uid = useSelector((state) => state.auth.user.uid);
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const versionData = model.modelVersionsCustomData[curVersion.id];
  const guideActive = useSelector((state) => state.guide.model.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const dispatch = useDispatch();

  const defTags = useMemo(
    () => [
      [
        {
          type: "text",
          id: "set-name-def",
          name: "set-name",
          placeholder: "Set name",
          value: "",
          isValid: true,
        },
        {
          id: "set-value-def",
          name: "set-value",
          placeholder: "Triger words",
          value: "",
          isValid: true,
        },
      ],
    ],
    []
  );

  useEffect(() => {
    if (guideActive && guideStep === GUIDE_STEP_MODEL_TAGS_EDIT) {
      dispatch(
        guideActions.setGuideStep({
          type: "model",
          value: GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
        })
      );
    }
  }, [guideActive, guideStep, dispatch]);

  useEffect(() => {
    if (!versionData) return;

    setTagSetsInputs(createTagSetsInputData(versionData?.tagSetsData, defTags));
  }, [versionData, defTags]);

  const saveVersionHandler = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");
      setShowErrorMessage(true);
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false
      );

      if (tagsetsIsNotValid) {
        throwCustomError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throwCustomError(ERROR_MESSAGE_OFFLINE);
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
            ...versionData.tagSetsData[i],
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

      await updateDoc(
        modelsRef,
        {
          [versionPath]: updatedVersionData,
        },
        { merge: true }
      );

      const updatedCustomData = {
        ...model.modelVersionsCustomData,
        [versionData.versionId]: updatedVersionData,
      };

      dispatch(
        modelActions.setModelData({
          modelVersionsCustomData: updatedCustomData,
        })
      );
      setSuccessMessage(SUCCESS_MESSAGE_UPLOADED);
      setIsSaving(false);
      onClose();
    } catch (err) {
      setErrorMessage(handleErrors(err));
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
      <Buttton type="submit" disabled={isSaving} className={classes.submit}>
        {!isSaving ? "Save" : <Spinner size="small" />}
      </Buttton>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      <ModelTagsFormGuide />
    </form>
  );
};

export default TagSetsForm;
