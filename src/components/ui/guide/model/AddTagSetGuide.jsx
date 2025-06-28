import classes from "./AddTagSetGuide.module.scss";
import { useMemo } from "react";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_MODEL_TAGS_ADD_TAGSET } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";

const guideType = "model";

const AddTagSetGuide = () => {
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_MODEL_TAGS_ADD_TAGSET,
        arrowPosition: 7,
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

export default AddTagSetGuide;
