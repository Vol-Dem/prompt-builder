import classes from "./EditPageGuide.module.scss";
import { useMemo } from "react";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_EDIT_MENU,
  GUIDE_STEP_EDIT_UPD_DEL,
  GUIDE_STEP_EDIT_VERSIONS_SWITCH,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";

const guideType = "edit";

const EditPageGuide = (props) => {
  const guideSteps = useMemo(() => {
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

export default EditPageGuide;
