import { useMemo } from "react";

import classes from "./OpenModelGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_OPEN_MODEL } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";

const guideType = "home";

const OpenModelGuide = (props) => {
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_OPEN_MODEL,
        arrowPosition: 7,
        text: (
          <>
            <GuideActionMessage>Click on the title or image</GuideActionMessage>{" "}
            to go to the model page.
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

export default OpenModelGuide;
