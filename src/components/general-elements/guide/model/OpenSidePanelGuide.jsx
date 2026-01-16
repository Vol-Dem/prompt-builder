import { useMemo } from "react";
import { useSelector } from "react-redux";

import classes from "./OpenSidePanelGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_SIDEPANEL,
  GUIDE_STEP_SIDEPANEL_VIEW_SWITCH,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";

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
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);

  const guideSteps = useMemo(() => {
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
