import { useMemo } from "react";
import { FolderArrowDownIcon, PlusIcon } from "@heroicons/react/24/outline";

import classes from "./ImageCardResourcesGuide.module.scss";
import GuideMessage from "../GuideMessage";
import { GUIDE_STEP_IMAGE_RESOURCES } from "../../../../variables/constants";
import useGuideStep from "../../../../hooks/use-guide-step";
import type { GuideStep } from "../../../../types/guide.types";

/**
 * Image card resources guide.
 *
 * Renders tutorial messages for the image card resources.
 *
 * @component
 *
 * @returns Image card resources guide element.
 */
const ImageCardResourcesGuide = () => {
  const guideType = "model";
  const guideSteps = useMemo<GuideStep[]>(() => {
    const plusImage = (
      <span className={classes["btn-container"]}>
        <PlusIcon />
      </span>
    );
    const folderImage = (
      <span className={classes["btn-container"]}>
        <FolderArrowDownIcon />
      </span>
    );

    return [
      {
        step: GUIDE_STEP_IMAGE_RESOURCES,
        arrowPosition: 4,
        next: true,
        text: (
          <>
            {folderImage} Click to save the current resource to your collection.
            If the resource is already downloaded, the button will be replaced
            with a {plusImage}, which you can use to add the resource to the
            sidebar.
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

export default ImageCardResourcesGuide;
