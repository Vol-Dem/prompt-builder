import { useState } from "react";
import classes from "./PresetForm.module.scss";
import { updatePresets } from "../../../store/prompt";
import { useDispatch, useSelector } from "react-redux";
import Textarea from "../../ui/Textarea";
import Buttton from "../../ui/Button";
import Input from "../../ui/Input";
import Fieldset from "../../ui/Fieldset";
import ErrorMessage from "../../ui/ErrorMessage";
import {
  ERROR_MESSAGE_INPUT_DEF,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  VALIDATION_NAME_MAX_LENGTH,
  ERROR_MESSAGE_OFFLINE,
  VALIDATION_TRIGER_WORDS_MAX_LENGTH,
} from "../../../variables/constants";
import { motion } from "framer-motion";
import { handleErrors, throwCustomError } from "../../../utils/generalUtils";

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
    try {
      e.preventDefault();
      setErrorMessage("");
      setShowErrorMessage(true);
      const curPresets = presets[promptType] || [];
      let updatedPresets;
      const nameExists = curPresets?.find(
        (preset) => preset.name === presetName.value
      );

      if (nameExists && presetName.value !== name) {
        throwCustomError(`The "${presetName.value}" preset already exists`);
      }

      if (!presetName.isValid || !presetWords.isValid) {
        throwCustomError(ERROR_MESSAGE_INPUT_DEF);
      }

      if (!navigator?.onLine) {
        throwCustomError(ERROR_MESSAGE_OFFLINE);
      }

      if (!id) {
        updatedPresets = [
          ...curPresets,
          {
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

      dispatch(updatePresets(promptType, updatedPresets));
      onClose();
    } catch (err) {
      setErrorMessage(handleErrors(err));
    }
  };

  return (
    <motion.form
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      className={classes["form"]}
      onSubmit={submitHandler}
    >
      <fieldset className={classes["types"]}>
        <div className={classes["type"]}>
          <input
            type="radio"
            id="positive"
            name="type"
            value="positive"
            checked={promptType === "positive" ? true : false}
            onChange={(e) => {
              setPromptType(e.target.value);
            }}
          />
          <label htmlFor="positive" className={classes["type-label"]}>
            Positive
          </label>
        </div>

        <div className={classes["type"]}>
          <input
            type="radio"
            id="negative"
            name="type"
            value="negative"
            checked={promptType === "negative" ? true : false}
            onChange={(e) => {
              setPromptType(e.target.value);
            }}
          />
          <label htmlFor="negative" className={classes["type-label"]}>
            Negative
          </label>
        </div>
      </fieldset>
      <Fieldset legend="Preset">
        <Input
          id="preset-name"
          placeholder="Name"
          value={presetName.value}
          onChange={(e, isValid) => {
            setPresetName({ value: e.target.value, isValid });
          }}
          validation={{
            required: true,
            maxLength: VALIDATION_NAME_MAX_LENGTH,
          }}
          showError={showErrorMessage}
        />
        <Textarea
          id="preset-words"
          placeholder="Trigger words"
          value={presetWords.value}
          onChange={(e, isValid) => {
            setPresetWords({ value: e.target.value, isValid });
          }}
          validation={{
            required: true,
            maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
          }}
          showError={showErrorMessage}
        />
      </Fieldset>
      <Buttton className={classes["btn-submit"]} type="submit">
        Save
      </Buttton>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </motion.form>
  );
};

export default PresetForm;
