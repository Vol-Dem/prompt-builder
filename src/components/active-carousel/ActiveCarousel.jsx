import { useEffect, useState } from "react";
import classes from "./ActiveCarousel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "../carousel/Carousel";
import ImageCard from "../image-card/ImageCard";
import { modelActions } from "../../store/model";
import CrossSvg from "../../assets/CrossSvg";

const ActiveCarousel = () => {
  const [activeImageNumber, setActiveImageNumber] = useState(null);
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const model = useSelector((state) => state.model.model);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const dispatch = useDispatch();

  const isSaved =
    activeCarouselData?.versionId &&
    model?.savedImages?.hasOwnProperty(activeCarouselData?.versionId) &&
    model?.savedImages[activeCarouselData?.versionId]?.find(
      (post) => post.postId === activeCarouselData.postId
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

  return (
    <>
      <div
        className={`${classes.container} ${
          !!activeCarouselData?.images?.length ? classes["container--open"] : ""
        }`}
      >
        <div
          className={`${classes.wrap}`}
          style={
            !!activeCarouselData?.images?.length
              ? {
                  height: `${
                    promptIsOpen ? "calc(100vh - 315px)" : "calc(100vh - 110px)"
                  }`,
                }
              : {}
          }
        >
          {!!activeCarouselData?.images?.length && (
            <Carousel
              imagesData={activeCarouselData?.images}
              versionId={activeCarouselData?.versionId}
              existedImgsAmount={activeCarouselData?.existedImgsAmount || null}
              postId={!isSaved ? activeCarouselData?.postId : null}
              modelId={activeCarouselData?.modelId}
              visibleImgAmount={1}
              imgIsOpen={true}
              activeImgNum={activeCarouselData?.currImgNum || 0}
              active={true}
              saved={activeCarouselData?.saved}
              onActiveNumChange={setActiveImageNumber}
              side={activeCarouselData?.side}
            />
          )}
          <ImageCard activeImgNum={activeImageNumber} />
          <div
            className={classes["btn__close"]}
            onClick={() => {
              dispatch(modelActions.setActiveCarouselData({}));
            }}
          >
            {!!activeCarouselData?.images?.length && <CrossSvg />}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActiveCarousel;
