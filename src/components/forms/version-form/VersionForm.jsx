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
import FieldCategory from "../../ui/FieldCategory";

const firestore = getFirestore(firebaseApp);

const VersionForm = ({ versionData, defaultData, modelId, modelType }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [mainTagInput, setMainTagInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [trigerInput, setTrigerInput] = useState([]);
  const [fileNameInput, setFileNameInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [minWeightInput, setMinWeightInput] = useState("");
  const [maxWeightInput, setMaxWeightInput] = useState("");
  const [sizetInput, setSizeInput] = useState("");
  const [helperTagsInput, setHelperTagsInput] = useState([]);
  const [negativeTagsInput, setNegativeTagsInput] = useState([]);
  const [vaeInput, setVaeInput] = useState("");
  const [denoisingStrengthtInput, setDenoisingStrengthInput] = useState("");
  const [hiresUpscaleInput, setHiresUpscaleInput] = useState("");
  const [hiresUpscaleStepsInput, setHiresUpscaleStepsInput] = useState("");
  const [hiresUpscalerInput, setHiresUpscalerInput] = useState("");
  const [cfgScaleInput, setCfgScaleInput] = useState("");
  const [samplerInput, setSamplerInput] = useState("");
  const [stepsInput, setStepsInput] = useState("");
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
  console.log(defaultData);
  console.log(modelType);
  const uid = useSelector((state) => state.auth.user.uid);

  useEffect(() => {
    setMainTagInput(versionData?.mainTag || "");
    setTitleInput(versionData?.name || defaultData.name || "");
    setDescriptionInput(
      versionData?.description || defaultData.description || ""
    );
    setTrigerInput(
      versionData?.trainedWords?.join(", ") ||
        defaultData.trainedWords?.join(", ") ||
        []
    );
    setFileNameInput(versionData?.fileName || "");
    setWeightInput(versionData?.weight || "");
    setMinWeightInput(versionData?.minWeight || "");
    setMaxWeightInput(versionData?.maxWeight || "");
    setSizeInput(versionData?.size || "");
    setHelperTagsInput(versionData?.helperTags || []);
    setNegativeTagsInput(versionData?.negativeTags || []);
    setVaeInput(versionData?.vae || "");
    setDenoisingStrengthInput(versionData?.denoisingStrength || "");
    setHiresUpscaleInput(versionData?.hiresUpscaleBy || "");
    setHiresUpscalerInput(versionData?.hiresUpscaler || "");
    setCfgScaleInput(versionData?.cfgScale || "");
    setSamplerInput(versionData?.sampler || "");
    setStepsInput(versionData?.steps || "");
    setHiresUpscaleStepsInput(versionData?.hiresUpscaleSteps || "");
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
    const description = descriptionInput.trim();
    const weight = +formdata.get("weight").trim();
    const minWeight = +minWeightInput;
    const maxWeight = +maxWeightInput;
    const size = formdata.get("size").trim();
    const fileName = formdata.get("file-name").trim();
    const tagSetsValues = formdata.getAll("set-value");
    const sampler = formdata.get("sampler")?.trim().toLowerCase() || "";
    const cfgScale = formdata.get("cfgScale")?.trim().toLowerCase() || "";
    const hiresUpscaler =
      formdata.get("hiresUpscaler")?.trim().toLowerCase() || "";
    const hiresUpscaleBy =
      formdata.get("hiresUpscaleBy")?.trim().toLowerCase() || "";
    const hiresUpscaleSteps =
      formdata.get("hiresUpscaleSteps")?.trim().toLowerCase() || "";
    const denoisingStrength =
      formdata.get("denoisingStrength")?.trim().toLowerCase() || "";
    const vae = formdata.get("vae")?.trim().toLowerCase() || "";
    const steps = formdata.get("steps")?.trim() || "";
    const trainedWords = formdata
      .get("triger")
      .trim()
      .split(splitRegEx)
      .filter(Boolean)
      .map((tag) => tag.trim());
    const tagSetNames = formdata.getAll("set-name");
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

    try {
      const updatedVersionData = {
        ...versionData,
        mainTag,
        name: titleInput.trim(),
        description,
        trainedWords,
        fileName,
        tagSetsData,
        weight,
        minWeight,
        maxWeight,
        size,
        helperTags,
        negativeTags,
        ...(modelType === "checkpoint" && {
          steps,
          sampler,
          cfgScale,
          hiresUpscaler,
          hiresUpscaleBy,
          hiresUpscaleSteps,
          denoisingStrength,
          vae,
        }),
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
          rows="5"
          placeholder={tagSet[1].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[1].value}
        ></Textarea>
      </div>
    );
  });

  return (
    <form onSubmit={saveVersionHandler} className={classes["form"]}>
      <div className={classes.subtitle}>
        Version ID: {versionData.id || defaultData.id}
      </div>
      <Input
        label="Version name"
        name="name"
        type="text"
        placeholder="name"
        value={titleInput}
        onChange={(e) => {
          setTitleInput(e.target.value);
        }}
      />
      <Textarea
        label="Description"
        name="description"
        rows="5"
        placeholder="description"
        value={descriptionInput}
        onChange={(e) => {
          setDescriptionInput(e.target.value);
        }}
      ></Textarea>
      <div className={classes.fields}>
        <FieldCategory title="Triger words">
          <Input
            label="Activation tag"
            name="main-tag"
            type="text"
            placeholder="<activation tag:1>"
            value={mainTagInput}
            onChange={(e) => {
              setMainTagInput(e.target.value);
            }}
          />

          <Textarea
            label="Triger word"
            name="triger"
            type="text"
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
            rows="5"
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
            rows="5"
            placeholder="Negative words"
            value={negativeTagsInput}
            onChange={(e) => {
              setNegativeTagsInput(e.target.value);
            }}
          ></Textarea>
        </FieldCategory>
        <FieldCategory title="Info">
          <Input
            label="File name"
            name="file-name"
            type="text"
            placeholder="File name"
            value={fileNameInput}
            onChange={(e) => {
              setFileNameInput(e.target.value);
            }}
          />
          <div>
            <span className={classes["weight__label"]}>Strength (weight)</span>
            <div className={classes.weight}>
              <Input
                name="minWeight"
                type="number"
                input={{ step: "0.1" }}
                placeholder="Min"
                value={minWeightInput}
                onChange={(e) => {
                  setMinWeightInput(e.target.value);
                }}
              />
              –
              <Input
                name="maxWeight"
                type="number"
                input={{ step: "0.1" }}
                placeholder="Max"
                value={maxWeightInput}
                onChange={(e) => {
                  setMaxWeightInput(e.target.value);
                }}
              />
              <Input
                name="weight"
                type="number"
                input={{ step: "0.1" }}
                placeholder="Recomended"
                value={weightInput}
                onChange={(e) => {
                  setWeightInput(e.target.value);
                }}
              />
            </div>
          </div>
          <Input
            label="Image resolution"
            name="size"
            type="text"
            placeholder="Image resolution"
            value={sizetInput}
            onChange={(e) => {
              setSizeInput(e.target.value);
            }}
          />
          {modelType === "checkpoint" && (
            <>
              <Input
                label="Sampling method"
                name="sampler"
                type="text"
                placeholder="Sampling method"
                value={samplerInput}
                onChange={(e) => {
                  setSamplerInput(e.target.value);
                }}
              />
              <Input
                label="Sampling steps"
                name="steps"
                type="text"
                placeholder="Sampling steps"
                value={stepsInput}
                onChange={(e) => {
                  setStepsInput(e.target.value);
                }}
              />

              <Input
                label="CFG Scale"
                name="cfgScale"
                type="text"
                placeholder="CFG Scale"
                value={cfgScaleInput}
                onChange={(e) => {
                  setCfgScaleInput(e.target.value);
                }}
              />
              <Input
                label="Upscaler"
                name="hiresUpscaler"
                type="text"
                placeholder="Upscaler"
                value={hiresUpscalerInput}
                onChange={(e) => {
                  setHiresUpscalerInput(e.target.value);
                }}
              />
              <Input
                label="Upscale by"
                name="hiresUpscaleBy"
                type="text"
                placeholder="Upscale by"
                value={hiresUpscaleInput}
                onChange={(e) => {
                  setHiresUpscaleInput(e.target.value);
                }}
              />
              <Input
                label="Hires steps"
                name="hiresUpscaleSteps"
                type="text"
                placeholder="Hires steps"
                value={hiresUpscaleStepsInput}
                onChange={(e) => {
                  setHiresUpscaleStepsInput(e.target.value);
                }}
              />
              <Input
                label="Denoising strength"
                name="denoisingStrength"
                type="text"
                placeholder="Denoising strength"
                value={denoisingStrengthtInput}
                onChange={(e) => {
                  setDenoisingStrengthInput(e.target.value);
                }}
              />
              <Input
                label="VAE"
                name="vae"
                type="text"
                placeholder="VAE"
                value={vaeInput}
                onChange={(e) => {
                  setVaeInput(e.target.value);
                }}
              />
            </>
          )}
        </FieldCategory>
      </div>
      <Buttton type="submit" disabled={isSaving}>
        Save
      </Buttton>
      {errorMessage && <div>{errorMessage}</div>}
      {successMessage && <div>{successMessage}</div>}
    </form>
  );
};

export default VersionForm;
