import classes from "./SidePanelGuide.module.scss";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_SIDEPANEL,
  GUIDE_STEP_SIDEPANEL_VIEW_SWITCH,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";

const guideType = "model";

const SidePanelGuide = () => {
  const guideIsActive = useSelector((state) => state.guide.active);
  const modelGuideIsActive = useSelector((state) => state.guide.model.active);
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);

  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_SIDEPANEL,
        arrowPosition: 4,
        next: true,
        text: (
          <>
            You can use the sidebar for quick access to models and reference
            images.
          </>
        ),
      },
      {
        step: GUIDE_STEP_SIDEPANEL_VIEW_SWITCH,
        arrowPosition: 4,
        next: true,
        text: <>Here you can switch the view to short or extended</>,
      },
    ];
  }, []);

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  return (
    <>
      {guideStepIndex !== null &&
        panelIsOpen &&
        guideIsActive &&
        modelGuideIsActive && (
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

export default SidePanelGuide;
