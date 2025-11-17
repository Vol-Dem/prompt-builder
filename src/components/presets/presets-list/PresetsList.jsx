import { useDispatch } from "react-redux";
import {
  ANIMATIONS_FM_FADEOUT_EXIT,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../../variables/constants";
import ButtonTertiary from "../../ui/ButtonTertiary";
import classes from "./PresetsList.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import { promptActions } from "../../../store/prompt";
import { splitTags } from "../../../utils/promptUtils";

const PresetsList = ({ presets, type, onClose, onEdit, onDelete }) => {
  const dispatch = useDispatch();

  const applyPreset = (id) => {
    const words = presets.find((preset) => preset.id === id).words;
    dispatch(
      promptActions.addAllTagsToPrompt({
        type: type,
        value: splitTags(words),
      })
    );
    onClose();
  };

  const positivePresetsHtml = presets?.map((preset, i) => {
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
      <AnimatePresence>{positivePresetsHtml}</AnimatePresence>
    </motion.ul>
  );
};

export default PresetsList;
