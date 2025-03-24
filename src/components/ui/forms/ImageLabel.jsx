import classes from "./ImageLabel.module.scss";
import Image from "../image/Image";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL } from "../../../variables/constants";
import { useLayoutEffect, useRef, useState } from "react";

const ImageLabel = ({ htmlFor, imageData, type, className }) => {
  const [imageContainerWidtht, setImageContainerWidth] = useState(null);
  const imageContainerRef = useRef(null);

  useLayoutEffect(() => {
    if (imageContainerRef?.current?.offsetHeight)
      setImageContainerWidth(
        (imageContainerRef?.current?.offsetHeight / imageData.height) *
          imageData.width
      );
  }, [imageContainerRef?.current?.offsetHeight, imageData]);

  return (
    <label
      htmlFor={htmlFor}
      ref={imageContainerRef}
      className={classes["images-list__label"]}
      style={{
        width: imageContainerWidtht ? `${imageContainerWidtht}px` : null,
      }}
    >
      <Image
        className={`${classes["image"]} ${
          imageData?.value ? classes["image--active"] : ""
        } ${imageData?.saved ? classes["image--saved"] : ""} ${
          type === "del" ? classes["image--del"] : ""
        }`}
        src={imageData.label}
        alt={`Image`}
        imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
      />
    </label>
  );
};

export default ImageLabel;
