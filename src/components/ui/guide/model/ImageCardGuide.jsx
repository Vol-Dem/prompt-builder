import classes from "./ImageCardGuide.module.scss";
import { useMemo } from "react";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_ADD_ALL_TO_PROMPT,
  GUIDE_STEP_ADD_TO_PROMPT,
  GUIDE_STEP_HIGHLIGHTING_WORDS,
} from "../../../../variables/constants";
import useGuideIndex from "../../../../hooks/use-guide-index";

const guideType = "model";

const ImageCardGuide = (props) => {
  const guideSteps = useMemo(() => {
    return [
      {
        step: GUIDE_STEP_ADD_TO_PROMPT,
        arrowPosition: 8,
        next: true,
        text: (
          <>
            You can click on tags to add trigger words to or remove from prompt.{" "}
            <br />
            <span className={classes["guide__content__comment"]}>
              Trigger words that are already in the prompt will be highlighted
            </span>
          </>
        ),
      },
      {
        step: GUIDE_STEP_ADD_ALL_TO_PROMPT,
        arrowPosition: 1,
        next: true,
        text: (
          <>
            Click "Add All" to add to the current prompt all the image trigger
            words.
          </>
        ),
      },
      {
        step: GUIDE_STEP_HIGHLIGHTING_WORDS,
        arrowPosition: 8,
        next: true,
        text: (
          <>
            When you change the image, you will see if there are any trigger
            words that match the current prompt, that helps avoid duplicates.
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

export default ImageCardGuide;
