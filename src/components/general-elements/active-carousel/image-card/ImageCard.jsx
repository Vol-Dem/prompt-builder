import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import classes from "./ImageCard.module.scss";
import TagList from "../../tag-list/TagList";
import ImageCardGuide from "../../guide/model/ImageCardGuide";
import { GUIDE_STEP_ADD_TO_PROMPT } from "../../../../variables/constants";
import { guideActions } from "../../../../store/guide";
import NotificationMessage from "../../../ui/NotificationMessage";
import ImageResources from "./image-resources/ImageResources";
import ImageInfo from "./image-info/ImageInfo";
import { splitTags } from "../../../../utils/promptUtils";

/**
 * Image card component.
 *
 * Shows the currently active image prompt, generation metadata,
 * and the list of resources (models, LoRAs, etc.) used to generate it.
 *
 * Responsibilities:
 * - Displays prompt, generation info, and used resources for the active image.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.activeImgNum - Index of active carousel image.
 * @returns {JSX.Element} Image card.
 */
const ImageCard = ({ activeImgNum }) => {
  const guideModelActive = useSelector((state) => state.guide.model.active);
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const dispatch = useDispatch();
  const imageData = useMemo(() => {
    return activeCarouselData?.images?.length
      ? activeCarouselData?.images[activeImgNum || 0]
      : null;
  }, [activeCarouselData, activeImgNum]);
  const positiveWordsArr = splitTags(imageData?.meta?.prompt);
  const negativeWordsArr = splitTags(imageData?.meta?.negativePrompt);

  useEffect(() => {
    if (
      imageData?.url &&
      guideIsActive &&
      guideStep &&
      guideStep < GUIDE_STEP_ADD_TO_PROMPT
    ) {
      dispatch(
        guideActions.setGuideStep({
          type: "model",
          value: GUIDE_STEP_ADD_TO_PROMPT,
        })
      );
    }
  }, [guideStep, imageData?.url, dispatch, guideIsActive]);

  return (
    <>
      {imageData?.url && (
        <div className={classes.example}>
          <div className={classes["example__info"]}>
            <>
              <div
                className={`${classes["example__prompt"]} ${
                  guideModelActive &&
                  guideIsActive &&
                  guideStep === GUIDE_STEP_ADD_TO_PROMPT
                    ? classes["example__prompt--guide"]
                    : ""
                }`}
              >
                <ImageCardGuide />
                {!!positiveWordsArr?.length && (
                  <TagList
                    name="Positive prompt"
                    tags={positiveWordsArr}
                    promptType="positive"
                    className={classes["tags__list"]}
                  />
                )}
                {!positiveWordsArr?.length && (
                  <NotificationMessage type="notification">
                    Positive prompt is not avalible for this image
                  </NotificationMessage>
                )}
                {!!negativeWordsArr?.length && (
                  <TagList
                    name="Negative prompt"
                    tags={negativeWordsArr}
                    promptType="negative"
                    className={classes["tags__list"]}
                  />
                )}
                {!negativeWordsArr?.length && (
                  <NotificationMessage type="notification">
                    Negative prompt is not avalible for this image
                  </NotificationMessage>
                )}
              </div>
              <div className={classes["example__config"]}>
                <ImageInfo imageData={imageData} />
                <ImageResources imageData={imageData} />
              </div>
            </>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCard;
