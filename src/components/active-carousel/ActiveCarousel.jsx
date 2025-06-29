import { useEffect, useState } from "react";
import classes from "./ActiveCarousel.module.scss";
import { useDispatch, useSelector } from "react-redux";
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
import { AnimatePresence, motion } from "framer-motion";
import CarouselImageList from "../carousel/carousel-image-list/CarouselImageList";

const ActiveCarousel = () => {
  const [activeImageNumber, setActiveImageNumber] = useState(null);
  const [savedImages, setSavedImages] = useState({});
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const model = useSelector((state) => state.model.model);
  const savedImagesData = useSelector((state) => state.model.savedImages);
  const guideStep = useSelector((state) => state.guide.model.step);
  const guideIsActive = useSelector((state) => state.guide.active);
  const dispatch = useDispatch();

  useEffect(() => {
    if (model?.id && model.id === savedImagesData?.modelId) {
      setSavedImages(savedImagesData.data);
    } else {
      setSavedImages({});
    }
  }, [model?.id, savedImagesData]);

  const existedExample =
    savedImages?.hasOwnProperty(activeCarouselData?.versionId) &&
    savedImages[`${activeCarouselData?.versionId}`]?.find(
      (img) => img?.postId === +activeCarouselData?.images[0]?.postId
    );

  useEffect(() => {
    const scrollTop = document.documentElement.scrollTop;
    const disableScrollHandler = (e) => {
      window.scrollTo(0, scrollTop);
    };

    if (!!activeCarouselData?.images?.length) {
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
      {!!activeCarouselData?.images?.length && (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 30 },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`${classes.container} ${
            !!activeCarouselData?.images?.length
              ? classes["container--open"]
              : ""
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
                  {!!activeCarouselData?.images?.length && (
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
              {!!activeCarouselData?.images?.length && <CrossSvg />}
            </div>
          </div>
          {!!activeCarouselData?.images?.length && guideIsActive && (
            <CloseImageGuide />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActiveCarousel;
