import { useDispatch, useSelector } from "react-redux";
import classes from "./NsfwSwitchSettings.module.scss";
import { setNsfwValues } from "../../../../store/general";
import NsfwSwitchInput from "../nsfw-switch-input/NsfwSwitchInput";

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
