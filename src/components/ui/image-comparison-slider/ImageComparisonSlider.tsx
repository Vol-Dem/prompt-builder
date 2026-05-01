import { useRef, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

import classes from "./ImageComparisonSlider.module.scss";

type ImageComparisonSliderProps = {
  srcLeft: string;
  srcRight: string;
  imgWidth?: number | string;
  imgHeight?: number | string;
  className?: string;
};

/**
 * Before/after image comparison slider.
 *
 * Allows dragging to reveal left image over right image.
 * @param props
 * @param {string} props.srcLeft - Left image URL.
 * @param {string} props.srcRight - Right image URL.
 * @param {number} [props.imgWidth] - Image width.
 * @param {number} [props.imgHeight] - Image height.
 * @param {string} [props.className] - Optional custom class.
 * @returns {JSX.Element} Rendered comparison slider.
 */
const ImageComparisonSlider = ({
  srcLeft,
  srcRight,
  imgWidth,
  imgHeight,
  className,
}: ImageComparisonSliderProps) => {
  const [imageWidth, setImageWidth] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<Element>,
  ) => {
    let startX: number;

    if ("touches" in e) {
      startX = e.touches[0].clientX;
    } else {
      startX = e.clientX;
    }

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!sliderRef.current) return;
      const containerWidth = sliderRef.current.offsetWidth;
      let clientX: number;

      if ("touches" in moveEvent) {
        clientX = moveEvent.touches[0].clientX;
      } else {
        clientX = moveEvent.clientX;
      }

      const shift = clientX - startX;
      const newWidth = imageWidth + (shift * 100) / containerWidth;

      if (newWidth >= 100 || newWidth <= 0) return;

      setImageWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onMouseMove);
    window.addEventListener("touchend", onMouseUp);
  };

  return (
    <div className={`${classes.container} ${className || ""}`} ref={sliderRef}>
      <div className={classes["image-containers"]} draggable={false}>
        <img
          width={imgWidth}
          height={imgHeight}
          className={classes["image"]}
          src={srcRight}
          alt="slide-1"
          draggable={false}
        />
      </div>
      <div
        className={classes["image-container"]}
        style={{ width: `${imageWidth}%` }}
        draggable={false}
      >
        <img
          width={imgWidth}
          height={imgHeight}
          className={`${classes["image"]} ${classes["image--2"]}`}
          src={srcLeft}
          alt="slide-2"
          draggable={false}
        />
      </div>
      <div
        className={classes.control}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        style={{ left: `${imageWidth}%` }}
      >
        <div className={classes["control__arrows"]}>
          <ChevronUpDownIcon />
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;
