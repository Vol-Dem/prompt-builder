import { useState } from "react";
import Buttton from "../ui/Button";
import classes from "./Presets.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { updatePresets } from "../../store/prompt";
import PresetForm from "../forms/preset-form/PresetForm";
import DeleteRequest from "../ui/DeleteRequest";
import { AnimatePresence } from "framer-motion";
import BackSvg from "../../assets/BackSvg";
import PresetsList from "./presets-list/PresetsList";
import PresetsBlock from "./presets-block/PresetsBlock";
import NotificationMessage from "../ui/NotificationMessage";

const Presets = ({ onClose }) => {
  const [formIsOpen, setFormIsOpen] = useState(false);
  const [presetData, setPresetData] = useState({});
  const [presetToDel, setPresetToDel] = useState({});
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const presets = useSelector((state) => state.prompt.presets);
  const dispatch = useDispatch();

  const deleteHandler = () => {
    const updatedPresets = presets[presetToDel?.type].filter(
      (preset) => preset.id !== presetToDel.id
    );

    dispatch(updatePresets(presetToDel?.type, updatedPresets));
    setDeleteRequestIsOpen(false);
  };

  const chagePresetHandler = ({ type, id }) => {
    const curPreset = presets[type].find((preset) => preset.id === id);
    setPresetData({
      type,
      id: curPreset.id,
      name: curPreset.name,
      words: curPreset.words,
    });
    setFormIsOpen(true);
  };

  const openDeleteReqeustHandler = ({ type, id }) => {
    const presetName = presets[type].find((preset) => preset.id === id).name;

    setPresetToDel({ id, type, name: presetName });
    setDeleteRequestIsOpen(true);
  };

  const closeDeleteReqeustHandler = () => {
    setPresetToDel({});
    setDeleteRequestIsOpen(false);
  };

  return (
    <>
      {!formIsOpen && (
        <>
          <Buttton
            className={classes["btn-from"]}
            onClick={() => {
              setPresetData({});
              setFormIsOpen((prevState) => !prevState);
            }}
          >
            Add preset
          </Buttton>
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
                  onEdit={chagePresetHandler}
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
                  onEdit={chagePresetHandler}
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
            className={classes["btn-back"]}
            onClick={() => {
              setFormIsOpen(false);
            }}
          >
            <BackSvg />
          </button>
          <PresetForm
            type={presetData?.type}
            id={presetData?.id}
            name={presetData?.name}
            words={presetData?.words}
            onClose={() => {
              setFormIsOpen(false);
              setPresetData({});
            }}
          />
        </>
      )}
      <AnimatePresence>
        {deleteRequestIsOpen && (
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
