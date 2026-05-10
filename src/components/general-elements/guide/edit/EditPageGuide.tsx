import { useMemo } from "react";

import classes from "./EditPageGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_EDIT_MENU,
  GUIDE_STEP_EDIT_UPD_DEL,
  GUIDE_STEP_EDIT_VERSIONS_SWITCH,
} from "../../../../variables/constants";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Edit page guide.
 *
 * Renders tutorial messages for the edit page.
 *
 * @component
 *
 * @returns Edit page guide element.
 */
const EditPageGuide = () => {
  const guideType = "edit";
  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_EDIT_UPD_DEL,
        arrowPosition: 1,
        next: true,
        text: <>Here you can check for model updates and delete it</>,
      },
      {
        step: GUIDE_STEP_EDIT_VERSIONS_SWITCH,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            Here you can mark your downloaded versions of the model so you can
            track which versions you already have
          </>
        ),
      },
      {
        step: GUIDE_STEP_EDIT_MENU,
        arrowPosition: 8,
        next: true,
        text: <>Custom settings for each marked version are displayed here</>,
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

export default EditPageGuide;
