import React, { useEffect, useState } from "react";
import classes from "./VersionForm.module.scss";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";
import Textarea from "../../ui/Textarea";
import Buttton from "../../ui/Button";
import Input from "../../ui/Input";
import ButttonSecondary from "../../ui/ButtonSecondary";
import Fieldset from "../../ui/Fieldset";

const firestore = getFirestore(firebaseApp);

const VersionForm = ({ versionData, modelId, modelType }) => {
  const [modelIsSaving, setModelIsSaving] = useState(false);
  const [mainTagInput, setMainTagInput] = useState(versionData?.mainTag || "");
  const [trigerInput, setTrigerInput] = useState(
    versionData?.trainedWords?.join(", ") || []
  );
  const [fileNameInput, setFileNameInput] = useState(
    versionData?.fileName || ""
  );
  const [weightInput, setWeightInput] = useState(versionData?.weight || "");
  const [sizetInput, setSizeInput] = useState(versionData?.size || "");
  const [helperTagsInput, setHelperTagsInput] = useState(
    versionData?.helperTags || []
  );
  const [negativeTagsInput, setNegativeTagsInput] = useState(
    versionData?.negativeTags || []
  );

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

  const uid = useSelector((state) => state.auth.user.uid);

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

  const saveVersionInfoHandler = (e) => {
    e.preventDefault();

    const formdata = new FormData(e.target);

    const mainTag = formdata.get("main-tag").trim();
    const weight = formdata.get("weight").trim();
    const size = formdata.get("size").trim();
    const fileName = formdata.get("file-name").trim();
    const tagSetNames = formdata.getAll("set-name");
    const tagSetsValues = formdata.getAll("set-value");

    const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

    const trainedWords = formdata
      .get("triger")
      .trim()
      .split(splitRegEx)
      .filter(Boolean)
      .map((tag) => tag.trim());

    const tagSetsData = tagSetNames.flatMap((setName, i) => {
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

    const getModelData = async () => {
      try {
        setModelIsSaving(true);
        const updatedVersionData = {
          ...versionData,
          mainTag,
          trainedWords,
          fileName,
          tagSetsData,
          weight,
          size,
          helperTags,
          negativeTags,
        };

        console.log(updatedVersionData);

        const modelsRef = doc(firestore, "users", uid, "models", modelId + "");
        let modelsPrevRef;

        if (modelType === "Checkpoint") {
          modelsPrevRef = doc(
            firestore,
            "users",
            uid,
            "checkpoints preview",
            modelId + ""
          );
        } else {
          modelsPrevRef = doc(
            firestore,
            "users",
            uid,
            "models preview",
            modelId + ""
          );
        }

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
        setModelIsSaving(false);
      } catch (err) {
        console.log(err);
        setModelIsSaving(false);
      }
    };

    getModelData();
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
          rows="5"
          placeholder={tagSet[1].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[1].value}
        ></Textarea>
      </div>
    );
  });

  return (
    <form onSubmit={saveVersionInfoHandler} className={classes["form"]}>
      <Input
        name="main-tag"
        type="text"
        placeholder="main-tag"
        value={mainTagInput}
        onChange={(e) => {
          setMainTagInput(e.target.value);
        }}
      />

      <Input
        name="file-name"
        type="text"
        placeholder="file name"
        value={fileNameInput}
        onChange={(e) => {
          setFileNameInput(e.target.value);
        }}
      />
      <Input
        name="triger"
        type="text"
        placeholder="triger word"
        value={trigerInput}
        onChange={(e) => {
          setTrigerInput(e.target.value);
        }}
      />
      <Input
        name="weight"
        type="text"
        placeholder="weight"
        value={weightInput}
        onChange={(e) => {
          setWeightInput(e.target.value);
        }}
      />
      <Input
        name="size"
        type="text"
        placeholder="size"
        value={sizetInput}
        onChange={(e) => {
          setSizeInput(e.target.value);
        }}
      />
      <Fieldset legend="Tag sets">
        {tagSetsHtml}
        <ButttonSecondary
          type="button"
          onClick={addtagSetHandler}
          disabled={modelIsSaving}
          className={classes["btn-secondary"]}
        >
          + add new set
        </ButttonSecondary>
      </Fieldset>
      <Textarea
        name="helper-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="helper tags"
        value={helperTagsInput}
        onChange={(e) => {
          setHelperTagsInput(e.target.value);
        }}
      ></Textarea>
      <Textarea
        name="negative-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="negative tags"
        value={negativeTagsInput}
        onChange={(e) => {
          setNegativeTagsInput(e.target.value);
        }}
      ></Textarea>
      <Buttton type="submit" disabled={modelIsSaving}>
        Save
      </Buttton>
    </form>
  );
};

export default VersionForm;
