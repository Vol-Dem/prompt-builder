import { forwardRef, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

import classes from "./Image.module.scss";
import ImageSvg from "../../../assets/ImageSvg";
import {
  SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
} from "../../../variables/constants";
import ImageFullView from "../ImageFullView";
import ButtonPlay from "../buttons/ButtonPlay";
import { transformSrcPreview } from "../../../utils/imageUtils";

/**
 * Image component.
 *
 * Renders an optimized image or video preview with optional
 * fullscreen viewer support.
 *
 * Video handling:
 * - Displays a play icon when `imgType="video"`.
 * - Resolves video poster and formats via `transformSrcPreview`.
 *
 * Behavior:
 * - Shows a preloader while media is loading.
 * - Falls back to a larger image size on load error.
 * - Opens fullscreen viewer when `fullView` is enabled.
 *
 * Responsibilities:
 * - Generates optimized preview URLs.
 * - Manages loading and error states.
 * - Displays a video indicator when needed.
 *
 * @component
 *
 * @param {Object} props
 * @param {string | number} props.id - Image DOM id / identifier.
 * @param {boolean} props.fullView - Whether to enable fullscreen viewer on click.
 * @param {string} props.src - Base image or video source URL.
 * @param {string} [props.srcSet] - Optional responsive source set.
 * @param {string} [props.type='image/webp'] - MIME type for <source>.
 * @param {string} [props.alt] - Image alt text.
 * @param {number} [props.imageWidth=SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM] - Requested preview width.
 * @param {number} props.width - Rendered image width.
 * @param {number} props.height - Rendered image height.
 * @param {string} [props.className] - Optional wrapper class.
 * @param {('image' | 'video')} [props.imgType='image'] - Media type (shows play icon if "video").
 * @param {boolean} [props.preloader=true] - Whether to display loading animation.
 * @param {(e: React.MouseEvent) => void} [props.onClick] - Optional click callback.
 *
 * @returns {JSX.Element} Media preview.
 */
const Image = ({
  id,
  fullView,
  src,
  srcSet,
  alt,
  onClick,
  className,
  type = "image/webp",
  imgType = "image",
  preloader = true,
  imageWidth = SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
  width,
  height,
  ref,
  ...props
}) => {
  const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
  const [curImageWidth, setCurImageWidth] = useState(imageWidth);
  const [imgIsLoading, setImgIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState("#");
  const imageRef = useRef();

  useEffect(() => {
    if (src) {
      const { previewSrc } = transformSrcPreview(src, imageWidth, imgType);

      setImgError(false);
      setImgIsLoading(true);
      setImgSrc(previewSrc);
    } else {
      setImgSrc("#");
    }
  }, [src, imageWidth, imgType]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
    setImgError(false);
  };

  const imgErrorHandler = () => {
    if (
      curImageWidth === SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL &&
      src &&
      src !== "#"
    ) {
      const { previewSrc } = transformSrcPreview(
        src,
        SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
        imgType,
      );
      setImgSrc(previewSrc);
      setCurImageWidth(SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM);
    } else {
      setImgIsLoading(false);
      setImgError(true);
    }
  };

  const clickHandler = (e) => {
    if (fullView) {
      setFullViewIsOpen(true);
    }
    if (onClick) {
      onClick(e);
    }
  };

  const imageHtml = (
    <img
      width={width}
      height={height}
      ref={ref}
      src={imgSrc}
      alt={alt || `image-${id || ""}`}
      onLoad={imgLoadHandler}
      onError={imgErrorHandler}
      className={`${classes.image} ${
        (imgIsLoading || imgError) && preloader
          ? classes["image-container--hidden"]
          : ""
      }`}
      {...props}
    />
  );

  return (
    <>
      <div
        className={`${classes["image-container"]} ${className || ""}`}
        onClick={clickHandler}
        ref={imageRef}
        id={id}
      >
        {imgType === "video" && <ButtonPlay />}
        {preloader && (
          <div
            className={`${classes.preloader} ${
              imgIsLoading && !imgError ? classes["preloader--loading"] : ""
            } ${!imgIsLoading && !imgError ? classes.hidden : ""}`}
          >
            <ImageSvg />
          </div>
        )}{" "}
        {srcSet && (
          <picture>
            <source srcSet={srcSet} type={type} />
            {imageHtml}
          </picture>
        )}
        {!srcSet && imageHtml}
      </div>
      <AnimatePresence>
        {fullViewIsOpen && (
          <ImageFullView
            src={src}
            onClose={() => {
              setFullViewIsOpen(false);
            }}
          ></ImageFullView>
        )}
      </AnimatePresence>
    </>
  );
};

export default Image;
