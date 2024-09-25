import classes from "./PromptGuide.module.scss";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_PROMPT_COPY,
  GUIDE_STEP_PROMPT_PRESETS,
  GUIDE_STEP_PROMPT_VIEW,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";
import CopySvg from "../../../../assets/CopySvg";

const guideType = "model";

const PromptGuide = (props) => {
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);

  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_PROMPT_VIEW,
        arrowPosition: 8,
        next: true,
        text: (
          <>
            You can switch between tag and text mod to add or change the prompt
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
            Add commonly used trigger words into presets. Create presets for
            both positive and negative words
          </>
        ),
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

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  return (
    <>
      {promptIsOpen && guideStepIndex !== null && (
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
    </>
  );
};

export default PromptGuide;
