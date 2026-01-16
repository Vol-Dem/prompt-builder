import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import classes from "./AddModelToSidePanelGuide.module.scss";
import PlusSvg from "../../../../assets/PlusSvg";
import GuideMessage from "../GuideMessage";
import { guideActions } from "../../../../store/guide";
import { GUIDE_STEP_ADD_MODEL_TO_SIDEPANEL } from "../../../../variables/constants";
import GuideActionMessage from "../GuideActionMessage";
import useGuideStep from "../../../../hooks/use-guide-step";

/**
 * Add model to side panel guide.
 *
 * Renders tutorial messages for adding model to side panel.
 * Tracks models added to the sidebar and automatically switches to the next step.
 *
 * @component
 *
 * @returns {JSX.Element} Add model to side panel guide element.
 */
const AddModelToSidePanelGuide = () => {
  const guideType = "model";
  const sidebarModels = useSelector((state) => state.used.models);
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

  const { index, step } = useGuideStep(guideType, guideSteps);

  useEffect(() => {
    if (index !== null && !!sidebarModels.length) {
      dispatch(guideActions.guideNextStep({ type: guideType }));
    }
  }, [sidebarModels, index, dispatch]);

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

export default AddModelToSidePanelGuide;
