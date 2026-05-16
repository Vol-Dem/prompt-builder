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
import type { PromptType } from "../../../../types/prompt.types";
import type { Preset } from "../../../../../shared/types/user";
import { useAppDispatch } from "../../../../store/hooks/hooks";

type PresetsListProps = {
  presets: Preset[];
  type: PromptType;
  onClose: () => void;
  onEdit: (type: PromptType, preset: Preset) => void;
  onDelete: (type: PromptType, preset: Preset) => void;
};

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
 * @param props
 * @param props.presets - List of user presets.
 * @param props.type - Prompt channel this list controls.
 * @param props.onClose - Callback triggered to close presets modal.
 * @param props.onEdit - Callback triggered to open the preset form.
 * @param props.onDelete - Callback triggered to open delete confirmation.
 *
 * @returns Presets list.
 */
const PresetsList = ({
  presets,
  type,
  onClose,
  onEdit,
  onDelete,
}: PresetsListProps) => {
  const dispatch = useAppDispatch();

  const applyPreset = (id: string) => {
    const words = presets.find((preset) => preset.id === id)?.words;

    if (!words) return;

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
          <ButtonTertiary onClick={() => onEdit(type, preset)}>
            Change
          </ButtonTertiary>
          <ButtonTertiary
            className={classes["btn-del"]}
            onClick={() => onDelete(type, preset)}
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
