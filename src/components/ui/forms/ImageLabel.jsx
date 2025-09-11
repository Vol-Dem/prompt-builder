import classes from "./ImageLabel.module.scss";
import Image from "../image/Image";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL } from "../../../variables/constants";

const ImageLabel = ({ htmlFor, imageData, type, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`${classes["images-list__label"]} ${className || ""}`}
    >
      <Image
        className={`${classes["image"]} ${
          imageData?.value ? classes["image--active"] : ""
        } ${imageData?.saved ? classes["image--saved"] : ""} ${
          type === "del" ? classes["image--del"] : ""
        }`}
        type={imageData.data.type}
        imgType={imageData.data.type}
        src={imageData.data.url}
        alt={`Image ${imageData.id}`}
        imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
        width={imageData.width}
        height={imageData.height}
      />
    </label>
  );
};

export default ImageLabel;
