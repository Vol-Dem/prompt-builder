import { useSelector } from "react-redux";
import TagsTextarea from "../../ui/tags-textarea/TagsTextarea";
import PromptButtonCopy from "../prompt-button-copy/PromptButtonCopy";
import classes from "./PromptField.module.scss";
import { useState } from "react";

const PromptField = ({
  promptType,
  placeholderText,
  placeholderTags,
  aditionalPlacegholder,
  minHeight,
  maxHeight,
  prompt,
  promptHandler,
  onPromptResize,
}) => {
  const [promptHeight, setPromptHeight] = useState(minHeight);
  const promptTextMode = useSelector((state) => state.prompt.isTextMode);

  const onMouseDown = (e) => {
    const startHeight = promptHeight;
    const startY = e.clientY || e.touches[0].clientY;

    const onMouseMove = (moveEvent) => {
      const moveEventY = moveEvent.clientY || moveEvent.touches[0].clientY;
      const newHeight = clamp(
        startHeight + (moveEventY - startY),
        minHeight,
        maxHeight
      );

      setPromptHeight(newHeight);
      onPromptResize();
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onMouseMove);
    window.addEventListener("touchend", onMouseUp);
  };

  const clamp = (x, min, max) => {
    return Math.min(Math.max(x, min), max);
  };

  return (
    <div className={`${classes.field} ${classes["field--neg"]}`}>
      <div
        className={`${classes.prompt} ${classes["prompt--neg"]}`}
        style={{
          height: `${promptHeight}px`,
        }}
      >
        {!promptTextMode && (
          <TagsTextarea
            aditionalPlacegholder={aditionalPlacegholder}
            promptType={promptType}
            placeholder={placeholderTags}
            className={`${classes["tagarea"]} ${classes["tagarea--neg"]}`}
          />
        )}
        {promptTextMode && (
          <textarea
            placeholder={placeholderText}
            onChange={promptHandler}
            value={prompt}
            className={`${classes["prompt__textarea"]}`}
          ></textarea>
        )}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          className={classes["prompt__resize-box"]}
        ></div>
      </div>
      <PromptButtonCopy promptData={prompt} />
    </div>
  );
};

export default PromptField;
