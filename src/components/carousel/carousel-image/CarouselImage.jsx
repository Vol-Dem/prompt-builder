import React, { useRef, useState } from "react";
import classes from "./CarouselImage.module.scss";

const CarouselImage = ({ id, src, url, alt, onClick, onLoad, onHeight }) => {
  const [imgIsLoading, setImgIsLoading] = useState(true);
  const imageRef = useRef();

  const imgLoadHandler = () => {
    onLoad();
    setImgIsLoading(false);
    onHeight(imageRef.current.clientHeight);
    // console.log(imageRef.current.clientHeight);
    // console.log(imageRef.current.complete);
  };

  return (
    <div className={classes.container}>
      {true && <div className={classes.placeholder}></div>}
      <img
        className={`${classes.image} ${
          imgIsLoading ? classes["image--hidden"] : ""
        }`}
        ref={imageRef}
        onClick={onClick}
        onLoad={imgLoadHandler}
        id={id}
        src={src}
        alt={alt}
      />
    </div>
  );
};

export default CarouselImage;
