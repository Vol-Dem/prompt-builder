import React, { forwardRef, useEffect, useRef, useState } from "react";
import classes from "./Image.module.scss";
import { ReactComponent as StarImg } from "../../../assets/star.svg";
import useIntersection from "../../../hooks/use-intersection";

const Image = forwardRef(({ id, src, type, alt, onClick }, ref) => {
  const [imgIsLoading, setImgIsLoading] = useState(true);
  const [imgError, setImgError] = useState(true);
  const [imgSrc, setImgSrc] = useState("#");
  const imageRef = useRef();
  const imageIsVisible = useIntersection(imageRef);

  useEffect(() => {
    if (imgError) setImgIsLoading(true);
    if (imageIsVisible) setImgSrc(src);
  }, [src, imageIsVisible, imgError]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
  };

  const imgErrorHandler = () => {
    setImgIsLoading(false);
    setImgError(true);
  };

  return (
    <>
      <div className={classes.img} onClick={onClick} ref={imageRef}>
        <span className={classes.type}>{type}</span>

        <img
          ref={ref}
          src={imgSrc}
          alt={alt}
          onLoad={imgLoadHandler}
          onError={imgErrorHandler}
          className={`${imgIsLoading ? classes["img--hidden"] : ""}`}
        />

        {imgIsLoading && (
          <div className={classes.preloader}>
            <StarImg />
          </div>
        )}
      </div>
    </>
  );
});

export default Image;
