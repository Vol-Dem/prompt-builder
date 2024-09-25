import classes from "./TagSetGuide.module.scss";
import { useMemo } from "react";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_MODEL_TAGSET,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import DotsSvg from "../../../../assets/DotsSvg";

const guideType = "model";

const TagSetGuide = () => {

  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_MODEL_TAGSET,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            Added tag sets are displayed here. You can set a preview using{" "}
            <DotsSvg className={classes.svg} /> on the image
          </>
        ),
      },
    ];
  }, []);

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  return (
    <>
      {guideStepIndex !== null &&  (
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

export default TagSetGuide;
