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

const ImageFullView = (props) => {
  const [imgIsLoading, setImgIsLoading] = useState(false);

  const { previewSrc, originalVideoWebmSrc, originalVideoMp4Src } =
    transformSrcPreview(
      props.src,
      SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
      props.type
    );

  useEffect(() => {
    if (props.type !== "video") setImgIsLoading(true);
  }, [props.src]);

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
            onClick={props.onClose}
          ></motion.div>
          <div className={`${classes.modal} ${classes["modal--content"]}`}>
            {props.title && <h2 className={classes.title}>{props.title}</h2>}
            {imgIsLoading && (
              <div className={classes["spiner-container"]}>
                <Spinner size="medium" />
              </div>
            )}
            {props.type !== "video" && (
              <motion.img
                layout
                layoutId={props?.src}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 30 },
                }}
                initial="hidden"
                animate="visible"
                exit="exit"
                src={props?.src}
                alt={props?.alt || "image-full"}
                className={`${classes.img} ${
                  imgIsLoading ? classes["img--hidden"] : ""
                }`}
                onLoad={imgLoadHandler}
              />
            )}
            {props.type === "video" && (
              <video
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
            {props.children}
          </div>
          <div className={classes["modal__close"]} onClick={props.onClose}>
            <CrossSvg />
          </div>
          {props.prevSlide && props?.controls && (
            <div
              className={`${classes["btn-slide"]} ${classes["btn-slide--next"]}`}
              onClick={props.prevSlide}
            >
              <ArrowLeftSvg />
            </div>
          )}
          {props.nextSlide && props?.controls && (
            <div
              onClick={props.nextSlide}
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
