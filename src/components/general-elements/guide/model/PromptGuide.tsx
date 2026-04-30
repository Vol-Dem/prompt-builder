import { useMemo } from "react";

import classes from "./PromptGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_PROMPT_BREAK,
  GUIDE_STEP_PROMPT_COPY,
  GUIDE_STEP_PROMPT_DRAG_AND_DROP,
  GUIDE_STEP_PROMPT_EDIT_TAG,
  GUIDE_STEP_PROMPT_PRESETS,
  GUIDE_STEP_PROMPT_RESIZE,
  GUIDE_STEP_PROMPT_VIEW,
} from "../../../../variables/constants";
import GuideActionMessage from "../GuideActionMessage";
import CopySvg from "../../../../assets/CopySvg";
import useGuideStep from "../../../../hooks/use-guide-step";
import { useAppSelector } from "../../../../store/hooks/hooks";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Prompt guide.
 *
 * Renders tutorial messages for the prompt.
 * Overrides active guide step with “open prompt” or “change mode” messages based on prompt UI state.
 *
 * @component
 *
 * @returns Prompt guide element.
 */
const PromptGuide = () => {
  const guideType = "model";
  const promptIsOpen = useAppSelector((state) => state.prompt.promptIsOpen);
  const isTextMode = useAppSelector((state) => state.prompt.isTextMode);

  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_PROMPT_VIEW,
        arrowPosition: 8,
        next: true,
        text: (
          <>
            You can switch between tag and text mode to add or change the prompt
            manually
          </>
        ),
      },
      {
        step: GUIDE_STEP_PROMPT_PRESETS,
        arrowPosition: 8,
        next: true,
        text: (
          <>
            You can add commonly used trigger words into presets. Create presets
            for both positive and negative words
          </>
        ),
      },
      {
        step: GUIDE_STEP_PROMPT_BREAK,
        arrowPosition: 8,
        next: true,
        text: <>Click +BREAK button to add BREAK to the prompt</>,
      },
      {
        step: GUIDE_STEP_PROMPT_DRAG_AND_DROP,
        arrowPosition: 7,
        next: true,
        text: <>You can drag-n-drop tags to change the order</>,
      },
      {
        step: GUIDE_STEP_PROMPT_EDIT_TAG,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            You can click a tag to enter edit mode to change its content and
            weight
          </>
        ),
      },
      {
        step: GUIDE_STEP_PROMPT_RESIZE,
        arrowPosition: 5,
        next: true,
        text: <>You can resize prompt field</>,
      },
      {
        step: GUIDE_STEP_PROMPT_COPY,
        arrowPosition: 4,
        next: true,
        text: (
          <>
            Button <CopySvg className={classes.svg} /> allows you to copy the
            current prompt
          </>
        ),
      },
    ];
  }, []);

  const openPromptData: GuideStep = {
    step: "default",
    arrowPosition: 2,
    next: false,
    text: (
      <>
        <GuideActionMessage>Open prompt panel</GuideActionMessage> to continue
      </>
    ),
  };

  const changePromptMode: GuideStep = {
    step: "mode",
    arrowPosition: 8,
    next: false,
    text: (
      <>
        <GuideActionMessage>Change to "Tags" mode</GuideActionMessage> to
        continue
      </>
    ),
  };

  let { index, step } = useGuideStep(guideType, guideSteps);

  if (!step) return null;

  let renderIndex: string | number | null = index;
  let renderStep = step;

  if (!promptIsOpen) {
    renderIndex = "default";
    renderStep = openPromptData;
  } else if (isTextMode) {
    renderIndex = "mode";
    renderStep = changePromptMode;
  }

  return (
    <GuideMessage
      type={guideType}
      className={`${classes[`guide__content--${renderIndex}`]} ${classes["z-index"]}`}
      step={renderStep.step}
      arrowPosition={renderStep.arrowPosition}
      next={renderStep.next}
    >
      {renderStep.text}
    </GuideMessage>
  );
};

export default PromptGuide;
