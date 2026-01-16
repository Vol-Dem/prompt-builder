import { useMemo } from "react";

import classes from "./EditDefaultGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_EDIT_DEFAULT } from "../../../../variables/constants";
import useGuideStep from "../../../../hooks/use-guide-step";

/**
 * Edit default guide.
 *
 * Renders tutorial messages for the edit default.
 *
 * @component
 *
 * @returns {JSX.Element} Edit default guide element.
 */
const EditDefaultGuide = () => {
  const guideType = "edit";
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_EDIT_DEFAULT,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            Here you can change the type, category and subcategories of the
            model
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

export default EditDefaultGuide;
