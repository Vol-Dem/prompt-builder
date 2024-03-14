import React, { useEffect, useState } from "react";
import classes from "./CarouselImage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setPreviewImg } from "../../../store/model";

const CarouselImage = ({ id, src, alt, onClick, dataset }) => {
  const [imgIsLoading, setImgIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState("#");
  const dispatch = useDispatch();
  const model = useSelector((state) => state.model.model);

  useEffect(() => {
    // if (imgError) setImgIsLoading(true);
    if (src) setImgSrc(src);
  }, [src]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
  };

  const imgErrorHandler = () => {
    setImgError(true);
    setImgIsLoading(false);
  };

  const setPreviwImgHandler = (e) => {
    dispatch(setPreviewImg(src, false));
  };
  const setNsfwPreviwImgHandler = (e) => {
    console.log(model.data.type);
    dispatch(setPreviewImg(src, true));
  };

  return (
    <div className={classes.container}>
      {imgIsLoading && <div className={classes.loading}>Loading...</div>}
      {imgError && (
        <div
          className={classes.placeholder}
          onClick={onClick}
          data-position={dataset}
        ></div>
      )}
      {!imgError && imgSrc !== "#" && (
        <>
          <img
            className={`${classes.image} ${
              imgIsLoading ? classes["image--hidden"] : ""
            }`}
            onClick={onClick}
            onLoad={imgLoadHandler}
            onError={imgErrorHandler}
            data-position={dataset}
            id={id}
            src={imgSrc}
            alt={alt}
          />
          <span
            className={`${classes["btn__set"]} ${classes["btn__set--previw"]}`}
            onClick={setPreviwImgHandler}
          >
            Set
          </span>
          <span
            className={`${classes["btn__set"]} ${classes["btn__set--nsfw-previw"]}`}
            onClick={setNsfwPreviwImgHandler}
          >
            Set H
          </span>
        </>
      )}
    </div>
  );
};

export default CarouselImage;
