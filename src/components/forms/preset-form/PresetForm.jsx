import { useEffect, useState } from "react";
import classes from "./PresetForm.module.scss";
import { updatePresets } from "../../../store/prompt";
import { useDispatch, useSelector } from "react-redux";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import Buttton from "../../ui/Button";
import Input from "../../ui/Input";
import Fieldset from "../../ui/Fieldset";
import ErrorMessage from "../../ui/ErrorMessage";
import { useValidation } from "../../../hooks/use-validation";
import {
  CATEGORY_NAME_MAX_LENGTH,
  DEF_INPUT_ERROR_MESSAGE,
  NAME_MAX_LENGTH,
  OFFLINE_ERROR_MESSAGE,
  TRIGER_WORDS_MAX_LENGTH,
  UNIQUE_ERROR_MESSAGE,
} from "../../../variables/constants";
import { useOnlineStatus } from "../../../hooks/use-online-status";

const promptTypes = [
  { name: "Positive", value: "positive" },
  { name: "Negative", value: "negative" },
];

// let initial = true;

const PresetForm = ({ type, id, name, words, onClose }) => {
  const [promptType, setPromptType] = useState(type || "positive");
  const [presetName, setPresetName] = useState({
    value: name || "",
    isValid: name ? true : false,
  });
  const [presetWords, setPresetWords] = useState({
    value: words || "",
    isValid: words ? true : false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const presets = useSelector((state) => state.prompt.presets);
  const dispatch = useDispatch();

  // const [nameState, validateName] = useValidation({
  //   required: true,
  //   maxLength: CATEGORY_NAME_MAX_LENGTH,
  // });
  // const { isValid: nameIsValid, errorMessage: nameErrorMessage } = nameState;

  // const [trigerWordsState, validateTrigerWords] = useValidation({
  //   required: true,
  //   maxLength: TRIGER_WORDS_MAX_LENGTH,
  // });
  // const { isValid: trigerWordsIsValid, errorMessage: trigerWordsErrorMessage } =
  //   trigerWordsState;

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
    try {
      e.preventDefault();
      // validateName(presetName);
      // validateTrigerWords(presetWords);
      setErrorMessage("");
      setShowErrorMessage(true);
      const curPresets = presets[promptType] || [];
      let updatedPresets;
      const nameExists = curPresets?.find(
        (preset) => preset.name === presetName.value
      );
      // console.log(presetName, name);
      if (nameExists && presetName.value !== name) {
        // setErrorMessage("Name must be unique");
        // return;
        throw new Error(UNIQUE_ERROR_MESSAGE);
      }

      if (!presetName.isValid || !presetWords.isValid) {
        throw new Error(DEF_INPUT_ERROR_MESSAGE);
      }

      if (!navigator?.onLine) {
        throw new Error(OFFLINE_ERROR_MESSAGE);
      }

      if (!id) {
        updatedPresets = [
          ...curPresets,
          {
            //   id: presetName.split(' ').join('-'),
            id: createPresetId(presetName.value, curPresets),
            name: presetName.value,
            words: presetWords.value,
          },
        ];
      } else {
        updatedPresets = curPresets?.map((preset) => {
          if (preset.id === id) {
            return {
              id: id,
              name: presetName.value,
              words: presetWords.value,
            };
          }
          return preset;
        });
      }

      // console.log(presetName.value, presetWords.value);
      dispatch(updatePresets(promptType, updatedPresets));
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  let typeSelectOption = promptTypes.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  // useEffect(() => {
  //   validateName(presetName);
  //   validateTrigerWords(presetWords);
  // }, [presetName, presetWords]);

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
          value={presetName.value}
          onChange={(e, isValid) => {
            // validateName(e.target.value);
            setPresetName({ value: e.target.value, isValid });
          }}
          validation={{
            required: true,
            maxLength: NAME_MAX_LENGTH,
          }}
          showError={showErrorMessage}
          // error={showErrorMessage ? nameErrorMessage : ""}
        />
        <Textarea
          placeholder="Trigger words"
          value={presetWords.value}
          onChange={(e, isValid) => {
            // validateTrigerWords(e.target.value);
            setPresetWords({ value: e.target.value, isValid });
          }}
          // error={showErrorMessage ? trigerWordsErrorMessage : ""}
          validation={{
            required: true,
            maxLength: TRIGER_WORDS_MAX_LENGTH,
          }}
          showError={showErrorMessage}
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
