import { useMemo } from "react";

import classes from "./ImageCardCarouselGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_SWITCH_IMAGE } from "../../../../variables/constants";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

/**
 * Image card carousel guide.
 *
 * Renders tutorial messages for the image card carousel.
 *
 * @component
 *
 * @returns Image card carousel guide element.
 */
const ImageCardCarouselGuide = () => {
  const guideType = "model";
  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_SWITCH_IMAGE,
        arrowPosition: 8,
        next: true,
        text: (
          <>
            Click <ChevronRightIcon className={classes.svg} /> to view the next
            image
          </>
        ),
      },
    ];
  }, []);

  const { index, step } = useGuideStep(guideType, guideSteps);

  if (!step) return null;

  return (
    <GuideMessage
      type={guideType}
      className={`${classes[`guide__content--${index}`]}`}
      step={step.step}
      arrowPosition={step.arrowPosition}
      next={step.next}
    >
      {step.text}
    </GuideMessage>
  );
};

export default ImageCardCarouselGuide;
