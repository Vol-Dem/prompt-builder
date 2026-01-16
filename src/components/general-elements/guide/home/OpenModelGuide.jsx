import { useMemo } from "react";

import classes from "./OpenModelGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_OPEN_MODEL } from "../../../../variables/constants";
import GuideActionMessage from "../GuideActionMessage";
import useGuideStep from "../../../../hooks/use-guide-step";

/**
 * Open model guide.
 *
 * Renders tutorial messages for the open model.
 *
 * @component
 *
 * @returns {JSX.Element} Open model guide element.
 */
const OpenModelGuide = () => {
  const guideType = "home";
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

export default OpenModelGuide;
