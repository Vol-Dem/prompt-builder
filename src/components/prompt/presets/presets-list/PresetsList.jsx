import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import {
  ANIMATIONS_FM_FADEOUT_EXIT,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../../../variables/constants";
import ButtonTertiary from "../../../ui/buttons/ButtonTertiary";
import classes from "./PresetsList.module.scss";
import { promptActions } from "../../../../store/prompt";
import { splitTags } from "../../../../utils/promptUtils";

/**
 * Presets list.
 *
 * Displays a list of presets with controls to apply,
 * edit, or delete each preset.
 *
 * Responsibilities:
 * - Renders preset items.
 * - Applies preset tags to the prompt on click.
 * - Triggers preset edit and delete actions.
 * - Closes the modal after applying a preset.
 *
 * @component
 *
 * @param {Object} props
 * @param {Array} props.presets - List of user presets.
 * @param {'positive' | 'negative'} props.type - Prompt channel this list controls.
 * @param {() => void} props.onClose - Callback triggered to close presets modal.
 * @param {(data: { type: string, id: string }) => void} props.onEdit - Callback triggered to open the preset form.
 * @param {(data: { type: string, id: string }) => void} props.onDelete - Callback triggered to open delete confirmation.
 *
 * @returns {JSX.Element} Presets list.
 */
const PresetsList = ({ presets, type, onClose, onEdit, onDelete }) => {
  const dispatch = useDispatch();

  const applyPreset = (id) => {
    const words = presets.find((preset) => preset.id === id).words;
    dispatch(
      promptActions.addAllTagsToPrompt({
        type: type,
        value: splitTags(words),
      }),
    );
    onClose();
  };

  const presetsHtml = presets?.map((preset) => {
    return (
      <motion.li
        key={preset.id}
        layout
        initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        animate={ANIMATIONS_FM_SLIDEIN}
        exit={ANIMATIONS_FM_FADEOUT_EXIT}
        className={classes.preset}
      >
        <span
          className={classes["preset__name"]}
          onClick={() => applyPreset(preset.id)}
        >
          {preset.name}
        </span>
        <div className={classes["preset__btns-container"]}>
          <ButtonTertiary onClick={() => onEdit({ type, id: preset.id })}>
            Change
          </ButtonTertiary>
          <ButtonTertiary
            className={classes["btn-del"]}
            onClick={() => onDelete({ type, id: preset.id })}
          >
            Delete
          </ButtonTertiary>
        </div>
      </motion.li>
    );
  });

  return (
    <motion.ul
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
      className={classes.presets}
    >
      <AnimatePresence>{presetsHtml}</AnimatePresence>
    </motion.ul>
  );
};

export default PresetsList;
