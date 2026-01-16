import { useDispatch, useSelector } from "react-redux";

import classes from "./NsfwSwitchSettings.module.scss";
import { setNsfwValues } from "../../../../store/general";
import NsfwSwitchInput from "../nsfw-switch-input/NsfwSwitchInput";

/**
 * NSFW switch settings dropdown.
 *
 * Renders radio controls that define content filtering levels
 * for both SFW and NSFW modes.
 *
 * SFW levels:
 * - PG
 * - PG-13
 *
 * NSFW levels:
 * - PG-13
 * - R
 * - XXX
 *
 * Behavior:
 * - Updates global NSFW filtering thresholds in Redux when values change.
 * - Keeps SFW and NSFW ranges in sync via `setNsfwValues`.
 *
 * Side effects:
 * - Dispatches `setNsfwValues` action.
 *
 * @component
 * @returns {JSX.Element} NSFW settings dropdown.
 */
const NsfwSwitchSettings = () => {
  const sfwValue = useSelector((state) => state.general.sfwValue);
  const nsfwValue = useSelector((state) => state.general.nsfwValue);
  const dispatch = useDispatch();

  const sfwInputHandler = (e) => {
    dispatch(setNsfwValues(e.target.value, nsfwValue));
  };
  const nsfwInputHandler = (e) => {
    dispatch(setNsfwValues(sfwValue, e.target.value));
  };

  return (
    <form className={classes["mode__form"]}>
      <>
        <div>SFW:</div>
        <fieldset onChange={sfwInputHandler} className={classes["mode__field"]}>
          <NsfwSwitchInput
            id="sfw-1"
            name="sfw"
            value="None"
            defaultChecked={sfwValue === "None"}
          >
            PG
          </NsfwSwitchInput>
          <NsfwSwitchInput
            id="sfw-2"
            name="sfw"
            value="Soft"
            defaultChecked={sfwValue === "Soft"}
          >
            PG-13
          </NsfwSwitchInput>
        </fieldset>
      </>

      <>
        <div>NSFW:</div>
        <fieldset
          onChange={nsfwInputHandler}
          className={classes["mode__field"]}
        >
          <NsfwSwitchInput
            id="nsfw-1"
            name="nsfw"
            value="Soft"
            defaultChecked={nsfwValue === "Soft"}
          >
            PG-13
          </NsfwSwitchInput>
          <NsfwSwitchInput
            id="nsfw-2"
            name="nsfw"
            value="Mature"
            defaultChecked={nsfwValue === "Mature"}
          >
            R
          </NsfwSwitchInput>
          <NsfwSwitchInput
            id="nsfw-3"
            name="nsfw"
            value="X"
            defaultChecked={nsfwValue === "X"}
          >
            XXX
          </NsfwSwitchInput>
        </fieldset>
      </>
    </form>
  );
};

export default NsfwSwitchSettings;
