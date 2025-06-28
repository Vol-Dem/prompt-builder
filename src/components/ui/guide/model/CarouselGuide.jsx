import classes from "./CarouselGuide.module.scss";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlusSvg from "../../../../assets/PlusSvg";
import GuideMessage from "../GuideMessage";
import { guideActions } from "../../../../store/guide";
import {
  GUIDE_STEP_ADD_IMAGE_TO_SIDEPANEL,
  GUIDE_STEP_MODEL_EDIT,
  GUIDE_STEP_OPEN_IMAGE,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import GuideActionMessage from "../GuideActionMessage";
import SettingsSvg from "../../../../assets/SettingsSvg";

const guideType = "model";

const CarouselGuide = () => {
  const usedImages = useSelector((state) => state.used.images);
  const dispatch = useDispatch();

  const guideSteps = useMemo(() => {
    const plusImage = (
      <span className={classes["btn-container"]}>
        <PlusSvg />
      </span>
    );

    return [
      {
        step: GUIDE_STEP_ADD_IMAGE_TO_SIDEPANEL,
        arrowPosition: 6,
        text: (
          <>
            {" "}
            <GuideActionMessage> Click {plusImage}</GuideActionMessage> to add
            the image to the quick access sidebar to use as a reference.
          </>
        ),
      },
      {
        step: GUIDE_STEP_OPEN_IMAGE,
        arrowPosition: 6,
        text: (
          <>
            <GuideActionMessage> Click on the image</GuideActionMessage> to see
            its prompt and other generation data
          </>
        ),
      },
      {
        step: GUIDE_STEP_MODEL_EDIT,
        arrowPosition: 3,
        text: (
          <>
            <GuideActionMessage>
              Click <SettingsSvg className={classes.svg} />
            </GuideActionMessage>{" "}
            to open the model settings
          </>
        ),
      },
    ];
  }, []);

  const guideStepIndex = useGuideIndex(guideType, guideSteps);

  useEffect(() => {
    if (
      guideStepIndex !== null &&
      guideSteps[guideStepIndex].step === GUIDE_STEP_ADD_IMAGE_TO_SIDEPANEL &&
      !!usedImages.length
    ) {
      dispatch(guideActions.guideNextStep({ type: guideType }));
    }
  }, [usedImages, guideStepIndex, guideSteps, dispatch]);

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

export default CarouselGuide;
