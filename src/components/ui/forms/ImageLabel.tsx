import classes from "./ImageLabel.module.scss";
import Image from "../image/Image";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL } from "../../../variables/constants";
import type { ComponentProps } from "react";
import type { LabelImageData } from "../../../types/images.types";

type ImageLabelProps = ComponentProps<"label"> & {
  type: "del" | "save";
  imageData: LabelImageData;
};

/**
 * Image label.
 *
 * Displays a clickable image preview used as a label
 * for selecting an image in a form.
 * @param props
 * @param {string} props.htmlFor - Input id used for label binding.
 * @param {object} props.imageData - Image metadata and state.
 * @param {'del' | 'save'} props.type - Form mode for styling.
 * @param {string} [props.className] - Optional custom class.
 *
 * @returns {JSX.Element} Image label.
 */
const ImageLabel = ({
  htmlFor,
  imageData,
  type,
  className,
}: ImageLabelProps) => {
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
        type="checkbox"
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
