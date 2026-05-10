import { useMemo } from "react";

import classes from "./GeneratedImagesGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_GENERATED_IMAGES,
  GUIDE_STEP_IMAGE_MENU,
  GUIDE_STEP_SAVE_IMAGE,
  GUIDE_STEP_SAVED_TAB,
} from "../../../../variables/constants";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";
import {
  EllipsisHorizontalIcon,
  FolderArrowDownIcon,
} from "@heroicons/react/24/outline";

/**
 * Generated images guide.
 *
 * Renders tutorial messages for the generated images.
 *
 * @component
 *
 * @returns Generated images guide element.
 */
const GeneratedImagesGuide = () => {
  const guideType = "model";
  const guideSteps = useMemo<GuideStep[]>(() => {
    const downloadImage = (
      <FolderArrowDownIcon
        className={`${classes["svg"]} ${classes["svg--medium"]}`}
      />
    );

    return [
      {
        step: GUIDE_STEP_GENERATED_IMAGES,
        arrowPosition: 6,
        next: true,
        text: (
          <>
            Here are displayed images generated with this model by Civitai users
          </>
        ),
      },
      {
        step: GUIDE_STEP_IMAGE_MENU,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            In the image menu <EllipsisHorizontalIcon className={classes.svg} />{" "}
            you can set it as a preview for the model or tag sets
          </>
        ),
      },
      {
        step: GUIDE_STEP_SAVE_IMAGE,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            Click {downloadImage} to add image to model or image collection to
            use it as a reference later.
          </>
        ),
      },
      {
        step: GUIDE_STEP_SAVED_TAB,
        arrowPosition: 7,
        next: true,
        text: (
          <>
            Images saved to the model are located here, and you can find image
            collections in the top menu by clicking on the "IMAGES" link.
          </>
        ),
      },
    ];
  }, []);

  const { index, step } = useGuideStep(guideType, guideSteps);

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

export default GeneratedImagesGuide;
