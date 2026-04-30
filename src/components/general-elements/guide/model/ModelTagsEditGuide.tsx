import { useMemo } from "react";

import classes from "./ModelTagsFormGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_MODEL_TAGS_CLOSE,
  GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
} from "../../../../variables/constants";
import GuideActionMessage from "../GuideActionMessage";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Model tags form guide.
 *
 * Renders tutorial messages for the tags form.
 *
 * @component
 *
 * @returns Model tags form guide element.
 */
const ModelTagsFormGuide = () => {
  const guideType = "model";
  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
        arrowPosition: 8,
        next: true,
        text: <>Here you can split or edit the version trigger words</>,
      },
      {
        step: GUIDE_STEP_MODEL_TAGS_CLOSE,
        arrowPosition: 3,
         next: false,
        text: (
          <>
            <GuideActionMessage>Close the editing window</GuideActionMessage>
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

export default ModelTagsFormGuide;
