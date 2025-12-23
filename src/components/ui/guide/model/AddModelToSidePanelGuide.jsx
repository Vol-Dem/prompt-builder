import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import classes from "./AddModelToSidePanelGuide.module.scss";
import PlusSvg from "../../../../assets/PlusSvg";
import GuideMessage from "../GuideMessage";
import { guideActions } from "../../../../store/guide";
import { GUIDE_STEP_ADD_MODEL_TO_SIDEPANEL } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";

const guideType = "model";

const AddModelToSidePanelGuide = () => {
  const usedModels = useSelector((state) => state.used.models);
  const dispatch = useDispatch();

  const guideSteps = useMemo(() => {
    const plusImage = (
      <span className={classes["btn-container"]}>
        <PlusSvg />
      </span>
    );

    return [
      {
        step: GUIDE_STEP_ADD_MODEL_TO_SIDEPANEL,
        arrowPosition: 4,
        text: (
          <>
            <GuideActionMessage>Click </GuideActionMessage> {plusImage} to add
            the model to the quick access sidebar.
          </>
        ),
      },
    ];
  }, []);

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  useEffect(() => {
    if (guideStepIndex !== null && !!usedModels.length) {
      dispatch(guideActions.guideNextStep({ type: guideType }));
    }
  }, [usedModels, guideStepIndex, dispatch]);

  return (
    <>
      {guideStepIndex !== null && (
        <GuideMessage
          type={guideType}
          className={`${classes[`guide__content--${guideStepIndex}`]}`}
          step={guideSteps[guideStepIndex]?.step}
          arrowPosition={guideSteps[guideStepIndex]?.arrowPosition}
        >
          {guideSteps[guideStepIndex]?.text}
        </GuideMessage>
      )}
    </>
  );
};

export default AddModelToSidePanelGuide;
