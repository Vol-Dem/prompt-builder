import { useDispatch, useSelector } from "react-redux";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { switchNsfwMode } from "../../../store/general";
import classes from "./NsfwSwitch.module.scss";
import DropDownList from "../DropDownList";
import NsfwSwitchSettings from "./nsfw-switch-settings/NsfwSwitchSettings";

const NsfwSwitch = () => {
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();

  const nsfwSwitchHandler = () => {
    dispatch(switchNsfwMode(!isNsfwMode));
  };

  const openSettingsHandler = () => {
    setSettingsIsOpen((prevState) => !prevState);
  };

  return (
    <div className={classes["container"]}>
      <div className={classes["mode-switch"]}>
        <button
          type="button"
          onClick={nsfwSwitchHandler}
          className={`${classes["btn-mode"]} ${classes["btn-mode--left"]} ${
            !isNsfwMode ? classes["btn-mode--active"] : ""
          }`}
        >
          SFW
        </button>
        <button
          type="button"
          onClick={nsfwSwitchHandler}
          className={`${classes["btn-mode"]} ${classes["btn-mode--right"]} ${
            isNsfwMode ? classes["btn-mode--active"] : ""
          }`}
        >
          NSFW
        </button>
      </div>
      <button
        title="NSFW Settings"
        className={classes["btn-mode--cog"]}
        onClick={openSettingsHandler}
      >
        <Cog6ToothIcon className={classes["btn-mode__icon"]} />
      </button>
      <AnimatePresence>
        {settingsIsOpen && (
          <DropDownList
            onClose={() => setSettingsIsOpen(false)}
            className={classes["mode__dropdown"]}
          >
            <NsfwSwitchSettings />
          </DropDownList>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NsfwSwitch;
