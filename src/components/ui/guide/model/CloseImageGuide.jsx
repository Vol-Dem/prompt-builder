import classes from "./CloseImageGuide.module.scss";
import { useMemo } from "react";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_CLOSE_IMAGE } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";

const guideType = "model";

const CloseImageGuide = () => {
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_CLOSE_IMAGE,
        arrowPosition: 3,
        text: (
          <>
            <GuideActionMessage>Close image</GuideActionMessage> to continue
          </>
        ),
      },
    ];
  }, []);

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  return (
    <>
      {guideStepIndex !== null && (
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
    </>
  );
};

export default CloseImageGuide;
