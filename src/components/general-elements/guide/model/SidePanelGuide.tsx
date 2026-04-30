import { useMemo } from "react";

import classes from "./SidePanelGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_SIDEPANEL,
  GUIDE_STEP_SIDEPANEL_VIEW_SWITCH,
} from "../../../../variables/constants";
import ContentComment from "../ContentComment";
import useGuideStep from "../../../../hooks/use-guide-step";
import { useAppSelector } from "../../../../store/hooks/hooks";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Side panel guide.
 *
 * Renders tutorial messages for the side panel.
 *
 * @component
 *
 * @returns {JSX.Element} Side panel guide element.
 */
const SidePanelGuide = () => {
  const guideType = "model";
  const panelIsOpen = useAppSelector((state) => state.used.panelIsOpen);

  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_SIDEPANEL,
        arrowPosition: 4,
        next: true,
        text: (
          <>
            You can use the sidebar for quick access to models and reference
            images. <br />
            <ContentComment>Click "Next step" to continue</ContentComment>
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

  const { index, step } = useGuideStep(guideType, guideSteps);

  if (!step || !panelIsOpen) return null;

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

export default SidePanelGuide;
