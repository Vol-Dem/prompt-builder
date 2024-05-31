import { useState } from "react";
import classes from "./PresetForm.module.scss";
import { updatePresets } from "../../../store/prompt";
import { useDispatch, useSelector } from "react-redux";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import Buttton from "../../ui/Button";
import Input from "../../ui/Input";
import Fieldset from "../../ui/Fieldset";
import ErrorMessage from "../../ui/ErrorMessage";

const promptTypes = [
  { name: "Positive", value: "positive" },
  { name: "Negative", value: "negative" },
];

const PresetForm = ({ type, id, name, words, onClose }) => {
  const [promptType, setPromptType] = useState(type || "positive");
  const [presetName, setPresetName] = useState(name || "");
  const [presetWords, setPresetWords] = useState(words || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const presets = useSelector((state) => state.prompt.presets);
  const dispatch = useDispatch();

  const createPresetId = (id, presetsData) => {
    if (!id) {
      return;
    }
    let curId = id;
    let mainIdExists;

    //Check if category id is exists
    mainIdExists = presetsData?.find((preset) => preset.id === curId);

    while (mainIdExists) {
      const idArr = curId.split("-");
      const lastNubmer = parseInt(idArr.slice(-1));

      curId = lastNubmer
        ? `${idArr.slice(0, -1).join("-")}-${lastNubmer + 1}`
        : `${curId}-2`;

      mainIdExists = presetsData.find((preset) => preset.id === curId);
    }

    return curId;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const curPresets = presets[promptType] || [];
    let updatedPresets;
    const nameExists = curPresets?.find((preset) => preset.name === presetName);

    if (nameExists) {
      setErrorMessage("Name must be unique");
      return;
    }

    if (!id) {
      updatedPresets = [
        ...curPresets,
        {
          //   id: presetName.split(' ').join('-'),
          id: createPresetId(presetName, curPresets),
          name: presetName,
          words: presetWords,
        },
      ];
    } else {
      updatedPresets = curPresets?.map((preset) => {
        if (preset.id === id) {
          return {
            id: id,
            name: presetName,
            words: presetWords,
          };
        }
        return preset;
      });
    }

    console.log(presetName, presetWords);
    dispatch(updatePresets(promptType, updatedPresets));
    onClose();
  };

  let typeSelectOption = promptTypes.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  return (
    <form onSubmit={submitHandler}>
      <Select
        label="Type"
        name="type"
        // id={id}
        selected={promptType}
        onChange={(value) => {
          setPromptType(value);
        }}
        options={typeSelectOption}
      />
      <Fieldset legend="Preset">
        <Input
          placeholder="Name"
          value={presetName}
          onChange={(e) => {
            setPresetName(e.target.value);
          }}
        />
        <Textarea
          placeholder="Triger words"
          value={presetWords}
          onChange={(e) => {
            setPresetWords(e.target.value);
          }}
        />
      </Fieldset>
      <Buttton className={classes["btn-submit"]} type="submit">
        Save
      </Buttton>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </form>
  );
};

export default PresetForm;
