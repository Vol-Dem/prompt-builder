import { memo, useEffect, useRef, type ChangeEvent } from "react";

import classes from "./Prompt.module.scss";
import { promptActions } from "../../store/prompt";
import PromptGuide from "../general-elements/guide/model/PromptGuide";
import PromptSettings from "./prompt-settings/PromptSettings";
import PromptField from "./prompt-field/PromptField";
import { useAppDispatch, useAppSelector } from "../../store/hooks/hooks";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

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
 * @returns Prompt panel.
 */
const Prompt = memo(() => {
  const curPrompt = useAppSelector((state) => state.prompt.curPrompt);
  const curNegPrompt = useAppSelector((state) => state.prompt.curNegPrompt);
  const promptIsOpen = useAppSelector((state) => state.prompt.promptIsOpen);
  const dispatch = useAppDispatch();
  const showPromptBtnRef = useRef<HTMLButtonElement>(null);
  const promptContainerRef = useRef<HTMLDivElement>(null);
  const positiveMaxHeight = document.body.offsetHeight - 300;

  useEffect(() => {
    if (promptContainerRef.current) {
      dispatch(
        promptActions.setPromptHeight(promptContainerRef.current.offsetHeight),
      );
    }

    if (showPromptBtnRef.current) {
      dispatch(
        promptActions.setPromptBtnHeight(showPromptBtnRef.current.offsetHeight),
      );
    }
  }, [promptContainerRef?.current?.offsetHeight, promptIsOpen, dispatch]);

  const openPromptHandler = () => {
    dispatch(promptActions.setPromptIsOpen(!promptIsOpen));
  };

  const positivePromptHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(promptActions.setCurrentPrompt(e.target.value));
  };

  const negativePromptHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(promptActions.setCurrentNegPrompt(e.target.value));
  };

  const promptResizeHandler = () => {
    if (promptContainerRef.current) {
      dispatch(
        promptActions.setPromptHeight(promptContainerRef.current.offsetHeight),
      );
    }
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
              <ChevronUpIcon />
              Hide prompt
            </>
          ) : (
            <>
              <ChevronDownIcon />
              Show prompt
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export default Prompt;
