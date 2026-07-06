import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, type HTMLMotionProps } from "framer-motion";

import classes from "./ImageFullView.module.scss";
import Spinner from "./Spinner";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_BIG } from "../../variables/constants";
import { transformSrcPreview } from "../../utils/imageUtils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { SrcType } from "../../types/models.types";

type ImageFullViewProps = HTMLMotionProps<"img"> & {
  type?: SrcType;
  onClose?: () => void;
  nextSlide?: () => void;
  prevSlide?: () => void;
  controls?: boolean;
  src: string;
};

/**
 * ImageFullView component.
 *
 * Renders a fullscreen modal viewer for images or videos
 * with optional navigation controls.
 *
 * Responsibilities:
 * - Displays optimized full-size media.
 * - Shows loading spinner for images.
 * - Renders HTML5 video with multiple sources.
 * - Supports previous/next navigation.
 * - Closes when backdrop or close button is clicked.
 *
 * @component
 *
 * @param props
 * @param props.src - Base image or video source URL.
 * @param props.alt - Image alt text.
 * @param props.type - Media type.
 * @param props.controls - Whether navigation controls are enabled.
 * @param props.nextSlide - Callback for next media item.
 * @param props.prevSlide - Callback for previous media item.
 * @param props.onClose - Callback triggered to close the viewer.
 *
 * @returns Fullscreen media viewer.
 */
const ImageFullView = ({
  src,
  type,
  onClose,
  alt,
  nextSlide,
  prevSlide,
  controls,
}: ImageFullViewProps) => {
  const [imgIsLoading, setImgIsLoading] = useState(false);

  const { previewSrc, originalVideoWebmSrc, originalVideoMp4Src } =
    transformSrcPreview(src, SETTINGS_IMAGE_PREVIEW_WIDTH_BIG, type);

  useEffect(() => {
    if (type !== "video") setImgIsLoading(true);
  }, [src, type]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
  };

  return (
    <>
      {createPortal(
        <div>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${classes.modal} ${classes["modal--backdrop"]}`}
            onClick={onClose}
          ></motion.div>
          <div className={`${classes.modal} ${classes["modal--content"]}`}>
            {imgIsLoading && (
              <div className={classes["spiner-container"]}>
                <Spinner size="medium" />
              </div>
            )}
            {type !== "video" && (
              <motion.img
                layout
                layoutId={src}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 30 },
                }}
                initial="hidden"
                animate="visible"
                exit="exit"
                src={src}
                alt={alt || "image-full"}
                className={`${classes.img} ${
                  imgIsLoading ? classes["img--hidden"] : ""
                }`}
                onLoad={imgLoadHandler}
              />
            )}
            {type === "video" && (
              <video
                key={originalVideoWebmSrc}
                playsInline
                autoPlay
                // autostart={1}
                loop
                disablePictureInPicture
                preload="none"
                muted
                controls
                poster={previewSrc}
                className={`${classes.img}`}
              >
                <source src={originalVideoWebmSrc} type="video/webm" />
                <source src={originalVideoMp4Src} type="video/mp4" />
              </video>
            )}
          </div>
          <div className={classes["modal__close"]} onClick={onClose}>
            <XMarkIcon />
          </div>
          {prevSlide && controls && (
            <div
              className={`${classes["btn-slide"]} ${classes["btn-slide--next"]}`}
              onClick={prevSlide}
            >
              <ChevronLeftIcon />
            </div>
          )}
          {nextSlide && controls && (
            <div
              onClick={nextSlide}
              className={`${classes["btn-slide"]} ${classes["btn-slide--prev"]}`}
            >
              <ChevronRightIcon />
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};

export default ImageFullView;
