import { useMemo } from "react";

import classes from "./CloseImageGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_CLOSE_IMAGE } from "../../../../variables/constants";
import GuideActionMessage from "../GuideActionMessage";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Close image guide.
 *
 * Renders tutorial messages for the close image.
 *
 * @component
 *
 * @returns Close image guide element.
 */
const CloseImageGuide = () => {
  const guideType = "model";
  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_CLOSE_IMAGE,
        arrowPosition: 3,
        next: false,
        text: (
          <>
            <GuideActionMessage>Close image</GuideActionMessage> to continue
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

export default CloseImageGuide;
