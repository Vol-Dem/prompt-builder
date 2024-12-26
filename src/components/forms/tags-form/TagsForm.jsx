import classes from "./TagsForm.module.scss";
import { useEffect, useState } from "react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useDispatch, useSelector } from "react-redux";
import Textarea from "../../ui/Textarea";
import Buttton from "../../ui/Button";
import Input from "../../ui/Input";
import ButttonSecondary from "../../ui/ButtonSecondary";
import Fieldset from "../../ui/Fieldset";
import FieldCategory from "../../ui/FieldCategory";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  DEF_ERROR_MESSAGE,
  ERROR_MESSAGE_INPUT_DEF,
  GUIDE_STEP_MODEL_TAGS_EDIT,
  GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
  VALIDATION_NAME_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
  SUCCESS_MESSAGE_UPLOADED,
  VALIDATION_TRIGER_WORDS_MAX_LENGTH,
  DEFAULT_DATA_TAGSETS_INPUT,
} from "../../../variables/constants";
// import { useOnlineStatus } from "../../../hooks/use-online-status";
import Spinner from "../../ui/Spinner";
import ButtonTertiary from "../../ui/ButtonTertiary";
import CrossSvg from "../../../assets/CrossSvg";
import { modelActions } from "../../../store/model";
import ModelTagsFormGuide from "../../ui/guide/model/ModelTagsEditGuide";
import AddTagSetGuide from "../../ui/guide/model/AddTagSetGuide";
import { guideActions } from "../../../store/guide";
import {
  createTagSetsInputData,
  handleErrors,
  throwCustomError,
} from "../../../utils/generalUtils";
import TagSetsInputFieldset from "../../ui/TagSetsInputFieldset";

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
  const guideActive = useSelector((state) => state.guide.model.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (guideActive && guideStep === GUIDE_STEP_MODEL_TAGS_EDIT) {
  //     dispatch(
  //       guideActions.setGuideStep({
  //         type: "model",
  //         value: GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
  //       })
  //     );
  //   }
  // }, [guideActive, guideStep, dispatch]);

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
    // if (!versionData.tagSetsData?.length) return;
    // const tagSets = versionData.tagSetsData.map((tagSet, i) => {
    //   return [
    //     {
    //       type: "text",
    //       id: "set-name" + i,
    //       name: "set-name",
    //       placeholder: "Set name",
    //       value: tagSet.name,
    //       isValid: true,
    //       errorMessage: "",
    //     },
    //     {
    //       id: "set-value" + i,
    //       name: "set-value",
    //       placeholder: "Triger words",
    //       value: tagSet.value,
    //       isValid: true,
    //       errorMessage: "",
    //     },
    //   ];
    // });
    // setTagSetsInputs(tagSets);
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
      const tagSetsValues = formdata.getAll("set-value");
      const trainedWords = formdata
        .get("triger")
        .trim()
        .split(splitRegEx)
        .filter(Boolean)
        .map((tag) => tag.trim());
      const tagSetNames = formdata.getAll("set-name");
      const tagSetsInputData = tagSetNames.flatMap((setName, i) => {
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
        mainTag,
        helperTags,
        negativeTags,
        trainedWords,
        tagSetsData,
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

  // const addtagSetHandler = () => {
  //   const newFields = [...tagSetsInputs];
  //   newFields.push([
  //     {
  //       type: "text",
  //       id: `set-name-${Date.now()}`,
  //       name: "set-name",
  //       placeholder: "Set name",
  //       value: "",
  //       isValid: true,
  //       errorMessage: "",
  //     },
  //     {
  //       type: "text",
  //       id: `set-value-${Date.now()}`,
  //       name: "set-value",
  //       placeholder: "Triger words",
  //       value: "",
  //       isValid: true,
  //       errorMessage: "",
  //     },
  //   ]);

  //   setTagSetsInputs(newFields);
  // };

  // const tagSetsHandler = (e, isValid) => {
  //   setTagSetsInputs((prevState) => {
  //     const newState = [...prevState];
  //     const curSetNameIndex = newState.findIndex((imageId) => {
  //       return imageId[0].id + "" === e.target.id;
  //     });
  //     const curSetTagsIndex = newState.findIndex((imageId) => {
  //       return imageId[1].id + "" === e.target.id;
  //     });

  //     if (curSetNameIndex !== -1) {
  //       newState[curSetNameIndex][0].value = e.target.value;
  //       newState[curSetNameIndex][0].isValid = isValid;
  //     }

  //     if (curSetTagsIndex !== -1) {
  //       newState[curSetTagsIndex][1].value = e.target.value;
  //       newState[curSetTagsIndex][1].isValid = isValid;
  //     }

  //     return newState;
  //   });
  // };

  // const deleteTagsetInputHandler = (index, e) => {
  //   setTagSetsInputs((prevState) => {
  //     return prevState.toSpliced(index, 1);
  //   });
  // };

  // const tagSetsHtml = tagSetsInputs.map((tagSet, i) => {
  //   return (
  //     <div key={tagSet[0].id} className={classes["tagset"]}>
  //       <div className={classes["tagset__header"]}>
  //         <span className={classes["tagset__title"]}>{`Tagset ${i + 1}`}</span>{" "}
  //         {i !== 0 && (
  //           <ButtonTertiary
  //             type="button"
  //             className={classes["input__btn-del"]}
  //             onClick={deleteTagsetInputHandler.bind(null, i)}
  //           >
  //             <CrossSvg />
  //           </ButtonTertiary>
  //         )}
  //       </div>
  //       <Input
  //         id={tagSet[0].id}
  //         name={tagSet[0].name}
  //         type={tagSet[0].type}
  //         placeholder={tagSet[0].placeholder}
  //         onChange={tagSetsHandler}
  //         value={tagSet[0].value}
  //         showError={showErrorMessage}
  //         validation={{
  //           maxLength: VALIDATION_NAME_MAX_LENGTH,
  //         }}
  //       />
  //       <Textarea
  //         id={tagSet[1].id}
  //         name={tagSet[1].name}
  //         rows="4"
  //         placeholder={tagSet[1].placeholder}
  //         onChange={tagSetsHandler}
  //         value={tagSet[1].value}
  //         showError={showErrorMessage}
  //         validation={{
  //           maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
  //         }}
  //       ></Textarea>
  //     </div>
  //   );
  // });

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
            <TagSetsInputFieldset
              tagSetsInputs={tagSetsInputs}
              setTagSetsInputs={setTagSetsInputs}
              showErrorMessage={showErrorMessage}
              isSaving={isSaving}
            />
            {/* <Fieldset legend="Tag sets" className={classes.fieldset}>
              {tagSetsHtml}
              <ButttonSecondary
                type="button"
                onClick={addtagSetHandler}
                disabled={isSaving}
                className={classes["btn-secondary"]}
              >
                + add new set
              </ButttonSecondary>
              <AddTagSetGuide />
            </Fieldset> */}
          </FieldCategory>
        </div>
      </div>
      <Buttton type="submit" disabled={isSaving} className={classes.submit}>
        {!isSaving ? "Save" : <Spinner size="small" />}
      </Buttton>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {/* <ModelTagsFormGuide /> */}
    </form>
  );
};

export default TagsForm;
