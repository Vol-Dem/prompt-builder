import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { switchNsfwMode } from "../../../store/general";
import classes from "./NsfwSwitch.module.scss";
import DropDownList from "../../ui/DropDownList";
import NsfwSwitchSettings from "./nsfw-switch-settings/NsfwSwitchSettings";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * NSFW mode switch component.
 *
 * Renders SFW / NSFW toggle buttons and a settings button that opens
 * a dropdown with additional NSFW configuration options.
 *
 * Behavior:
 * - Toggles application NSFW mode in Redux when either SFW or NSFW button is clicked.
 * - Highlights the currently active mode.
 * - Opens and closes the NSFW settings dropdown.
 *
 * Side effects:
 * - Dispatches `switchNsfwMode` action.
 *
 * @component
 * @returns NSFW mode switch with settings dropdown.
 */
const NsfwSwitch = () => {
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);
  const isNsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const dispatch = useAppDispatch();

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
