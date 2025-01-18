import { useDispatch, useSelector } from "react-redux";
import { setNsfwValues, switchNsfwMode } from "../../../store/general";
import classes from "./NsfwSwitch.module.scss";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import DropDownList from "../DropDownList";

const NsfwSwitch = () => {
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);
  const [sfwInput, setSfwInput] = useState("None");
  const [nsfwInput, setNsfwInput] = useState("true");
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const sfwValue = useSelector((state) => state.general.sfwValue);
  const nsfwValue = useSelector((state) => state.general.nsfwValue);
  const dispatch = useDispatch();

  useEffect(() => {
    setSfwInput(sfwValue);
    setNsfwInput(nsfwValue);
  }, [sfwValue, nsfwValue]);

  const nsfwSwitchHandler = () => {
    dispatch(switchNsfwMode(!isNsfwMode));
  };

  const openSettingsHandler = () => {
    setSettingsIsOpen((prevState) => !prevState);
  };

  const sfwInputHandler = (e) => {
    setSfwInput(e.target.value);
    dispatch(setNsfwValues(e.target.value, nsfwInput));
  };
  const nsfwInputHandler = (e) => {
    setNsfwInput(e.target.value);
    dispatch(setNsfwValues(sfwInput, e.target.value));
  };

  // const closeSettingsHandler = useCallback((e) => {
  //   if (!e.target.closest(`.${classes["mode__form"]}`)) {
  //     setSettingsIsOpen(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (settingsIsOpen) {
  //     document.removeEventListener("click", closeSettingsHandler);
  //     document.addEventListener("click", closeSettingsHandler);
  //   } else {
  //     document.removeEventListener("click", closeSettingsHandler);
  //   }

  //   return () => {
  //     document.removeEventListener("click", closeSettingsHandler);
  //   };
  // }, [settingsIsOpen, closeSettingsHandler]);

  return (
    <div className={classes["container"]}>
      <div className={classes["mode-switch"]}>
        <button
          type="button"
          onClick={nsfwSwitchHandler}
          className={`${classes["btn-mode"]} ${
            !isNsfwMode ? classes["btn-mode--active"] : ""
          }`}
        >
          SFW
        </button>
        <button
          type="button"
          onClick={nsfwSwitchHandler}
          className={`${classes["btn-mode"]} ${
            isNsfwMode ? classes["btn-mode--active"] : ""
          }`}
        >
          NSFW
        </button>
      </div>
      <button
        className={classes["btn-mode--cog"]}
        onClick={openSettingsHandler}
      >
        <Cog6ToothIcon className={classes["btn-mode__icon"]} />
      </button>
      {settingsIsOpen && (
        <DropDownList
          onClose={() => {
            setSettingsIsOpen(false);
          }}
          className={classes["mode__dropdown"]}
        >
          <form className={classes["mode__form"]}>
            <>
              <div>SFW:</div>
              <fieldset
                onChange={sfwInputHandler}
                className={classes["mode__field"]}
              >
                <div>
                  <input
                    type="radio"
                    id="sfw-1"
                    name="sfw"
                    value="None"
                    defaultChecked={sfwInput === "None"}
                    className={classes["mode__input"]}
                  />
                  <label htmlFor="sfw-1" className={classes["mode__label"]}>
                    PG
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="sfw-2"
                    name="sfw"
                    value="Soft"
                    defaultChecked={sfwInput === "Soft"}
                    className={classes["mode__input"]}
                  />
                  <label htmlFor="sfw-2" className={classes["mode__label"]}>
                    PG-13
                  </label>
                </div>
              </fieldset>
            </>

            <>
              <div>NSFW:</div>
              <fieldset
                onChange={nsfwInputHandler}
                className={classes["mode__field"]}
              >
                <div>
                  <input
                    type="radio"
                    id="nsfw-1"
                    name="nsfw"
                    value="Soft"
                    defaultChecked={nsfwInput === "Soft"}
                    className={classes["mode__input"]}
                  />
                  <label htmlFor="nsfw-1" className={classes["mode__label"]}>
                    PG-13
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="nsfw-2"
                    name="nsfw"
                    value="Mature"
                    defaultChecked={nsfwInput === "Mature"}
                    className={classes["mode__input"]}
                  />
                  <label htmlFor="nsfw-2" className={classes["mode__label"]}>
                    R
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="nsfw-3"
                    name="nsfw"
                    value="X"
                    defaultChecked={nsfwInput === "X"}
                    className={classes["mode__input"]}
                  />
                  <label htmlFor="nsfw-3" className={classes["mode__label"]}>
                    XXX
                  </label>
                </div>
              </fieldset>
            </>
          </form>
        </DropDownList>
      )}
    </div>
  );
};

export default NsfwSwitch;
