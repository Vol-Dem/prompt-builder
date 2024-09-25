import classes from "./ImageCardResourcesGuide.module.scss";
import { useMemo } from "react";
import PlusSvg from "../../../../assets/PlusSvg";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_IMAGE_RESOURCES } from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";

const guideType = "model";

const ImageCardResourcesGuide = (props) => {
  const guideSteps = useMemo(() => {
    const plusImage = (
      <span className={classes["btn-container"]}>
        <PlusSvg />
      </span>
    );

    return [
      {
        step: GUIDE_STEP_IMAGE_RESOURCES,
        arrowPosition: 4,
        next: true,
        text: (
          <>
            Models added to the collection and their versions are marked, you
            can also add them to the sidebar directly from here by clicking{" "}
            {plusImage}
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

export default ImageCardResourcesGuide;
