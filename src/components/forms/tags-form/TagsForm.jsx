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

const firestore = getFirestore(firebaseApp);

const TagsForm = ({ versionData, defaultData, modelId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [mainTagInput, setMainTagInput] = useState("");
  const [trigerInput, setTrigerInput] = useState([]);
  const [helperTagsInput, setHelperTagsInput] = useState([]);
  const [negativeTagsInput, setNegativeTagsInput] = useState([]);
  const [tagSetsInputs, setTagSetsInputs] = useState([
    [
      {
        type: "text",
        id: "set-name-def",
        name: "set-name",
        placeholder: "set name",
        value: "",
      },
      {
        id: "set-value-def",
        name: "set-value",
        placeholder: "set value",
        value: "",
      },
    ],
  ]);
  console.log(versionData);
  const uid = useSelector((state) => state.auth.user.uid);

  useEffect(() => {
    setMainTagInput(versionData?.mainTag || "");
    setTrigerInput(
      versionData?.trainedWords?.join(", ") ||
        defaultData.trainedWords?.join(", ") ||
        []
    );
    setHelperTagsInput(versionData?.helperTags || []);
    setNegativeTagsInput(versionData?.negativeTags || []);
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
        },
        {
          id: "set-value" + i,
          name: "set-value",
          placeholder: "set value",
          value: tagSet.value,
        },
      ];
    });
    setTagSetsInputs(tagSets);
  }, [versionData]);

  const saveVersionHandler = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    seteErrorMessage("");
    seteSuccessMessage("");

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
      seteSuccessMessage("Saved");
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
      },
      {
        type: "text",
        id: `set-value-${Date.now()}`,
        name: "set-value",
        placeholder: "set value",
        value: "",
      },
    ]);
    console.log(newFields);
    setTagSetsInputs(newFields);
  };

  const tagSetsHandler = (e) => {
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
      if (curSetNameIndex !== -1) {
        newState[curSetNameIndex][0].value = e.target.value;
      }
      if (curSetTagsIndex !== -1) {
        newState[curSetTagsIndex][1].value = e.target.value;
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
        />
        <Textarea
          id={tagSet[1].id}
          name={tagSet[1].name}
          rows="4"
          placeholder={tagSet[1].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[1].value}
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
              value={mainTagInput}
              onChange={(e) => {
                setMainTagInput(e.target.value);
              }}
            />
            <Textarea
              label="Triger word"
              name="triger"
              type="text"
              rows="4"
              placeholder="Triger word"
              value={trigerInput}
              onChange={(e) => {
                setTrigerInput(e.target.value);
              }}
            />
            <Textarea
              label="Helper words"
              name="helper-tags"
              id=""
              rows="4"
              placeholder="Helper words"
              value={helperTagsInput}
              onChange={(e) => {
                setHelperTagsInput(e.target.value);
              }}
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
            <Textarea
              label="Negative words"
              name="negative-tags"
              id=""
              rows="4"
              placeholder="Negative words"
              value={negativeTagsInput}
              onChange={(e) => {
                setNegativeTagsInput(e.target.value);
              }}
            ></Textarea>
          </FieldCategory>
        </div>
      </div>
      <Buttton type="submit" disabled={isSaving}>
        Save
      </Buttton>
      {errorMessage && <div>{errorMessage}</div>}
      {successMessage && <div>{successMessage}</div>}
    </form>
  );
};

export default TagsForm;
