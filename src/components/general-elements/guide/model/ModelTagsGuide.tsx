import { useMemo } from "react";

import classes from "./ModelTagsGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_MODEL_TAGS_EDIT } from "../../../../variables/constants";
import EditSvg from "../../../../assets/EditSvg";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Model tags guide.
 *
 * Renders tutorial messages for the model tags.
 *
 * @component
 *
 * @returns Model tags guide element.
 */
const ModelTagsGuide = () => {
  const guideType = "model";
  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_MODEL_TAGS_EDIT,
        arrowPosition: 3,
        next: true,
        text: (
          <>
            You can click <EditSvg className={classes.svg} /> to edit the
            version trigger words and activation tag
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

export default ModelTagsGuide;
