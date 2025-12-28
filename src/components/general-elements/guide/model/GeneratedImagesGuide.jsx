import { useMemo } from "react";

import classes from "./GeneratedImagesGuide.module.scss";
import FolderSvg from "../../../../assets/FolderSvg";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_GENERATED_IMAGES,
  GUIDE_STEP_IMAGE_MENU,
  GUIDE_STEP_SAVE_IMAGE,
  GUIDE_STEP_SAVED_TAB,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";
import DotsSvg from "../../../../assets/DotsSvg";

const guideType = "model";

const GeneratedImagesGuide = () => {
  const guideSteps = useMemo(() => {
    const downloadImage = (
      <FolderSvg className={`${classes["svg"]} ${classes["svg--medium"]}`} />
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
            In the image menu <DotsSvg className={classes.svg} /> you can set it
            as a preview for the model or tag sets
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

export default GeneratedImagesGuide;
