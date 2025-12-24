import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";

import classes from "./ActiveCarousel.module.scss";
import Carousel from "../carousel/Carousel";
import ImageCard from "../image-card/ImageCard";
import { modelActions } from "../../store/model";
import CrossSvg from "../../assets/CrossSvg";
import ImageCardCarouselGuide from "../ui/guide/model/ImageCardCarouselGuide";
import CloseImageGuide from "../ui/guide/model/CloseImageGuide";
import { guideActions } from "../../store/guide";
import {
  GUIDE_STEP_CLOSE_IMAGE,
  GUIDE_STEP_MODEL_TAGS_EDIT,
  GUIDE_STEP_OPEN_IMAGE,
  GUIDE_STEP_PROMPT_COPY,
  GUIDE_STEP_PROMPT_VIEW,
} from "../../variables/constants";
import CarouselImageList from "../carousel/carousel-image-list/CarouselImageList";
import ActiveCarouselContentWrap from "./ActiveCarouselContentWrap";

const ActiveCarousel = () => {
  const [activeImageNumber, setActiveImageNumber] = useState(null);
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const savedImagesData = useSelector((state) => state.model.savedImages);
  const guideStep = useSelector((state) => state.guide.model.step);
  const guideIsActive = useSelector((state) => state.guide.active);
  const dispatch = useDispatch();
  const existedExample =
    Object.hasOwn(savedImagesData?.data, activeCarouselData?.versionId) &&
    savedImagesData.data[`${activeCarouselData?.versionId}`]?.find(
      (img) => img?.postId === +activeCarouselData?.images[0]?.postId
    );
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
    dispatch(modelActions.setActiveCarouselData({}));

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
        })
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
        })
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
                        imgIsOpen={true}
                        activeImgNum={activeCarouselData?.currImgNum || 0}
                        active={true}
                        saved={activeCarouselData?.saved}
                        onActiveNumChange={setActiveImageNumber}
                        side={activeCarouselData?.side}
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
              {isOpen && <CrossSvg />}
            </div>
          </div>
          {isOpen && guideIsActive && <CloseImageGuide />}
        </ActiveCarouselContentWrap>
      )}
    </AnimatePresence>
  );
};

export default ActiveCarousel;
