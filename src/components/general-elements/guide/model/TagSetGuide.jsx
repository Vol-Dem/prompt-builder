import { useMemo } from "react";

import classes from "./TagSetGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_MODEL_ADD_TAGSET,
  GUIDE_STEP_MODEL_TAGSET,
} from "../../../../variables/constants";
import DotsSvg from "../../../../assets/DotsSvg";
import GuideActionMessage from "../GuideActionMessage";
import ContentComment from "../ContentComment";
import useGuideStep from "../../../../hooks/use-guide-step";

/**
 * Tag sets guide.
 *
 * Renders tutorial messages for the tag sets.
 *
 * @component
 *
 * @returns {JSX.Element} Tag sets guide element.
 */
const TagSetGuide = () => {
  const guideType = "model";
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_MODEL_ADD_TAGSET,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            {" "}
            <GuideActionMessage>
              Click "Add tag set" button
            </GuideActionMessage>{" "}
            to create multiple sets of trigger words
            <ContentComment>
              (concepts, character outfits, appearances, etc.)
            </ContentComment>
          </>
        ),
      },
      {
        step: GUIDE_STEP_MODEL_TAGSET,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            Added tag sets are displayed here. You can set a preview using{" "}
            <DotsSvg className={classes.svg} /> on the image
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

export default TagSetGuide;
