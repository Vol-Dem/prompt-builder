import { AnimatePresence, motion } from "framer-motion";

import classes from "./TagSetsInputFieldset.module.scss";
import Textarea from "./Textarea";
import Input from "./Input";
import ButttonSecondary from "../buttons/ButtonSecondary";
import Fieldset from "./Fieldset";
import FieldCategory from "./FieldCategory";
import ButtonTertiary from "../buttons/ButtonTertiary";
import CrossSvg from "../../../assets/CrossSvg";
import {
  VALIDATION_NAME_MAX_LENGTH,
  VALIDATION_TRIGER_WORDS_MAX_LENGTH,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_FADEOUT_EXIT,
} from "../../../variables/constants";

/**
 * Dynamic fieldset for managing multiple tag sets.
 *
 * Allows adding, editing and removing tag name/value pairs.
 *
 * @param {Array<Array<object>>} tagSetsInputs - Current tag set fields.
 * @param {function} setTagSetsInputs - State setter for tag sets.
 * @param {boolean} showErrorMessage - Forces validation messages.
 * @param {boolean} isSaving - Disables controls while saving.
 * @returns {JSX.Element} Rendered tag sets fieldset.
 */
const TagSetsInputFieldset = ({
  tagSetsInputs,
  setTagSetsInputs,
  showErrorMessage,
  isSaving,
}) => {
  const addtagSetHandler = () => {
    const newFields = [...tagSetsInputs];
    newFields.push([
      {
        type: "text",
        id: `set-name-${Date.now()}`,
        name: "set-name",
        placeholder: "Set name",
        value: "",
        isValid: true,
        errorMessage: "",
      },
      {
        type: "text",
        id: `set-value-${Date.now()}`,
        name: "set-value",
        placeholder: "Triger words",
        value: "",
        isValid: true,
        errorMessage: "",
      },
    ]);

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

      if (curSetNameIndex !== -1) {
        newState[curSetNameIndex][0] = {
          ...newState[curSetNameIndex][0],
          value: e.target.value,
          isValid: isValid,
        };
      }

      if (curSetTagsIndex !== -1) {
        newState[curSetTagsIndex][1] = {
          ...newState[curSetTagsIndex][1],
          value: e.target.value,
          isValid: isValid,
        };
      }

      return newState;
    });
  };

  const deleteTagsetInputHandler = (index) => {
    setTagSetsInputs((prevState) => {
      return prevState.toSpliced(index, 1);
    });
  };

  const tagSetsHtml = tagSetsInputs.map((tagSet, i) => {
    return (
      <motion.div
        key={tagSet[0].id}
        layout
        initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        animate={ANIMATIONS_FM_SLIDEIN}
        exit={ANIMATIONS_FM_FADEOUT_EXIT}
        className={classes["tagset"]}
      >
        <div className={classes["tagset__header"]}>
          <span className={classes["tagset__title"]}>{`Tagset ${i + 1}`}</span>{" "}
          <ButtonTertiary
            type="button"
            title="Delete tag set"
            className={classes["input__btn-del"]}
            onClick={deleteTagsetInputHandler.bind(null, i)}
          >
            <CrossSvg />
          </ButtonTertiary>
        </div>
        <Input
          id={tagSet[0].id}
          name={tagSet[0].name}
          type={tagSet[0].type}
          placeholder={tagSet[0].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[0].value}
          showError={showErrorMessage}
          validation={{
            maxLength: VALIDATION_NAME_MAX_LENGTH,
          }}
        />
        <Textarea
          id={tagSet[1].id}
          name={tagSet[1].name}
          rows="4"
          placeholder={tagSet[1].placeholder}
          onChange={tagSetsHandler}
          value={tagSet[1].value}
          showError={showErrorMessage}
          validation={{
            maxLength: VALIDATION_TRIGER_WORDS_MAX_LENGTH,
          }}
        ></Textarea>
      </motion.div>
    );
  });

  return (
    <FieldCategory>
      <Fieldset legend="Tag sets" className={classes.fieldset}>
        <AnimatePresence>{tagSetsHtml}</AnimatePresence>
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
  );
};

export default TagSetsInputFieldset;
