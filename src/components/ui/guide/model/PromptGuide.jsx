import classes from "./PromptGuide.module.scss";
import { useMemo } from "react";
import { useSelector } from "react-redux";
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
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";
import CopySvg from "../../../../assets/CopySvg";

const guideType = "model";

const PromptGuide = (props) => {
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const isTextMode = useSelector((state) => state.prompt.isTextMode);

  const guideSteps = useMemo(() => {
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

  const openPanelData = {
    step: "default",
    arrowPosition: 2,
    text: (
      <>
        <GuideActionMessage>Open prompt panel</GuideActionMessage> to continue
      </>
    ),
  };

  const changePromptMode = {
    step: "mode",
    arrowPosition: 8,
    text: (
      <>
        <GuideActionMessage>Change to "Tags" mode</GuideActionMessage> to
        continue
      </>
    ),
  };

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  return (
    <>
      {promptIsOpen && !isTextMode && guideStepIndex !== null && (
        <GuideMessage
          type={guideType}
          className={`${classes[`guide__content--${guideStepIndex}`]}`}
          step={guideSteps[guideStepIndex]?.step}
          arrowPosition={guideSteps[guideStepIndex]?.arrowPosition}
          next={guideSteps[guideStepIndex]?.next}
        >
          {guideSteps[guideStepIndex]?.text}
        </GuideMessage>
      )}
      {!promptIsOpen && guideStepIndex !== null && (
        <GuideMessage
          type={guideType}
          className={`${classes[`guide__content--${openPanelData.step}`]}`}
          step={openPanelData?.step}
          arrowPosition={openPanelData?.arrowPosition}
          next={openPanelData?.next}
        >
          {openPanelData?.text}
        </GuideMessage>
      )}
      {promptIsOpen && isTextMode && guideStepIndex !== null && (
        <GuideMessage
          type={guideType}
          className={`${classes[`guide__content--${changePromptMode.step}`]}`}
          step={changePromptMode?.step}
          arrowPosition={changePromptMode?.arrowPosition}
          next={changePromptMode?.next}
        >
          {changePromptMode?.text}
        </GuideMessage>
      )}
    </>
  );
};

export default PromptGuide;
