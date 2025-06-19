import React, { forwardRef, useEffect, useRef, useState } from "react";
import classes from "./Image.module.scss";
import ImageSvg from "../../../assets/ImageSvg";
import { transformSrcPreview } from "../../../utils/generalUtils";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM } from "../../../variables/constants";
import { AnimatePresence } from "framer-motion";
import ImageFullView from "../ImageFullView";
import useIntersection from "../../../hooks/use-intersection";

const Image = forwardRef(
  (
    {
      id,
      fullView,
      src,
      srcSet,
      alt,
      onClick,
      className,
      type = "image/webp",
      preloader = true,
      imageWidth = SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
      width,
      height,
      children,
      ...props
    },
    ref
  ) => {
    const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
    const [imgIsLoading, setImgIsLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    // const [imgIsLoaded, setiImgIsLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState("#");
    const imageRef = useRef();
    // const intersecting = useIntersection(imageRef, true);
    // const imageIsVisible = true;

    useEffect(() => {
      // console.log(intersecting);
      // if (!imgIsLoaded) setImgIsLoading(true);
      if (src) {
        const { previewSrc } = transformSrcPreview(src, imageWidth, "image");

        setImgError(false);
        setImgIsLoading(true);
        setImgSrc(previewSrc);
      } else {
        setImgSrc("#");
      }
    }, [src, imageWidth]);

    const imgLoadHandler = () => {
      setImgIsLoading(false);
      // setiImgIsLoaded(true);
      setImgError(false);
    };

    const imgErrorHandler = () => {
      // console.log("ERRR");
      setImgIsLoading(false);
      setImgError(true);
    };

    const clickHandler = (e) => {
      if (fullView) {
        console.log(children);
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
        // loading="lazy"
        style={
          {
            // width: `auto` || null,
          }
        }
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
          {/* {type && <span className={classes.type}>{type}</span>} */}
          {preloader && (
            <div
              className={`${classes.preloader} ${
                !imgIsLoading && !imgError ? classes.hidden : ""
              }`}
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
  }
);

export default Image;
