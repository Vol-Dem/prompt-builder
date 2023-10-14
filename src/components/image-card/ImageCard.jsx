import React, { useState } from "react";
import classes from "./ImageCard.module.scss";

const ImageCard = ({ imageData, imgIsOpen, openImg, currImgId, closeImg }) => {
  const [infoIsOpen, setInfoIsOpen] = useState(false);

  //   const openInfoHandler = (e) => {
  //     setInfoIsOpen((prevState) => !prevState);
  //   };

  return (
    <>
      {/* {(!imgIsOpen || currImgId === imageData.hash) && ( */}
      <div className={classes.example}>
        <div className={classes["example__info"]}>
          <div className={classes["example__img"]} onClick={closeImg}>
            <img id={imageData.hash} src={imageData.url} alt="" />
          </div>

          <>
            <div className={classes["example__prompt"]}>
              <div>Positive prompt: </div>
              <div>{imageData.meta?.prompt || ""}</div>
              <div>Negative prompt: </div>
              <div>{imageData.meta?.negativePrompt || ""}</div>
            </div>
            <div className={classes["example__config"]}>
              <button onClick={closeImg}>Close</button>
              <div>CFG scale: {imageData.meta?.cfgScale}</div>
              <div>Steps : {imageData.meta?.steps}</div>
              <div>Sampler : {imageData.meta?.sampler}</div>
              <div>Seed : {imageData.meta?.seed}</div>
              <div>Model : {imageData.meta?.Model}</div>
              <div>Size: {imageData.meta?.Size}</div>
              <div>Clip Skip: {imageData.meta?.clipSkip}</div>
            </div>
          </>
        </div>
      </div>
      {/* )} */}
    </>
  );
};

export default ImageCard;
