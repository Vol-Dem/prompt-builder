import { useState } from "react";
import Buttton from "../ui/Button";
import classes from "./Presets.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions, updatePresets } from "../../store/prompt";
import { splitTags } from "../../utils/generalUtils";
import ButtonTertiary from "../ui/ButtonTertiary";
import PresetForm from "../forms/preset-form/PresetForm";
import DeleteRequest from "../ui/DeleteRequest";
import { AnimatePresence } from "framer-motion";
import BackSvg from "../../assets/BackSvg";
import ExclamationCircleSvg from "../../assets/ExclamationCircleSvg";
import { motion } from "framer-motion";
import {
  ANIMATIONS_FM_FADEOUT_EXIT,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../variables/constants";

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
      <motion.li
        key={preset.id}
        layout
        initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        animate={ANIMATIONS_FM_SLIDEIN}
        exit={ANIMATIONS_FM_FADEOUT_EXIT}
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
      </motion.li>
    );
  });

  const negativePresetsHtml = presets?.negative?.map((preset, i) => {
    return (
      <motion.li
        key={preset.id}
        layout
        initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        animate={ANIMATIONS_FM_SLIDEIN}
        exit={ANIMATIONS_FM_FADEOUT_EXIT}
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
      </motion.li>
    );
  });

  return (
    <>
      {formIsOpen && (
        <button
          className={classes["btn-back"]}
          onClick={() => {
            setFormIsOpen(false);
          }}
        >
          <BackSvg />
        </button>
      )}
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
              <div className={classes[`presets__bg`]}>
                <div className={classes["notification"]}>
                  <ExclamationCircleSvg
                    className={classes["notification__svg"]}
                  />
                  <p className={classes["notification__text"]}>
                    You don't have any presets. <br /> Press "Add preset" to add
                    new preset!
                  </p>
                </div>
              </div>
            )}
            {!!presets?.positive?.length && (
              <div>
                <div className={classes[`presets__name`]}>Positive:</div>
                <div className={classes[`presets__bg`]}>
                  <motion.ul
                    // layout
                    initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
                    animate={ANIMATIONS_FM_SLIDEIN}
                    exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
                    className={classes.presets}
                  >
                    <AnimatePresence>{positivePresetsHtml}</AnimatePresence>
                  </motion.ul>
                </div>
              </div>
            )}
            {!!presets?.negative?.length && (
              <div>
                <div className={classes[`presets__name`]}>Negative:</div>
                <div className={classes[`presets__bg`]}>
                  <motion.ul
                    // layout
                    initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
                    animate={ANIMATIONS_FM_SLIDEIN}
                    exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
                    className={classes.presets}
                  >
                    <AnimatePresence>{negativePresetsHtml}</AnimatePresence>
                  </motion.ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {formIsOpen && (
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
