import { useRef, type ComponentProps } from "react";

import classes from "./Carousel.module.scss";
import useIntersection from "../../../hooks/use-intersection";
import CarouselContent, { type CarouselContentProps } from "./CarouselContent";
import {
  SETTINGS_CAROUSEL_IMAGE_HEIGHT,
  SETTINGS_CAROUSEL_IMAGE_WIDTH,
  SETTINGS_CAROUSEL_INTERSECTION_MARGIN,
} from "../../../variables/constants";

type CarouselProps = ComponentProps<"div"> &
  CarouselContentProps & {
    showInView?: boolean;
    imageHeight?: number;
    imageWidth?: number;
    visibleImgAmount: number;
  };

/**
 * Carousel wrapper component.
 *
 * Conditionally renders carousel content based on viewport visibility.
 * Uses IntersectionObserver to delay rendering until the carousel is close to the viewport,
 * improving performance on long image lists.
 *
 * Responsibilities:
 * - Observes its own visibility when `showInView` is enabled.
 * - Lazily mounts `CarouselContent` only when the component enters the viewport.
 * - Forwards layout-related props to the carousel content.
 *
 * @component
 *
 * @param {object} props
 * @param {boolean} [props.showInView=false] - If true, renders carousel content only when it is close to the viewport.
 * @param {number} [props.imageHeight=SETTINGS_CAROUSEL_IMAGE_HEIGHT] - Height of carousel images.
 * @param {number} [props.imageWidth=SETTINGS_CAROUSEL_IMAGE_WIDTH] - Width of carousel images.
 * @param {number} [props.visibleImgAmount] - Number of images visible at the same time.
 *
 * @returns {JSX.Element} Carousel wrapper element.
 */
const Carousel = ({
  showInView = false,
  imageHeight = SETTINGS_CAROUSEL_IMAGE_HEIGHT,
  imageWidth = SETTINGS_CAROUSEL_IMAGE_WIDTH,
  visibleImgAmount,
  ...props
}: CarouselProps) => {
  const carouselRef = useRef(null);
  const isInersecting = useIntersection(
    showInView ? carouselRef : null,
    false,
    SETTINGS_CAROUSEL_INTERSECTION_MARGIN,
  );

  return (
    <div
      ref={carouselRef}
      className={classes["carousel"]}
      style={{
        height: imageHeight,
        maxWidth: visibleImgAmount === 1 ? `${imageWidth}px` : undefined,
      }}
    >
      {(!showInView || isInersecting) && (
        <CarouselContent
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
