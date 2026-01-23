import { TrashIcon } from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";

import classes from "./PromptClear.module.scss";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import { promptActions } from "../../../store/prompt";

/**
 * Prompt clear controls.
 *
 * Displays buttons to clear the positive, negative, or both prompts.
 *
 * Responsibilities:
 * - Clears positive prompt only.
 * - Clears negative prompt only.
 * - Clears both prompts at once.
 *
 * Side effects:
 * - Resets prompt arrays and text values in Redux.
 *
 * @component
 * @returns {JSX.Element} Prompt clear controls.
 */
const PromptClear = () => {
  const dispatch = useDispatch();

  const clearPositivePromptHandler = () => {
    dispatch(promptActions.setCurrentPrompt(""));
    dispatch(promptActions.setCurPromptArr([]));
  };

  const clearNegativePromptHandler = () => {
    dispatch(promptActions.setCurrentNegPrompt(""));
    dispatch(promptActions.setCurNegPromptArr([]));
  };

  const clearPromptHandler = () => {
    dispatch(promptActions.clearPrompt());
  };

  return (
    <div className={classes["clear"]}>
      <span className={classes["clear__title"]}>Clear:</span>
      <ButtonTertiary
        type="button"
        onClick={clearPromptHandler}
        className={classes["clear__btn"]}
      >
        <TrashIcon className={classes["clear__btn-svg"]} />
        <span>all</span>
      </ButtonTertiary>
      <div className={`${classes["clear"]} ${classes["clear--fields"]}`}>
        <ButtonTertiary
          type="button"
          onClick={clearPositivePromptHandler}
          className={classes["clear__btn"]}
        >
          <TrashIcon className={classes["clear__btn-svg"]} />
          <span>positive</span>
        </ButtonTertiary>
        <ButtonTertiary
          type="button"
          onClick={clearNegativePromptHandler}
          className={classes["clear__btn"]}
        >
          <TrashIcon className={classes["clear__btn-svg"]} />
          <span>negative</span>
        </ButtonTertiary>
      </div>
    </div>
  );
};

export default PromptClear;
