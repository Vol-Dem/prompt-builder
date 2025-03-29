import classes from "./ImageLabel.module.scss";
import Image from "../image/Image";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL } from "../../../variables/constants";
import { useLayoutEffect, useRef, useState } from "react";
import { transformSrcPreview } from "../../../utils/generalUtils";

const ImageLabel = ({ htmlFor, imageData, type, className }) => {
  const [imageContainerWidtht, setImageContainerWidth] = useState(null);
  const imageContainerRef = useRef(null);
  // console.log(imageData.data);
  // const { previewSrc, previewVideoWebmSrc, previewVideoMp4Src } =
  //   transformSrcPreview(
  //     imageData.data.url,
  //     SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
  //     imageData.data.type
  //   );

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
      className={`${classes["images-list__label"]} ${className || ""}`}
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
        type={imageData.data.type}
        src={imageData.data.url}
        alt={`Image`}
        imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
      />
    </label>
  );
};

export default ImageLabel;
