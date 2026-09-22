import { AnimatePresence, motion } from "framer-motion";

import classes from "./TagSetsInputFieldset.module.scss";
import Textarea from "./Textarea";
import Input from "./Input";
import ButtonSecondary from "../buttons/ButtonSecondary";
import Fieldset from "./Fieldset";
import ButtonTertiary from "../buttons/ButtonTertiary";
import {
  VALIDATION_NAME_MAX_LENGTH,
  VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_FADEOUT_EXIT,
} from "../../../variables/constants";
import type { TagSetInputsController } from "../../../hooks/use-tag-set-inputs";
import { XMarkIcon } from "@heroicons/react/24/outline";

type TagSetsInputFieldsetProps = {
  tagSets: TagSetInputsController;
  showErrorMessage: boolean;
  isSaving: boolean;
};

/**
 * Dynamic fieldset for managing multiple tag sets.
 *
 * Allows adding, editing and removing tag name/value pairs.
 *
 * @param props
 * @param props.tagSets - Current fields and editing actions.
 * @param props.showErrorMessage - Forces validation messages.
 * @param props.isSaving - Disables controls while saving.
 * @returns Rendered tag sets fieldset.
 */
const TagSetsInputFieldset = ({
  tagSets,
  showErrorMessage,
  isSaving,
}: TagSetsInputFieldsetProps) => {
  const tagSetsHtml = tagSets.fields.map((tagSet, i) => {
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
            onClick={() => tagSets.remove(i)}
          >
            <XMarkIcon />
          </ButtonTertiary>
        </div>
        <Input
          id={tagSet[0].id}
          name={tagSet[0].name}
          type={tagSet[0].type}
          placeholder={tagSet[0].placeholder}
          onChange={tagSets.change}
          value={tagSet[0].value}
          showError={showErrorMessage}
          validation={{
            maxLength: VALIDATION_NAME_MAX_LENGTH,
          }}
        />
        <Textarea
          id={tagSet[1].id}
          name={tagSet[1].name}
          rows={4}
          placeholder={tagSet[1].placeholder}
          onChange={tagSets.change}
          value={tagSet[1].value}
          showError={showErrorMessage}
          validation={{
            maxLength: VALIDATION_TRIGGER_WORDS_MAX_LENGTH,
          }}
        ></Textarea>
      </motion.div>
    );
  });

  return (
    <Fieldset legend="Tag sets" className={classes.fieldset}>
      <AnimatePresence>{tagSetsHtml}</AnimatePresence>
      <ButtonSecondary
        type="button"
        onClick={tagSets.add}
        disabled={isSaving}
        className={classes["btn-secondary"]}
      >
        + add new set
      </ButtonSecondary>
    </Fieldset>
  );
};

export default TagSetsInputFieldset;
