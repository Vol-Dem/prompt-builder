import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import classes from "./ActiveCarousel.module.scss";
import Carousel from "../carousel/Carousel";
import ImageCard from "./image-card/ImageCard";
import { modelActions } from "../../../store/model";
import ImageCardCarouselGuide from "../guide/model/ImageCardCarouselGuide";
import CloseImageGuide from "../guide/model/CloseImageGuide";
import { guideActions } from "../../../store/guide";
import {
  GUIDE_STEP_CLOSE_IMAGE,
  GUIDE_STEP_MODEL_TAGS_EDIT,
  GUIDE_STEP_OPEN_IMAGE,
  GUIDE_STEP_PROMPT_COPY,
  GUIDE_STEP_PROMPT_VIEW,
} from "../../../variables/constants";
import CarouselImageList from "../carousel/carousel-image-list/CarouselImageList";
import ActiveCarouselContentWrap from "./ActiveCarouselContentWrap";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { ModelSavedPostInfo } from "../../../../shared/types/model";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Active carousel popup component.
 *
 * Displays an opened carousel when an image is clicked from the image list.
 * Shows the currently active image together with its prompt, generation metadata,
 * and the list of resources (models, LoRAs, etc.) used to generate it.
 *
 * If the "Show all images" button is clicked instead of a specific image,
 * the component renders a grid/list view of all images in the carousel.
 *
 * Responsibilities:
 * - Renders the active image carousel or full image list depending on open mode.
 * - Displays prompt, generation info, and used resources for the active image.
 * - Resets active carousel state on close.
 *
 * @component
 * @returns {JSX.Element} Active carousel popup.
 */
const ActiveCarousel = () => {
  const [activeImageNumber, setActiveImageNumber] = useState<number | null>(
    null,
  );
  const activeCarouselData = useAppSelector(
    (state) => state.model.activeCarouselData,
  );
  const savedImagesData = useAppSelector((state) => state.model.savedImages);
  const guideStep = useAppSelector((state) => state.guide.model.step);
  const guideIsActive = useAppSelector((state) => state.guide.active);
  const dispatch = useAppDispatch();
  let existedExample: ModelSavedPostInfo | null = null;

  if (
    savedImagesData?.data &&
    activeCarouselData?.versionId &&
    Object.hasOwn(savedImagesData.data, activeCarouselData.versionId)
  ) {
    existedExample =
      savedImagesData.data[`${activeCarouselData?.versionId}`]?.find(
        (img) =>
          activeCarouselData.images[0].postId &&
          img.postId === +activeCarouselData.images[0].postId,
      ) || null;
  }

  const isOpen = !!activeCarouselData?.images?.length;

  useEffect(() => {
    const scrollTop = document.documentElement.scrollTop;
    const disableScrollHandler = () => {
      window.scrollTo(0, scrollTop);
    };

    if (activeCarouselData?.images?.length) {
      setActiveImageNumber(activeCarouselData.currImgNum);

      window.addEventListener("scroll", disableScrollHandler);
    } else {
      window.removeEventListener("scroll", disableScrollHandler);
    }
    return () => {
      window.removeEventListener("scroll", disableScrollHandler);
    };
  }, [activeCarouselData]);

  const closeActiveCarouselHandler = () => {
    dispatch(modelActions.setActiveCarouselData(null));

    if (!guideIsActive) return;

    if (guideStep === GUIDE_STEP_CLOSE_IMAGE) {
      dispatch(guideActions.guideNextStep({ type: "model" }));
    } else if (
      guideStep > GUIDE_STEP_OPEN_IMAGE &&
      guideStep < GUIDE_STEP_PROMPT_VIEW
    ) {
      dispatch(
        guideActions.setGuideStep({
          type: "model",
          value: GUIDE_STEP_PROMPT_VIEW,
        }),
      );
    }
  };

  useEffect(() => {
    if (
      guideIsActive &&
      guideStep === GUIDE_STEP_PROMPT_COPY + 1 &&
      !activeCarouselData?.images?.length
    ) {
      dispatch(
        guideActions.setGuideStep({
          type: "model",
          value: GUIDE_STEP_MODEL_TAGS_EDIT,
        }),
      );
    }
  }, [guideStep, activeCarouselData?.images, dispatch, guideIsActive]);

  return (
    <AnimatePresence>
      {isOpen && (
        <ActiveCarouselContentWrap
          className={`${classes.container} ${
            isOpen ? classes["container--open"] : ""
          }`}
        >
          <div
            className={`${classes.wrap} ${
              activeCarouselData?.currImgNum === null ? classes.scroll : ""
            }`}
          >
            {activeCarouselData?.currImgNum !== null && (
              <>
                <div className={classes["carousel"]}>
                  {isOpen && (
                    <>
                      <Carousel
                        imagesData={activeCarouselData?.images}
                        versionId={activeCarouselData?.versionId}
                        existedImgsAmount={
                          existedExample?.imagesId?.length || null
                        }
                        postId={activeCarouselData?.postId}
                        modelId={activeCarouselData?.modelId}
                        visibleImgAmount={1}
                        activeImgNum={activeCarouselData?.currImgNum || 0}
                        active={true}
                        saved={activeCarouselData?.saved}
                        onActiveNumChange={setActiveImageNumber}
                        side={!!activeCarouselData?.side}
                        location={activeCarouselData?.location}
                        locationId={
                          activeCarouselData?.locationId ||
                          activeCarouselData?.modelId
                        }
                      />
                      <ImageCardCarouselGuide />
                    </>
                  )}
                </div>
                <ImageCard activeImgNum={activeImageNumber} />
              </>
            )}
            {activeCarouselData?.currImgNum === null && (
              <CarouselImageList images={activeCarouselData.images} />
            )}
            <div
              className={classes["btn__close"]}
              onClick={closeActiveCarouselHandler}
            >
              {isOpen && <XMarkIcon />}
            </div>
          </div>
          {isOpen && guideIsActive && <CloseImageGuide />}
        </ActiveCarouselContentWrap>
      )}
    </AnimatePresence>
  );
};

export default ActiveCarousel;
