import { useDispatch, useSelector } from "react-redux";
import { memo, useEffect, useRef } from "react";

import classes from "./Prompt.module.scss";
import { promptActions } from "../../store/prompt";
import ArrowDownSvg from "../../assets/ArrowDownSvg";
import ArrowUp from "../../assets/ArrowUp";
import PromptGuide from "../general-elements/guide/model/PromptGuide";
import PromptSettings from "./prompt-settings/PromptSettings";
import PromptField from "./prompt-field/PromptField";

const positiveMinHeight = 100;
const negativeMinHeight = 60;
const negativeMaxHeight = 180;

/**
 * Prompt panel controller.
 *
 * High-level composite component that coordinates the entire
 * prompt editing system (positive & negative).
 *
 * Responsibilities:
 * - Controls panel visibility.
 * - Synchronizes prompt field sizes with Redux.
 * - Bridges Redux state with child prompt fields.
 * - Dispatches prompt text and tag changes.
 *
 * State ownership:
 * - Prompt values, layout sizes and mode flags are stored in Redux.
 * - This component only coordinates and forwards events.
 *
 * @component
 * @returns {JSX.Element} Prompt panel.
 */
const Prompt = memo(() => {
  const curPrompt = useSelector((state) => state.prompt.curPrompt);
  const curNegPrompt = useSelector((state) => state.prompt.curNegPrompt);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const dispatch = useDispatch();
  const showPromptBtnRef = useRef(null);
  const promptContainerRef = useRef(null);
  const positiveMaxHeight = document.body.offsetHeight - 300;

  useEffect(() => {
    dispatch(
      promptActions.setPromptHeight(promptContainerRef.current.offsetHeight),
    );
    dispatch(
      promptActions.setPromptBtnHeight(showPromptBtnRef.current.offsetHeight),
    );
  }, [promptContainerRef?.current?.offsetHeight, promptIsOpen, dispatch]);

  const openPromptHandler = () => {
    dispatch(promptActions.setPromptIsOpen(!promptIsOpen));
  };

  const positivePromptHandler = (e) => {
    dispatch(promptActions.setCurrentPrompt(e.target.value));
  };

  const negativePromptHandler = (e) => {
    dispatch(promptActions.setCurrentNegPrompt(e.target.value));
  };

  const promptResizeHandler = () => {
    dispatch(
      promptActions.setPromptHeight(promptContainerRef.current.offsetHeight),
    );
  };

  return (
    <div className={`${classes.wrap} wrapper`}>
      <div
        className={`${classes.container} ${
          promptIsOpen ? classes["container--open"] : ""
        }`}
      >
        <div className={`${classes.content}`}>
          <div
            ref={promptContainerRef}
            className={`${classes["prompt__content-wrap"]}`}
          >
            <PromptSettings />
            <PromptGuide />
            <PromptField
              promptType="positive"
              placeholderText="Prompt (text mode)"
              placeholderTags="Prompt (tags mode)"
              aditionalPlacegholder="Add tags from the model or image tag list, or switch view to text mode to enter manually"
              minHeight={positiveMinHeight}
              maxHeight={positiveMaxHeight}
              prompt={curPrompt}
              promptHandler={positivePromptHandler}
              onPromptResize={promptResizeHandler}
            />
            <PromptField
              promptType="negative"
              placeholderText="Negative prompt (text mode)"
              placeholderTags="Negative prompt (tags mode)"
              minHeight={negativeMinHeight}
              maxHeight={negativeMaxHeight}
              prompt={curNegPrompt}
              promptHandler={negativePromptHandler}
              onPromptResize={promptResizeHandler}
            />
          </div>
        </div>
        <button
          ref={showPromptBtnRef}
          type="button"
          className={classes["btn-open"]}
          onClick={openPromptHandler}
        >
          {promptIsOpen ? (
            <>
              <ArrowUp />
              Hide prompt
            </>
          ) : (
            <>
              <ArrowDownSvg />
              Show prompt
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export default Prompt;
