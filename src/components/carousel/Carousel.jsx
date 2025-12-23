import { useRef } from "react";

import classes from "./Carousel.module.scss";
import useIntersection from "../../hooks/use-intersection";
import CarouselContent from "./CarouselContent";
import {
  SETTINGS_CAROUSEL_IMAGE_HEIGHT,
  SETTINGS_CAROUSEL_IMAGE_WIDTH,
  SETTINGS_CAROUSEL_INTERSECTION_MARGIN,
} from "../../variables/constants";

const Carousel = ({
  showInView = false,
  imageHeight = SETTINGS_CAROUSEL_IMAGE_HEIGHT,
  imageWidth = SETTINGS_CAROUSEL_IMAGE_WIDTH,
  visibleImgAmount,
  ...props
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
          showInView={showInView}
          imageHeight={imageHeight}
          imageWidth={imageWidth}
          visibleImgAmount={visibleImgAmount}
          {...props}
        />
      )}
    </div>
  );
};

export default Carousel;
