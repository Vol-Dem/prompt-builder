import { useMemo } from "react";

import classes from "./ImageCardCarouselGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_SWITCH_IMAGE } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import ArrowRightSvg from "../../../../assets/ArrowRight";

const guideType = "model";

const ImageCardCarouselGuide = () => {
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_SWITCH_IMAGE,
        arrowPosition: 8,
        next: true,
        text: (
          <>
            Click <ArrowRightSvg className={classes.svg} /> to view the next
            image
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

export default ImageCardCarouselGuide;
