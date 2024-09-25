import classes from "./OpenSidePanelGuide.module.scss";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import PlusSvg from "../../../../assets/PlusSvg";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_SIDEPANEL,
  GUIDE_STEP_SIDEPANEL_VIEW_SWITCH,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";

const guideType = "model";

const OpenSidePanelGuide = (props) => {
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);

  const guideSteps = useMemo(() => {
    const plusImage = (
      <span className={classes["btn-container"]}>
        <PlusSvg />
      </span>
    );

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
        text: <>Click {plusImage} to add image</>,
      },
    ];
  }, []);

  const openPanelData = {
    step: "default",
    arrowPosition: 4,
    text: (
      <>
        <GuideActionMessage>Open sidebar</GuideActionMessage> to continue
      </>
    ),
  };

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  return (
    <>
      {!panelIsOpen && guideStepIndex !== null && (
        <GuideMessage
          type={guideType}
          className={`${classes[`guide__content--${openPanelData.step}`]}`}
          step={openPanelData?.step}
          arrowPosition={openPanelData?.arrowPosition}
          next={openPanelData?.next}
        >
          {openPanelData?.text}
        </GuideMessage>
      )}
    </>
  );
};

export default OpenSidePanelGuide;
