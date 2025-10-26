import classes from "./TagsForm.module.scss";
import { useEffect, useState } from "react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useDispatch, useSelector } from "react-redux";
import Textarea from "../../ui/Textarea";
import Buttton from "../../ui/Button";
import Input from "../../ui/Input";
import FieldCategory from "../../ui/FieldCategory";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  ERROR_MESSAGE_INPUT_DEF,
  VALIDATION_NAME_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
  VALIDATION_TRIGER_WORDS_MAX_LENGTH,
  DEFAULT_DATA_TAGSETS_INPUT,
} from "../../../variables/constants";
import Spinner from "../../ui/Spinner";
import { modelActions } from "../../../store/model";
import { handleErrors, throwCustomError } from "../../../utils/generalUtils";
import { createTagSetsInputData } from "../../../utils/promptUtils";

const firestore = getFirestore(firebaseApp);

const TagsForm = ({ versionData, defaultData, modelId, onClose }) => {
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
  const [tagSetsInputs, setTagSetsInputs] = useState([]);

  const uid = useSelector((state) => state.auth.user.uid);
  const model = useSelector((state) => state.model.model);
  const dispatch = useDispatch();

  useEffect(() => {
    if (versionData?.mainTag) {
      setMainTagInput({ value: versionData?.mainTag || "", isValid: true });
    }

    if (
      !!versionData?.trainedWords?.length ||
      !!defaultData?.trainedWords?.length
    ) {
      setTrigerInput(
        versionData?.trainedWords
          ? { value: versionData?.trainedWords?.join(", "), isValid: true }
          : { value: defaultData.trainedWords?.join(", "), isValid: true }
      );
    }

    if (versionData?.helperTags) {
      setHelperTagsInput({ value: versionData?.helperTags, isValid: true });
    }

    if (versionData?.negativeTags) {
      setNegativeTagsInput({ value: versionData?.negativeTags, isValid: true });
    }
  }, [versionData, defaultData]);

  useEffect(() => {
    if (!versionData) return;

    setTagSetsInputs(
      createTagSetsInputData(
        versionData?.tagSetsData,
        DEFAULT_DATA_TAGSETS_INPUT
      )
    );
  }, [versionData]);

  const saveVersionHandler = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");
      setShowErrorMessage(true);
      const tagsetsIsNotValid = !!tagSetsInputs.find(
        (input) => input[0].isValid === false || input[1].isValid === false
      );

      if (
        !mainTagInput.isValid ||
        !trigerInput.isValid ||
        !helperTagsInput.isValid ||
        !negativeTagsInput.isValid ||
        tagsetsIsNotValid
      ) {
        throwCustomError(ERROR_MESSAGE_INPUT_DEF);
      }
      if (!navigator?.onLine) {
        throwCustomError(ERROR_MESSAGE_OFFLINE);
      }

      setIsSaving(true);

      const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

      const formdata = new FormData(e.target);
      const mainTag = formdata.get("main-tag").trim();
      const trainedWords = formdata
        .get("triger")
        .trim()
        .split(splitRegEx)
        .filter(Boolean)
        .map((tag) => tag.trim());
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
        modelId + ""
      );

      const versionPath = `modelVersionsCustomData.${versionData.versionId}`;

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
              type="text"
              rows="4"
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
              rows="4"
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
              rows="4"
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
      <Buttton type="submit" disabled={isSaving} className={classes.submit}>
        {!isSaving ? "Save" : <Spinner size="small" />}
      </Buttton>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </form>
  );
};

export default TagsForm;
