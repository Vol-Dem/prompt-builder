import classes from "./ModelTagsGuide.module.scss";
import { useMemo } from "react";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_MODEL_TAGS_EDIT } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";
import EditSvg from "../../../../assets/EditSvg";

const guideType = "model";

const ModelTagsGuide = () => {
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_MODEL_TAGS_EDIT,
        arrowPosition: 3,
        text: (
          <>
            {" "}
            <GuideActionMessage>Click </GuideActionMessage>{" "}
            <EditSvg className={classes.svg} /> to open the version trigger word
            settings
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

export default ModelTagsGuide;
