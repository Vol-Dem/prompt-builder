import { useMemo } from "react";

import classes from "./EditDefaultGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_EDIT_DEFAULT } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";

const guideType = "edit";

const EditDefaultGuide = (props) => {
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

export default EditDefaultGuide;
