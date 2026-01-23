import classes from "./ImageLabel.module.scss";
import Image from "../image/Image";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL } from "../../../variables/constants";

/**
 * Image label.
 *
 * Displays a clickable image preview used as a label
 * for selecting an image in a form.
 *
 * @param {string} htmlFor - Input id used for label binding.
 * @param {object} imageData - Image metadata and state.
 * @param {'del' | 'save'} type - Form mode for styling.
 * @param {string} [className] - Optional custom class.
 *
 * @returns {JSX.Element} Image label.
 */
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
