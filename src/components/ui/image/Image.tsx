import { useEffect, useRef, useState, type ComponentProps } from "react";
import { AnimatePresence } from "framer-motion";

import classes from "./Image.module.scss";
import {
  SETTINGS_AUTOPLAY_VIDEO,
  SETTINGS_AUTOPLAY_VIDEO_INTERSECTION_MARGIN,
  SETTINGS_IMAGE_INTERSECTION_MARGIN,
  SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
} from "../../../variables/constants";
import ImageFullView from "../ImageFullView";
import ButtonPlay from "../buttons/ButtonPlay";
import { transformSrcPreview } from "../../../utils/imageUtils";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "../../../store/hooks/hooks";
import type { SrcType } from "../../../types/models.types";
import useIntersection from "../../../hooks/use-intersection";

type ImageProps = ComponentProps<"img"> & {
  fullView?: boolean;
  type?: string | null;
  imgType?: SrcType;
  preloader?: boolean;
  imageWidth?: number;
  src?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
};

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
 * @param props
 * @param props.id - Image DOM id / identifier.
 * @param props.fullView - Whether to enable fullscreen viewer on click.
 * @param props.src - Base image or video source URL.
 * @param props.srcSet - Optional responsive source set.
 * @param props.type - MIME type for <source>.
 * @param props.alt - Image alt text.
 * @param props.imageWidth - Requested preview width.
 * @param props.width - Rendered image width.
 * @param props.height - Rendered image height.
 * @param props.className - Optional wrapper class.
 * @param props.imgType - Media type (shows play icon if "video").
 * @param props.preloader - Whether to display loading animation.
 * @param props.onClick - Optional click callback.
 *
 * @returns Media preview.
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
}: ImageProps) => {
  const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
  const [curImageWidth, setCurImageWidth] = useState(imageWidth);
  const [imgIsLoading, setImgIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState("#");
  const [videoSrc, setVideoSrc] = useState({ mp4: "#", webm: "#" });
  const isMobile = useAppSelector((state) => state.general.isMobile);
  const imageRef = useRef<HTMLDivElement>(null);
  const autoplayVideo = !isMobile && SETTINGS_AUTOPLAY_VIDEO;
  const isInersectingVideo = useIntersection(
    autoplayVideo ? imageRef : null,
    false,
    SETTINGS_AUTOPLAY_VIDEO_INTERSECTION_MARGIN,
  );
  const isInersecting = useIntersection(
    imageRef,
    false,
    SETTINGS_IMAGE_INTERSECTION_MARGIN,
  );

  useEffect(() => {
    if (src) {
      const { previewSrc, previewVideoMp4Src, previewVideoWebmSrc } =
        transformSrcPreview(src, imageWidth, imgType);

      setImgError(false);
      setImgIsLoading(true);
      setImgSrc(previewSrc);
      setVideoSrc({
        mp4: previewVideoMp4Src || "#",
        webm: previewVideoWebmSrc || "#",
      });
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

  const clickHandler = (e: React.MouseEvent<HTMLElement>) => {
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
      src={isInersecting ? imgSrc : "#"}
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

  const videoHtml = (
    <video
      width={width}
      height={height}
      playsInline
      autoPlay
      loop
      disablePictureInPicture
      preload="none"
      muted
      poster={imgSrc}
      onLoad={imgLoadHandler}
      onError={imgErrorHandler}
      className={`${classes.video} ${
        width && height && +width - +height < 0
          ? classes["video--portrait"]
          : ""
      } `}
    >
      <source src={videoSrc?.webm} type="video/webm" />
      <source src={videoSrc?.mp4} type="video/mp4" />
    </video>
  );

  let content = imageHtml;

  if (imgType === "video" && autoplayVideo && isInersectingVideo) {
    content = videoHtml;
  }

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
            <PhotoIcon />
          </div>
        )}{" "}
        {srcSet && (
          <picture>
            <source srcSet={srcSet} type={type || "image/webp"} />
            {content}
          </picture>
        )}
        {content}
      </div>
      <AnimatePresence>
        {fullViewIsOpen && src && (
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
