import React, { useEffect, useState } from "react";
import classes from "./CarouselImage.module.scss";

const CarouselImage = ({ id, src, alt, onClick, dataset }) => {
  const [imgIsLoading, setImgIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState("#");

  useEffect(() => {
    if (src) setImgSrc(src);
  }, [src]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
  };

  return (
    <div className={classes.container}>
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
    </div>
  );
};

export default CarouselImage;
