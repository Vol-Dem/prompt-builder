import { useEffect, useState } from "react";
import classes from "./ImageFullView.module.scss";
import { createPortal } from "react-dom";
import ArrowLeftSvg from "../../assets/ArrowLeft";
import ArrowRightSvg from "../../assets/ArrowRight";
import CrossSvg from "../../assets/CrossSvg";
import Spinner from "./Spinner";
import { motion } from "framer-motion";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_BIG } from "../../variables/constants";
import { transformSrcPreview } from "../../utils/generalUtils";

const ImageFullView = ({
  src,
  type,
  onClose,
  title,
  alt,
  children,
  nextSlide,
  prevSlide,
  controls,
}) => {
  const [imgIsLoading, setImgIsLoading] = useState(false);
  console.log(src);
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
            {title && <h2 className={classes.title}>{title}</h2>}
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
                autostart={1}
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
            {children}
          </div>
          <div className={classes["modal__close"]} onClick={onClose}>
            <CrossSvg />
          </div>
          {prevSlide && controls && (
            <div
              className={`${classes["btn-slide"]} ${classes["btn-slide--next"]}`}
              onClick={prevSlide}
            >
              <ArrowLeftSvg />
            </div>
          )}
          {nextSlide && controls && (
            <div
              onClick={nextSlide}
              className={`${classes["btn-slide"]} ${classes["btn-slide--prev"]}`}
            >
              <ArrowRightSvg />
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default ImageFullView;
