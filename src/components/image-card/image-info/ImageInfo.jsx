import { useState } from "react";
import classes from "./ImageInfo.module.scss";
import LinkA from "../../ui/LinkA";
import CopySvg from "../../../assets/CopySvg";
import CopiedSvg from "../../../assets/CopiedSvg";

const ImageInfo = ({ imageData }) => {
  const [copied, setCopied] = useState(false);

  const copyHandler = (e) => {
    const seed = e.target.closest(`.${classes.seed}`)?.innerText;
    if (!seed) return;

    navigator.clipboard.writeText(seed);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <>
      <div className={classes["example__config-block"]}>
        {!!imageData?.postId && (
          <div className={classes["example__info-item"]}>
            <span className={classes["example__info-name"]}>Post ID:</span>
            {imageData?.postId}
          </div>
        )}
        {!!imageData?.id && (
          <div className={classes["example__info-item"]}>
            <span className={classes["example__info-name"]}>Image ID:</span>
            {imageData?.id}
          </div>
        )}
        {!!imageData?.meta?.cfgScale && (
          <div className={classes["example__info-item"]}>
            <span className={classes["example__info-name"]}>CFG scale:</span>
            {imageData?.meta?.cfgScale}
          </div>
        )}
        {!!imageData?.meta?.steps && (
          <div className={classes["example__info-item"]}>
            <span className={classes["example__info-name"]}>Steps:</span>
            {imageData?.meta?.steps}
          </div>
        )}
        {!!imageData?.meta?.sampler && (
          <div className={classes["example__info-item"]}>
            <span className={classes["example__info-name"]}>Sampler:</span>
            {imageData?.meta?.sampler}
          </div>
        )}
        {!!imageData?.meta?.seed && (
          <div className={classes["example__info-item"]}>
            <span className={classes["example__info-name"]}>Seed:</span>
            {imageData?.meta?.seed && (
              <span
                className={`${classes.seed} ${
                  copied ? classes["seed--copied"] : ""
                }`}
                onClick={copyHandler}
              >
                {imageData?.meta?.seed}
                {!copied && <CopySvg />}
                {copied && <CopiedSvg />}
              </span>
            )}
          </div>
        )}
        {imageData?.meta?.Model && (
          <div
            className={`${classes["example__info-item"]} ${classes["config__name"]}`}
          >
            <span className={classes["example__info-name"]}>Checkpoint:</span>
            {imageData?.meta?.Model}
          </div>
        )}
        {!!imageData?.meta?.Size && (
          <div className={classes["example__info-item"]}>
            <span className={classes["example__info-name"]}>Size:</span>{" "}
            {imageData?.meta?.Size}
          </div>
        )}
        {!!imageData?.meta?.clipSkip && (
          <div className={classes["example__info-item"]}>
            <span className={classes["example__info-name"]}>Clip Skip:</span>
            {imageData?.meta?.clipSkip}
          </div>
        )}
        {!!imageData?.id && (
          <div
            className={`${classes["example__info-item"]} ${classes["resource__field"]}`}
          >
            <span className={classes["example__info-name"]}>Image source:</span>
            <LinkA
              external={true}
              href={`https://civitai.com/images/${imageData?.id}`}
            >
              civitai
            </LinkA>
          </div>
        )}
      </div>
    </>
  );
};

export default ImageInfo;
