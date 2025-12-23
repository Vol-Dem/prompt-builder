import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { SETTINGS_PROMPT_BREAK_ALIASES } from "../../../../variables/constants";
import classes from "./TagsTextareaItem.module.scss";
import { promptActions } from "../../../../store/prompt";
import TagsTextareaItemEdit from "../tags-textarea-item-edit/TagsTextareaItemEdit";

const inputControlsWidth = 165;

const TagsTextareaItem = ({
  item,
  promptType,
  containerWidth,
  onEdit,
  onDragOver,
  onDragLeave,
  onDragEnd,
}) => {
  const [isDragged, setIsDragged] = useState(false);
  const [inputWidth, setInputWidth] = useState(null);
  const lastTagRef = useRef(null);
  const isBreak = SETTINGS_PROMPT_BREAK_ALIASES.includes(item.tag.trim());
  const dispatch = useDispatch();

  useEffect(() => {
    if (lastTagRef.current)
      lastTagRef.current.scrollIntoView({
        behavior: "smooth",
      });
  }, [lastTagRef]);

  const startEditHandler = (e) => {
    const tagWidth = e.target.offsetWidth;
    const maxInputWidth = Math.round(containerWidth - inputControlsWidth);
    const newInputWidth = tagWidth < maxInputWidth ? tagWidth : maxInputWidth;

    setInputWidth(newInputWidth);

    onEdit(item.id);
  };

  const removeTagHandler = (value) => {
    dispatch(
      promptActions.removeTag({
        ...JSON.parse(value),
        type: promptType,
      })
    );
  };

  const dragStartHandler = (e) => {
    setIsDragged(true);

    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ ...item, type: promptType })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverHandler = (e) => {
    e.preventDefault();
    const targetTagContainer = e.target.closest(`.${classes["tag-container"]}`);
    if (!targetTagContainer) return;

    const targetContainerWidth = targetTagContainer.offsetWidth;
    const targetContainerLeft = Math.round(
      targetTagContainer.getBoundingClientRect().left
    );
    const isLeftSide =
      targetContainerWidth / 2 + targetContainerLeft > e.clientX;

    onDragOver(e, item.id, isLeftSide);
  };

  return (
    <li key={item.id} className={classes["tag-wrap"]}>
      <motion.span
        ref={lastTagRef}
        layout
        layoutId={`t-${item.id}`}
        initial={{ opacity: 0, scale: 0.8 }}
        variants={{
          hidden: { opacity: 0, scale: 0.5 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring" },
          },
        }}
        animate="visible"
        exit={{ y: -30, x: 30, opacity: 0, scale: 0.5 }}
        className={`${classes["tag-container"]} ${
          item.dropLeft !== null && item.dropLeft ? classes["drop-left"] : ""
        } ${
          item.dropLeft !== null && !item.dropLeft ? classes["drop-right"] : ""
        } tagcont`}
        onDragOver={onDragOverHandler}
        onDragLeave={onDragLeave}
        data-item={JSON.stringify({ ...item, type: promptType })}
      >
        <div
          className={`${classes.tag} ${
            !item.duplicateId
              ? ""
              : classes[`tag--duplicate-${item.duplicateId}`]
          } ${isBreak ? classes["tag--break"] : ""} ${
            isDragged ? classes["tag__dragged"] : ""
          }`}
          draggable={!item.edit ? "true" : "false"}
          onDragStart={dragStartHandler}
          onDragEnd={(e) => {
            setIsDragged(false);
            onDragEnd();
          }}
        >
          <>
            {!item.edit && (
              <div className={classes["tag__content"]}>
                <span
                  onClick={startEditHandler}
                  className={classes["tag__text"]}
                >
                  {item.tag.trim()}
                </span>
                <button
                  type="button"
                  className={classes.btn}
                  onClick={() => removeTagHandler(JSON.stringify(item))}
                >
                  <span className={classes["tag__cross"]}>
                    <XMarkIcon />
                  </span>
                </button>
              </div>
            )}
            {item.edit && (
              <TagsTextareaItemEdit
                item={item}
                promptType={promptType}
                inputWidth={inputWidth}
              />
            )}
          </>
        </div>
      </motion.span>
      {SETTINGS_PROMPT_BREAK_ALIASES.includes(item.tag.trim()) && (
        <hr className={classes["divider"]}></hr>
      )}
    </li>
  );
};

export default TagsTextareaItem;
