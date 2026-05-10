import { useMemo } from "react";

import classes from "./AddTagSetGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_MODEL_TAGS_ADD_TAGSET } from "../../../../variables/constants";
import GuideActionMessage from "../GuideActionMessage";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Add tag set guide.
 *
 * Renders tutorial messages for the add tag set.
 *
 * @component
 *
 * @returns Add tag set guide element.
 */
const AddTagSetGuide = () => {
  const guideType = "model";
  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_MODEL_TAGS_ADD_TAGSET,
        arrowPosition: 7,
        next: false,
        text: (
          <>
            Here you can create custom trigger word sets. Try to{" "}
            <GuideActionMessage>
              add one by entering its name and trigger words
            </GuideActionMessage>{" "}
            and <GuideActionMessage>click "Save"</GuideActionMessage>
            <span className={classes["guide__content__comment"]}>
              {" "}
              <br />
              Tag sets can be used for outfits, apperances, etc.
            </span>
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

export default AddTagSetGuide;
