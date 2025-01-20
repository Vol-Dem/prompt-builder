import classes from "./Carousel.module.scss";
import { useRef } from "react";
import useIntersection from "../../hooks/use-intersection";
import CarouselContent from "./CarouselContent";
import {
  SETTINGS_CAROUSEL_IMAGE_HEIGHT,
  SETTINGS_CAROUSEL_IMAGE_WIDTH,
  SETTINGS_CAROUSEL_INTERSECTION_MARGIN,
} from "../../variables/constants";

const Carousel = ({
  imagesData,
  visibleImgAmount,
  postId,
  onUpdate,
  modelId,
  versionId,
  existedImgsAmount,
  imgIsOpen = false,
  activeImgNum,
  saved,
  active,
  onActiveNumChange,
  side,
  showInView = false,
  imageHeight = SETTINGS_CAROUSEL_IMAGE_HEIGHT,
  imageWidth = SETTINGS_CAROUSEL_IMAGE_WIDTH,
}) => {
  const carouselRef = useRef(null);
  const isInersecting = useIntersection(
    showInView ? carouselRef : null,
    false,
    SETTINGS_CAROUSEL_INTERSECTION_MARGIN
  );

  return (
    <div
      ref={carouselRef}
      className={classes["carousel-test"]}
      style={{
        height: imageHeight,
        maxWidth: visibleImgAmount === 1 ? `${imageWidth}px` : null,
      }}
    >
      {(!showInView || isInersecting) && (
        <CarouselContent
          imagesData={imagesData}
          visibleImgAmount={visibleImgAmount}
          postId={postId}
          onUpdate={onUpdate}
          modelId={modelId}
          versionId={versionId}
          existedImgsAmount={existedImgsAmount}
          imgIsOpen={imgIsOpen}
          activeImgNum={activeImgNum}
          saved={saved}
          active={active}
          onActiveNumChange={onActiveNumChange}
          side={side}
          showInView={showInView}
          imageHeight={imageHeight}
          imageWidth={imageWidth}
        />
      )}
    </div>
  );
};

export default Carousel;
