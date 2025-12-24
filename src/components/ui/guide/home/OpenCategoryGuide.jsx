import { useMemo } from "react";

import classes from "./OpenCategoryGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_OPEN_CATEGORY } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideAction from "../GuideActionMessage";

const guideType = "home";

const OpenCategoryGuide = () => {
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_OPEN_CATEGORY,
        arrowPosition: 8,
        text: (
          <>
            Your model will now be displayed here.{" "}
            <GuideAction>Go to the category to see the model.</GuideAction>
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

export default OpenCategoryGuide;
