import { useState } from "react";
import Buttton from "../ui/Button";
import Modal from "../ui/Modal";
import classes from "./Presets.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions, updatePresets } from "../../store/prompt";
import { splitTags } from "../../utils/generalUtils";
import ButtonTertiary from "../ui/ButtonTertiary";
import PresetForm from "../forms/preset-form/PresetForm";
import DeleteRequest from "../ui/DeleteRequest";

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

  const aplyPreset = (e) => {
    const type = e.target.closest(`.${classes.preset}`).dataset.type;
    const id = e.target.closest(`.${classes.preset}`).dataset.id;
    const words = presets[type].find((preset) => preset.id === id).words;
    dispatch(
      promptActions.addAllTagsToPrompt({
        type: type,
        value: splitTags(words),
      })
    );
    onClose();
  };

  const chagePresetHandler = (e) => {
    const type = e.target.closest(`.${classes.preset}`).dataset.type;
    const id = e.target.closest(`.${classes.preset}`).dataset.id;
    const curPreset = presets[type].find((preset) => preset.id === id);
    setPresetData({
      type,
      id: curPreset.id,
      name: curPreset.name,
      words: curPreset.words,
    });
    setFormIsOpen(true);
  };

  const openDeleteReqeustHandler = (e) => {
    e.preventDefault();
    const type = e.target.closest(`.${classes.preset}`).dataset.type;
    const id = e.target.closest(`.${classes.preset}`).dataset.id;
    const presetName = presets[type].find((preset) => preset.id === id).name;

    setPresetToDel({ id, type, name: presetName });
    setDeleteRequestIsOpen(true);
  };
  const closeDeleteReqeustHandler = () => {
    setPresetToDel({});
    setDeleteRequestIsOpen(false);
  };

  const positivePresetsHtml = presets?.positive?.map((preset, i) => {
    return (
      <li
        key={i}
        className={classes.preset}
        data-id={preset.id}
        data-type="positive"
      >
        <span className={classes["preset__name"]} onClick={aplyPreset}>
          {preset.name}
        </span>
        <div className={classes["preset__btns-container"]}>
          <ButtonTertiary onClick={chagePresetHandler}>Change</ButtonTertiary>
          <ButtonTertiary
            className={classes["btn-del"]}
            onClick={openDeleteReqeustHandler}
          >
            Delete
          </ButtonTertiary>
        </div>
      </li>
    );
  });

  const negativePresetsHtml = presets?.negative?.map((preset, i) => {
    return (
      <li
        key={i}
        className={classes.preset}
        data-id={preset.id}
        data-type="negative"
      >
        <span className={classes["preset__name"]} onClick={aplyPreset}>
          {preset.name}
        </span>
        <div className={classes["preset__btns-container"]}>
          <ButtonTertiary onClick={chagePresetHandler}>Change</ButtonTertiary>
          <ButtonTertiary
            className={classes["btn-del"]}
            onClick={openDeleteReqeustHandler}
          >
            Delete
          </ButtonTertiary>
        </div>
      </li>
    );
  });

  return (
    <Modal title="Presets" onClose={onClose}>
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
        {!!presets?.positive?.length && (
          <div>
            <div className={classes[`presets__name`]}>Positive:</div>
            <div className={classes[`presets__bg`]}>
              <ul className={classes.presets}>{positivePresetsHtml}</ul>
            </div>
          </div>
        )}
        {!!presets?.negative?.length && (
          <div>
            <div className={classes[`presets__name`]}>Negative:</div>
            <div className={classes[`presets__bg`]}>
              <ul className={classes.presets}>{negativePresetsHtml}</ul>
            </div>
          </div>
        )}
      </div>

      {formIsOpen && (
        <Modal
          onClose={() => {
            setFormIsOpen(false);
            setPresetData({});
          }}
        >
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
        </Modal>
      )}
      {deleteRequestIsOpen && (
        <DeleteRequest
          message={`Are you sure you want to delete "${presetToDel.name}" preset? This action can't
        be undone`}
          onSubmit={deleteHandler}
          onClose={closeDeleteReqeustHandler}
        />
      )}
    </Modal>
  );
};

export default Presets;
