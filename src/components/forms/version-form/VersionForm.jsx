import React, { useEffect, useState } from "react";
import classes from "./VersionForm.module.scss";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";

const firestore = getFirestore(firebaseApp);

const VersionForm = ({ versionData, modelId, modelType }) => {
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

  const [tagSetsAmount, setTagSetsAmount] = useState([
    [
      {
        type: "text",
        id: "set-name-1",
        name: "set-name",
        placeholder: "set name",
        value: "",
      },
      {
        id: "set-value-1",
        name: "set-value",
        placeholder: "set value",
        value: "",
      },
    ],
  ]);

  const uid = useSelector((state) => state.auth.user.uid);

  useEffect(() => {
    if (!versionData) return;
    if (!versionData.tagSetsData) return;
    const tagSets = versionData.tagSetsData.map((tagSet, i) => {
      console.log(tagSet);
      return [
        {
          type: "text",
          id: i + "tname",
          name: "set-name",
          placeholder: "set name",
          value: tagSet.name,
        },
        {
          id: i + "tval",
          name: "set-value",
          placeholder: "set value",
          value: tagSet.value,
        },
      ];
    });
    setTagSetsAmount(tagSets);
  }, [versionData]);

  const addGeneralTagsHandler = (e) => {
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
        // let modelsPrevRef;

        // if (modelType === "Checkpoint") {
        //   modelsPrevRef = doc(
        //     firestore,
        //     "users",
        //     uid,
        //     "checkpoints preview",
        //     modelId + ""
        //   );
        // } else {
        //   modelsPrevRef = doc(
        //     firestore,
        //     "users",
        //     uid,
        //     "models preview",
        //     modelId + ""
        //   );
        // }

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
      } catch (err) {
        console.log(err);
      }
    };

    getModelData();
  };

  const addtagSetHandler = () => {
    const newFields = [...tagSetsAmount];
    newFields.push([
      {
        type: "text",
        id: Date.now(),
        name: "set-name",
        placeholder: "set name",
        value: "",
      },
      {
        type: "text",
        id: `${Date.now() + "val"}`,
        name: "set-value",
        placeholder: "set value",
        value: "",
      },
    ]);
    console.log(newFields);
    setTagSetsAmount(newFields);
  };

  const tagSetsHtml = tagSetsAmount.map((tagSet) => {
    return (
      <div key={tagSet[0].id}>
        <input
          name={tagSet[0].name}
          type={tagSet[0].type}
          placeholder={tagSet[0].placeholder}
          defaultValue={tagSet[0].value}
        />
        <textarea
          name={tagSet[1].name}
          id=""
          cols="30"
          rows="5"
          placeholder={tagSet[1].placeholder}
          defaultValue={tagSet[1].value}
          // onChange={(e) => {
          //   setHelperTagsInput(e.target.value);
          // }}
        ></textarea>
      </div>
    );
  });

  return (
    <form onSubmit={addGeneralTagsHandler} className={classes["form"]}>
      <input
        name="main-tag"
        type="text"
        placeholder="main-tag"
        value={mainTagInput}
        onChange={(e) => {
          setMainTagInput(e.target.value);
        }}
      />

      <input
        name="file-name"
        type="text"
        placeholder="file name"
        value={fileNameInput}
        onChange={(e) => {
          setFileNameInput(e.target.value);
        }}
      />
      <input
        name="triger"
        type="text"
        placeholder="triger word"
        value={trigerInput}
        onChange={(e) => {
          setTrigerInput(e.target.value);
        }}
      />
      <input
        name="weight"
        type="text"
        placeholder="weight"
        value={weightInput}
        onChange={(e) => {
          setWeightInput(e.target.value);
        }}
      />
      <input
        name="size"
        type="text"
        placeholder="size"
        value={sizetInput}
        onChange={(e) => {
          setSizeInput(e.target.value);
        }}
      />
      {tagSetsHtml}
      <button type="button" onClick={addtagSetHandler}>
        Add tag set
      </button>
      <textarea
        name="helper-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="helper tags"
        value={helperTagsInput}
        onChange={(e) => {
          setHelperTagsInput(e.target.value);
        }}
      ></textarea>
      <textarea
        name="negative-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="negative tags"
        value={negativeTagsInput}
        onChange={(e) => {
          setNegativeTagsInput(e.target.value);
        }}
      ></textarea>
      <button type="submit">Add</button>
    </form>
  );
};

export default VersionForm;
