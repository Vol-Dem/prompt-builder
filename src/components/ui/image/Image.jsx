import React, { forwardRef, useEffect, useRef, useState } from "react";
import classes from "./Image.module.scss";
import { useDispatch } from "react-redux";
import { setPreviewImg } from "../../../store/model";
import { ReactComponent as StarImg } from "../../../assets/star.svg";
import useIntersection from "../../../hooks/use-intersection";

const Image = forwardRef(({ id, src, type, alt, onClick }, ref) => {
  const [imgIsLoading, setImgIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState("#");
  const dispatch = useDispatch();
  const imageRef = useRef();
  const imageIsVisible = useIntersection(imageRef);

  useEffect(() => {
    if (imageIsVisible) setImgSrc(src);
  }, [src, imageIsVisible]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
  };

  const imgErrorHandler = () => {
    console.log("ERR");
    // setImgIsLoading(false);
  };

  //   const setPreviwImgHandler = (e) => {
  //     dispatch(setPreviewImg(src));
  //   };
  //   const setNsfwPreviwImgHandler = (e) => {
  //     dispatch(setPreviewImg(src, true));
  //   };

  return (
    <>
      {/* <div className={classes.container} ref={imageRef}>
      {imgIsLoading && <div className={classes.loading}>Loading...</div>}
      <div className={classes.placeholder}></div>
      <img
        className={`${classes.image} ${
          imgIsLoading ? classes["image--hidden"] : ""
        }`}
        onClick={onClick}
        onLoad={imgLoadHandler}
        data-position={dataset}
        id={id}
        src={imgSrc}
        alt={alt}
      />
    </div> */}

      <div className={classes.img} onClick={onClick} ref={imageRef}>
        <span className={classes.type}>{type}</span>

        <img
          ref={ref}
          src={imgSrc}
          alt={alt}
          onLoad={imgLoadHandler}
          //   onError={imgErrorHandler}
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
