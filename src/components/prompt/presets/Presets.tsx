import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import Button from "../../ui/buttons/Button";
import classes from "./Presets.module.scss";
import { updatePresets } from "../../../store/prompt";
import PresetForm from "../../forms/preset-form/PresetForm";
import DeleteRequest from "../../ui/DeleteRequest";
import PresetsList from "./presets-list/PresetsList";
import PresetsBlock from "./presets-block/PresetsBlock";
import NotificationMessage from "../../ui/NotificationMessage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { PromptType } from "../../../types/prompt.types";
import type { Preset } from "../../../../shared/types/user";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

type PresetsProps = { onClose: () => void };

type PresetData = Preset & { type: PromptType };

/**
 * Presets popup.
 *
 * Displays user-defined trigger word presets and allows
 * creating, editing, applying, and deleting them.
 *
 * Responsibilities:
 * - Displays positive and negative presets.
 * - Opens the preset creation/edit form.
 * - Applies a preset to the current prompt.
 * - Handles preset deletion with confirmation.
 *
 * Side effects:
 * - Mutates presets in Redux.
 * - Adds preset tags to the active prompt.
 *
 * @component
 *
 * @param props
 * @param props.onClose - Callback triggered to close the presets modal.
 *
 * @returns Presets popup.
 */
const Presets = ({ onClose }: PresetsProps) => {
  const [formIsOpen, setFormIsOpen] = useState(false);
  const [presetData, setPresetData] = useState<PresetData | null>(null);
  const [presetToDel, setPresetToDel] = useState<PresetData | null>(null);
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const presets = useAppSelector((state) => state.prompt.presets);
  const dispatch = useAppDispatch();

  const deleteHandler = () => {
    if (!presetToDel) return;

    const updatedPresets = presets[presetToDel?.type].filter(
      (preset) => preset.id !== presetToDel.id,
    );

    dispatch(updatePresets(presetToDel?.type, updatedPresets));
    setDeleteRequestIsOpen(false);
  };

  const changePresetHandler = (type: PromptType, preset: Preset) => {
    setPresetData({
      type,
      ...preset,
    });
    setFormIsOpen(true);
  };

  const openDeleteReqeustHandler = (type: PromptType, preset: Preset) => {
    setPresetToDel({
      type,
      ...preset,
    });
    setDeleteRequestIsOpen(true);
  };

  const closeDeleteReqeustHandler = () => {
    setPresetToDel(null);
    setDeleteRequestIsOpen(false);
  };

  return (
    <>
      {!formIsOpen && (
        <>
          <Button
            className={classes["btn-from"]}
            onClick={() => {
              setPresetData(null);
              setFormIsOpen((prevState) => !prevState);
            }}
          >
            Add preset
          </Button>
          <div className={classes["presets-container"]}>
            {!presets?.positive?.length && !presets?.negative?.length && (
              <NotificationMessage type="notification">
                <p>
                  You don't have any presets. <br /> Press "Add preset" to add
                  new preset!
                </p>
              </NotificationMessage>
            )}
            {!!presets?.positive?.length && (
              <PresetsBlock title="Positive">
                <PresetsList
                  type="positive"
                  presets={presets?.positive}
                  onEdit={changePresetHandler}
                  onClose={onClose}
                  onDelete={openDeleteReqeustHandler}
                />
              </PresetsBlock>
            )}
            {!!presets?.negative?.length && (
              <PresetsBlock title="Negative">
                <PresetsList
                  type="negative"
                  presets={presets?.negative}
                  onEdit={changePresetHandler}
                  onClose={onClose}
                  onDelete={openDeleteReqeustHandler}
                />
              </PresetsBlock>
            )}
          </div>
        </>
      )}
      {formIsOpen && (
        <>
          <button
            title="Back"
            className={classes["btn-back"]}
            onClick={() => {
              setFormIsOpen(false);
            }}
          >
            <ArrowUturnLeftIcon />
          </button>
          <PresetForm
            type={presetData?.type}
            id={presetData?.id}
            name={presetData?.name}
            words={presetData?.words}
            onClose={() => {
              setFormIsOpen(false);
              setPresetData(null);
            }}
          />
        </>
      )}
      <AnimatePresence>
        {deleteRequestIsOpen && presetToDel && (
          <DeleteRequest
            message={`Are you sure you want to delete "${presetToDel.name}" preset? This action can't
        be undone`}
            onSubmit={deleteHandler}
            onClose={closeDeleteReqeustHandler}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Presets;
