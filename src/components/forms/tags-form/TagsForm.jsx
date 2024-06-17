import classes from "./TagsForm.module.scss";
import { useEffect, useState } from "react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";
import Textarea from "../../ui/Textarea";
import Buttton from "../../ui/Button";
import Input from "../../ui/Input";
import ButttonSecondary from "../../ui/ButtonSecondary";
import Fieldset from "../../ui/Fieldset";
import FieldCategory from "../../ui/FieldCategory";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import {
  DEF_INPUT_ERROR_MESSAGE,
  NAME_MAX_LENGTH,
  SAVED_SUCCESS_MESSAGE,
  TRIGER_WORDS_MAX_LENGTH,
} from "../../../variables/constants";
import { validateInput } from "../../../utils/generalUtils";

const firestore = getFirestore(firebaseApp);

const TagsForm = ({ versionData, defaultData, modelId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, seteSuccessMessage] = useState("");
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
  const [tagSetsInputs, setTagSetsInputs] = useState([
    [
      {
        type: "text",
        id: "set-name-def",
        name: "set-name",
        placeholder: "set name",
        value: "",
        isValid: true,
      },
      {
        id: "set-value-def",
        name: "set-value",
        placeholder: "set value",
        value: "",
        isValid: true,
      },
    ],
  ]);
  // console.log(versionData);
  const uid = useSelector((state) => state.auth.user.uid);

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
    if (!versionData.tagSetsData?.length) return;
    const tagSets = versionData.tagSetsData.map((tagSet, i) => {
      console.log(tagSet);
      return [
        {
          type: "text",
          id: "set-name" + i,
          name: "set-name",
          placeholder: "set name",
          value: tagSet.name,
          isValid: true,
          errorMessage: "",
        },
        {
          id: "set-value" + i,
          name: "set-value",
          placeholder: "set value",
          value: tagSet.value,
          isValid: true,
          errorMessage: "",
        },
      ];
    });
    setTagSetsInputs(tagSets);
  }, [versionData]);

  const saveVersionHandler = async (e) => {
    e.preventDefault();
    seteErrorMessage("");
    seteSuccessMessage("");
    setShowErrorMessage(true);
    const tagsetsIsNotValid = !!tagSetsInputs.find(
      (input) => input[0].isValid === false || input[1].isValid === false
    );
    console.log(tagsetsIsNotValid);
    console.log(mainTagInput.isValid);
    console.log(trigerInput.isValid);
    console.log(helperTagsInput.isValid);
    console.log(negativeTagsInput.isValid);
    if (
      !mainTagInput.isValid ||
      !trigerInput.isValid ||
      !helperTagsInput.isValid ||
      !negativeTagsInput.isValid ||
      tagsetsIsNotValid
    ) {
      throw new Error(DEF_INPUT_ERROR_MESSAGE);
    }
    // return;
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

    try {
      const updatedVersionData = {
        ...versionData,
        mainTag,
        helperTags,
        negativeTags,
        trainedWords,
        tagSetsData,
      };

      console.log(updatedVersionData);

      const modelsRef = doc(firestore, "users", uid, "models", modelId + "");
      const modelsPrevRef = doc(
        firestore,
        "users",
        uid,
        "preview",
        modelId + ""
      );

      console.log(updatedVersionData);
      console.log(versionData);
      const versionPath = `modelVersionsCustomData.${versionData.versionId}`;
      console.log(versionPath);
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
      seteSuccessMessage(SAVED_SUCCESS_MESSAGE);
      setIsSaving(false);
    } catch (err) {
      console.log(err.message);
      seteErrorMessage(err.message);
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
        placeholder: "set name",
        value: "",
        isValid: true,
        errorMessage: "",
      },
      {
        type: "text",
        id: `set-value-${Date.now()}`,
        name: "set-value",
        placeholder: "set value",
        value: "",
        isValid: true,
        errorMessage: "",
      },
    ]);
    console.log(newFields);
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
      console.log(curSetNameIndex, curSetTagsIndex);
      console.log(newState);
      // const { isValid, errorMessage } = validateInput(
      //   {
      //     maxLength:
      //       curSetNameIndex !== -1 ? NAME_MAX_LENGTH : TRIGER_WORDS_MAX_LENGTH,
      //   },
      //   e.target.value
      // );
      console.log("TAGSEDTS", isValid, errorMessage);
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
      console.log(newState);
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
          // error={tagSet[0].errorMessage}
          showError={showErrorMessage}
          validation={{
            maxLength: NAME_MAX_LENGTH,
          }}
        />
        <Textarea
          id={tagSet[1].id}
          name={tagSet[1].name}
          rows="4"
          placeholder={tagSet[1].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[1].value}
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
      {/* <div className={classes.subtitle}>
        Version ID: {versionData.id || defaultData.id}
      </div> */}
      <div className={classes.inputs}>
        <div className={classes.fields}>
          <FieldCategory>
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
                maxLength: NAME_MAX_LENGTH,
              }}
              showError={showErrorMessage}
            />
            <Textarea
              label="Triger word"
              name="triger"
              type="text"
              rows="4"
              placeholder="Triger word"
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
              rows="4"
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
              rows="4"
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
        </div>
      </div>
      <Buttton type="submit" disabled={isSaving} className={classes.submit}>
        Save
      </Buttton>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </form>
  );
};

export default TagsForm;
