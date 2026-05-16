import React, { useState } from "react";

import TagsTextarea from "../tags-textarea/TagsTextarea";
import PromptButtonCopy from "../prompt-button-copy/PromptButtonCopy";
import classes from "./PromptField.module.scss";
import { useAppSelector } from "../../../store/hooks/hooks";
import type { PromptType } from "../../../types/prompt.types";

type PromptFieldProps = {
  promptType: PromptType;
  placeholderText: string;
  placeholderTags: string;
  aditionalPlacegholder?: string;
  minHeight: number;
  maxHeight: number;
  prompt: string;
  promptHandler: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPromptResize: () => void;
};

/**
 * Prompt field container.
 *
 * Displays either a text textarea or a tag-based editor depending
 * on the current prompt mode.
 *
 * Responsibilities:
 * - Switches between text and tag views.
 * - Manages resizable field height.
 * - Notifies parent when layout size changes.
 *
 * @component
 *
 * @param props
 * @param props.promptType - Prompt channel this field controls.
 * @param props.placeholderText - Placeholder for the text-mode textarea.
 * @param props.placeholderTags - Placeholder for the tag-mode editor.
 * @param props.aditionalPlacegholder - Secondary helper placeholder (tags mode).
 * @param props.minHeight - Minimum resizable height in pixels.
 * @param props.maxHeight -  Maximum resizable height in pixels.
 * @param props.prompt - Current prompt string from Redux.
 * @param props.promptHandler - Callback to update the prompt string in Redux.
 * @param props.onPromptResize - Notifies parent that the field height changed.
 *
 * @returns Prompt field UI.
 */
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
}: PromptFieldProps) => {
  const [promptHeight, setPromptHeight] = useState(minHeight);
  const promptTextMode = useAppSelector((state) => state.prompt.isTextMode);

  const onMouseDown = (
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<Element>,
  ) => {
    const startHeight = promptHeight;
    let startY: number;

    if ("touches" in e) {
      startY = e.touches[0].clientY;
    } else {
      startY = e.clientY;
    }

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      let moveEventY: number;

      if ("touches" in moveEvent) {
        moveEventY = moveEvent.touches[0].clientY;
      } else {
        moveEventY = moveEvent.clientY;
      }

      const newHeight = clamp(
        startHeight + (moveEventY - startY),
        minHeight,
        maxHeight,
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

  const clamp = (x: number, min: number, max: number) => {
    return Math.min(Math.max(x, min), max);
  };

  return (
    <div className={`${classes.field}`}>
      <div
        className={`${classes.prompt}`}
        style={{
          height: `${promptHeight}px`,
        }}
      >
        {!promptTextMode && (
          <TagsTextarea
            aditionalPlacegholder={aditionalPlacegholder}
            promptType={promptType}
            placeholder={placeholderTags}
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
