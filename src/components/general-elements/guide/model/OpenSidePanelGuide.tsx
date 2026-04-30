import { useMemo } from "react";

import classes from "./OpenSidePanelGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_SIDEPANEL,
  GUIDE_STEP_SIDEPANEL_VIEW_SWITCH,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";
import { useAppSelector } from "../../../../store/hooks/hooks";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Open side pane guide.
 *
 * Renders tutorial messages for the open side pane.
 * Tracks if current guide step is the one of the sidebar ones and displays guide messahe of sidebar is closed.
 *
 * @component
 *
 * @returns {JSX.Element} Open side pane guide element.
 */
const OpenSidePanelGuide = () => {
  const guideType = "model";
  const panelIsOpen = useAppSelector((state) => state.used.panelIsOpen);

  const guideSteps = useMemo<GuideStep[]>(() => {
    return [
      {
        step: GUIDE_STEP_SIDEPANEL,
      },
      {
        step: GUIDE_STEP_SIDEPANEL_VIEW_SWITCH,
      },
    ];
  }, []);

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  return (
    <>
      {!panelIsOpen && guideStepIndex !== null && (
        <GuideMessage
          type={guideType}
          className={`${classes[`guide__content--default`]}`}
          step="default"
          arrowPosition={4}
        >
          <GuideActionMessage>Open sidebar</GuideActionMessage> to continue
        </GuideMessage>
      )}
    </>
  );
};

export default OpenSidePanelGuide;
