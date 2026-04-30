import { useMemo } from "react";

import classes from "./OpenCategoryGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_OPEN_CATEGORY } from "../../../../variables/constants";
import GuideAction from "../GuideActionMessage";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Open category guide.
 *
 * Renders tutorial messages for the open category.
 *
 * @component
 *
 * @returns Open category guide element.
 */
const OpenCategoryGuide = () => {
  const guideType = "home";
  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_OPEN_CATEGORY,
        arrowPosition: 8,
        next: false,
        text: (
          <>
            Your model will now be displayed here.{" "}
            <GuideAction>Go to the category to see the model.</GuideAction>
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

export default OpenCategoryGuide;
