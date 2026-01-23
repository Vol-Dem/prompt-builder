import { useRef, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

import classes from "./ImageComparisonSlider.module.scss";

/**
 * Before/after image comparison slider.
 *
 * Allows dragging to reveal left image over right image.
 *
 * @param {string} srcLeft - Left image URL.
 * @param {string} srcRight - Right image URL.
 * @param {number} [imgWidth] - Image width.
 * @param {number} [imgHeight] - Image height.
 * @param {string} [className] - Optional custom class.
 * @returns {JSX.Element} Rendered comparison slider.
 */
const ImageComparisonSlider = ({
  srcLeft,
  srcRight,
  imgWidth,
  imgHeight,
  className,
}) => {
  const [imageWidth, setImageWidth] = useState(50);
  const sliderRef = useRef(null);

  const onMouseDown = (e) => {
    const startX = e.clientX || e.touches[0].clientX;

    const onMouseMove = (moveEvent) => {
      const containerWidth = sliderRef.current.offsetWidth;
      const clientX = moveEvent.clientX || moveEvent.touches[0].clientX;
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
          width={imgWidth || null}
          height={imgHeight || null}
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
          width={imgWidth || null}
          height={imgHeight || null}
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
