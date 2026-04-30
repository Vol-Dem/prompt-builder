import { useEffect, useMemo } from "react";

import classes from "./CarouselGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { guideActions } from "../../../../store/guide";
import {
  GUIDE_STEP_ADD_IMAGE_TO_SIDEPANEL,
  GUIDE_STEP_MODEL_EDIT,
  GUIDE_STEP_OPEN_IMAGE,
} from "../../../../variables/constants";
import GuideActionMessage from "../GuideActionMessage";
import SettingsSvg from "../../../../assets/SettingsSvg";
import useGuideStep from "../../../../hooks/use-guide-step";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Carousel guide.
 *
 * Renders tutorial messages for the carousel.
 * Tracks images added to the sidebar and automatically switches to the next step.
 *
 * @component
 *
 * @returns {JSX.Element} Carousel guide element.
 */
const CarouselGuide = () => {
  const guideType = "model";
  const usedImages = useAppSelector((state) => state.used.images);
  const dispatch = useAppDispatch();

  const guideSteps = useMemo<GuideStep[]>(() => {
    const plusImage = (
      <span className={classes["btn-container"]}>
        <PlusIcon />
      </span>
    );

    return [
      {
        step: GUIDE_STEP_ADD_IMAGE_TO_SIDEPANEL,
        arrowPosition: 6,
        next: false,
        text: (
          <>
            <GuideActionMessage> Click {plusImage}</GuideActionMessage> to add
            the image to the quick access sidebar to use as a reference.
          </>
        ),
      },
      {
        step: GUIDE_STEP_OPEN_IMAGE,
        arrowPosition: 6,
        next: false,
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
        next: false,
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

  const { index, step } = useGuideStep(guideType, guideSteps);

  useEffect(() => {
    if (
      index !== null &&
      guideSteps[index].step === GUIDE_STEP_ADD_IMAGE_TO_SIDEPANEL &&
      !!usedImages.length
    ) {
      dispatch(guideActions.guideNextStep({ type: guideType }));
    }
  }, [usedImages, index, guideSteps, dispatch]);

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

export default CarouselGuide;
