import classes from "./ModelTagsFormGuide.module.scss";
import { useMemo } from "react";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_MODEL_TAGS_CLOSE,
  GUIDE_STEP_MODEL_TAGS_EDIT_FROM,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";

const guideType = "model";

const ModelTagsFormGuide = (props) => {
  const guideSteps = useMemo(() => {
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
        text: (
          <>
            <GuideActionMessage>Close the editing window</GuideActionMessage>
          </>
        ),
      },
    ];
  }, []);

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  return (
    <>
      {guideStepIndex !== null && (
        <GuideMessage
          type={guideType}
          className={`${classes[`guide__content--${guideStepIndex}`]}`}
          step={guideSteps[guideStepIndex]?.step}
          arrowPosition={guideSteps[guideStepIndex]?.arrowPosition}
          next={guideSteps[guideStepIndex]?.next}
        >
          {guideSteps[guideStepIndex]?.text}
        </GuideMessage>
      )}
    </>
  );
};

export default ModelTagsFormGuide;
