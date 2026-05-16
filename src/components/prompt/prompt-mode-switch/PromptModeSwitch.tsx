import classes from "./PromptModeSwitch.module.scss";
import { promptActions } from "../../../store/prompt";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { MouseEvent } from "react";

/**
 * Prompt mode switch.
 *
 * Toggles between text-based and tag-based prompt editing.
 *
 * Responsibilities:
 * - Switches prompt UI mode in Redux.
 *
 * @component
 * @returns Prompt mode switch.
 */
const PromptModeSwitch = () => {
  const promptTextMode = useAppSelector((state) => state.prompt.isTextMode);
  const dispatch = useAppDispatch();

  const textModeHandler = (e: MouseEvent<HTMLElement>) => {
    if (!(e.target instanceof HTMLElement)) return;

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
