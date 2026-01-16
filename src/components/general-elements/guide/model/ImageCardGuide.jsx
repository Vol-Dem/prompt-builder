import { useMemo } from "react";
import { useSelector } from "react-redux";

import classes from "./ImageCardGuide.module.scss";
import GuideMessage from "../GuideMessage";
import {
  GUIDE_STEP_ADD_ALL_TO_PROMPT,
  GUIDE_STEP_ADD_TO_PROMPT,
  GUIDE_STEP_HIGHLIGHTING_WORDS,
} from "../../../../variables/constants";
import ContentComment from "../ContentComment";
import GuideActionMessage from "../GuideActionMessage";
import useGuideStep from "../../../../hooks/use-guide-step";

/**
 * Image card guide.
 *
 * Renders tutorial messages for the image card.
 *
 * @component
 *
 * @returns {JSX.Element} Image card guide element.
 */
const ImageCardGuide = () => {
  const guideType = "model";
  const expectedTagsAmount = 2;
  const prompt = useSelector((state) => state.prompt.curPromptArr);

  const guideSteps = useMemo(() => {
    let actionText =
      "Add at least few tags to the prompt by clicking them to continue";

    if (expectedTagsAmount - prompt.length === 1) {
      actionText =
        "Add at least one more tag to the prompt by clicking them to continue";
    }
    if (prompt.length >= expectedTagsAmount) {
      actionText = 'Click "Next step" to continue';
    }

    return [
      {
        step: GUIDE_STEP_ADD_TO_PROMPT,
        arrowPosition: 8,
        next: prompt.length >= expectedTagsAmount,
        text: (
          <>
            You can click on tags to add trigger words to or remove from prompt.{" "}
            <br />
            <ContentComment>
              Trigger words that are already in the prompt will be highlighted.
            </ContentComment>
            <br />
            <GuideActionMessage>{actionText}</GuideActionMessage>
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
  }, [prompt]);

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

export default ImageCardGuide;
