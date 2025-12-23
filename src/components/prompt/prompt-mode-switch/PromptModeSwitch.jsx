import { useDispatch, useSelector } from "react-redux";

import classes from "./PromptModeSwitch.module.scss";
import { promptActions } from "../../../store/prompt";

const PromptModeSwitch = () => {
  const promptTextMode = useSelector((state) => state.prompt.isTextMode);
  const dispatch = useDispatch();

  const textModeHandler = (e) => {
    const isTextMode = e.target.dataset.type === "text";
    dispatch(promptActions.setTextMode(isTextMode));
  };

  return (
    <div className={classes["mode-switch"]}>
      <button
        data-type="text"
        onClick={textModeHandler}
        className={`${classes["btn-mode"]}  ${
          promptTextMode ? classes["btn-mode--active"] : ""
        }`}
      >
        Text
      </button>
      <button
        data-type="tag"
        onClick={textModeHandler}
        className={`${classes["btn-mode"]}  ${
          !promptTextMode ? classes["btn-mode--active"] : ""
        }`}
      >
        Tags
      </button>
    </div>
  );
};

export default PromptModeSwitch;
