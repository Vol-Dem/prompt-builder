// import React, { useState } from "react";
import classes from "./ImageCard.module.scss";
import TagList from "../tag-list/TagList";
import { useDispatch } from "react-redux";
import { promptActions } from "../../store/prompt";

const ImageCard = ({ imageData, imgIsOpen, openImg, currImgId, closeImg }) => {
  // const [infoIsOpen, setInfoIsOpen] = useState(false);
  const dispatch = useDispatch();

  //   const openInfoHandler = (e) => {
  //     setInfoIsOpen((prevState) => !prevState);
  //   };
  const positiveHtml = imageData.meta?.prompt
    ?.split(",")
    ?.flatMap((tag) => tag.trim() || []);
  const negativeHtml = imageData.meta?.negativePrompt
    ?.split(",")
    ?.flatMap((tag) => tag.trim() || []);

  const copyAllPromptHandler = (e) => {
    const promt = imageData.meta[e.target.id];
    navigator.clipboard.writeText(promt);
  };

  const addAllPromptHandler = (e) => {
    const promt = imageData.meta[e.target.id];
    if (e.target.dataset.type === "positive") {
      dispatch(
        promptActions.addAllTagToPrompt({ type: "positive", value: promt })
      );
    }
    if (e.target.dataset.type === "negative") {
      dispatch(
        promptActions.addAllTagToPrompt({ type: "negative", value: promt })
      );
    }
  };

  const copyHandler = (e) => {
    navigator.clipboard.writeText(e.target.innerText);
  };

  return (
    <>
      {/* {(!imgIsOpen || currImgId === imageData.hash) && ( */}
      <div className={classes.example}>
        <div className={classes["example__info"]}>
          {/* <div className={classes["example__img"]} onClick={closeImg}>
            <img id={imageData.hash} src={imageData.url} alt="" />
          </div> */}

          <>
            <div className={classes["example__prompt"]}>
              <div>
                Positive prompt:
                <button
                  id="prompt"
                  onClick={copyAllPromptHandler}
                  className={classes["btn-copy"]}
                >
                  Copy all
                </button>
                <button
                  id="prompt"
                  onClick={addAllPromptHandler}
                  className={classes["btn-copy"]}
                  data-type="positive"
                >
                  Add all
                </button>
              </div>
              {/* <div>{imageData.meta?.prompt || ""}</div> */}
              <TagList
                tags={positiveHtml}
                promptType="positive"
                className={classes["tags__list"]}
              />
              <div>
                Negative prompt:
                <button
                  id="negativePrompt"
                  onClick={copyAllPromptHandler}
                  className={classes["btn-copy"]}
                >
                  Copy all
                </button>
                <button
                  id="negativePrompt"
                  data-type="negative"
                  onClick={addAllPromptHandler}
                  className={classes["btn-copy"]}
                >
                  Add all
                </button>
              </div>
              {/* <div>{imageData.meta?.negativePrompt || ""}</div> */}
              <TagList
                tags={negativeHtml}
                promptType="negative"
                className={classes["tags__list"]}
              />
            </div>
            <div className={classes["example__config"]}>
              <button onClick={closeImg}>Close</button>
              <div>CFG scale: {imageData.meta?.cfgScale}</div>
              <div>Steps : {imageData.meta?.steps}</div>
              <div>Sampler : {imageData.meta?.sampler}</div>
              <div>
                Seed :
                <span className={classes.seed} onClick={copyHandler}>
                  {imageData.meta?.seed}
                </span>
              </div>
              <div className={classes["config__name"]}>
                Model : {imageData.meta?.Model}
              </div>
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
