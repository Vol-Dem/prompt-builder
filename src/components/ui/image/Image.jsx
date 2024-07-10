import React, { forwardRef, useEffect, useRef, useState } from "react";
import classes from "./Image.module.scss";
import { ReactComponent as StarImg } from "../../../assets/star.svg";
import useIntersection from "../../../hooks/use-intersection";
import ImageSvg from "../../../assets/ImageSvg";

const Image = forwardRef(({ id, src, type, alt, onClick, className }, ref) => {
  const [imgIsLoading, setImgIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgIsLoaded, setiImgIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState("#");
  const imageRef = useRef();
  const imageIsVisible = true;
  // const imageIsVisible = useIntersection(imageRef);

  useEffect(() => {
    // if (!imgIsLoaded) setImgIsLoading(true);
    if (imageIsVisible) {
      setImgError(false);
      setImgIsLoading(true);
      setImgSrc(src);
    }
  }, [src, imageIsVisible]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
    setiImgIsLoaded(true);
    setImgError("");
  };

  const imgErrorHandler = () => {
    console.log("ERRR");
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
        {type && <span className={classes.type}>{type}</span>}
        <div className={classes.preloader}>
          {/* <StarImg /> */}
          <ImageSvg />
        </div>
        <img
          ref={ref}
          src={imgSrc}
          alt={alt}
          onLoad={imgLoadHandler}
          onError={imgErrorHandler}
          className={`${
            // imgIsLoading ? classes["img--hidden"] : ""
            imgIsLoading || imgError ? classes["img--hidden"] : ""
          }`}
        />
      </div>
    </>
  );
});

export default Image;
