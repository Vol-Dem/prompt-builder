import React, { forwardRef, useEffect, useRef, useState } from "react";
import classes from "./Image.module.scss";
import ImageSvg from "../../../assets/ImageSvg";
import { transformSrcPreview } from "../../../utils/generalUtils";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM } from "../../../variables/constants";

const Image = forwardRef(
  (
    {
      id,
      src,
      alt,
      onClick,
      className,
      type = "image",
      preloader = true,
      imageWidth = SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
    },
    ref
  ) => {
    const [imgIsLoading, setImgIsLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    // const [imgIsLoaded, setiImgIsLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState("#");
    const imageRef = useRef();
    const imageIsVisible = true;

    useEffect(() => {
      // if (!imgIsLoaded) setImgIsLoading(true);
      if (imageIsVisible && src) {
        const { previewSrc } = transformSrcPreview(src, imageWidth, type);

        setImgError(false);
        setImgIsLoading(true);
        setImgSrc(previewSrc);
      }
    }, [src, imageIsVisible, imageWidth]);

    const imgLoadHandler = () => {
      setImgIsLoading(false);
      // setiImgIsLoaded(true);
      setImgError("");
    };

    const imgErrorHandler = () => {
      // console.log("ERRR");
      setImgIsLoading(false);
      setImgError(true);
    };

    return (
      <>
        <div
          className={`${classes.img} ${className || ""}`}
          onClick={onClick}
          ref={imageRef}
          id={id}
        >
          {/* {type && <span className={classes.type}>{type}</span>} */}
          {preloader && (
            <div className={classes.preloader}>
              <ImageSvg />
            </div>
          )}
          <img
            style={{
              // width: `${width}px` || null,
              width: `auto` || null,
              // height: `${height}px` || null,
            }}
            ref={ref}
            src={imgSrc}
            alt={alt}
            onLoad={imgLoadHandler}
            onError={imgErrorHandler}
            className={`${
              (imgIsLoading || imgError) && preloader
                ? classes["img--hidden"]
                : ""
            }`}
          />
        </div>
      </>
    );
  }
);

export default Image;
