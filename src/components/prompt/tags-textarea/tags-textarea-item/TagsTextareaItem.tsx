import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";

import { SETTINGS_PROMPT_BREAK_ALIASES } from "../../../../variables/constants";
import classes from "./TagsTextareaItem.module.scss";
import { promptActions } from "../../../../store/prompt";
import TagsTextareaItemEdit from "../tags-textarea-item-edit/TagsTextareaItemEdit";
import type { PromptItem, PromptType } from "../../../../types/prompt.types";
import { useAppDispatch } from "../../../../store/hooks/hooks";

const inputControlsWidth = 165;

type TagsTextareaItemProps = {
  item: PromptItem;
  promptType: PromptType;
  containerWidth?: number;
  onEdit: (id: number) => void;
  onDragOver: (e: DragEvent, id: number, isLeftSide: boolean | null) => void;
  onDragLeave: () => void;
  onDragEnd: () => void;
};

/**
 * Interactive prompt tag.
 *
 * Represents one prompt token with drag, edit and delete support.
 *
 * Responsibilities:
 * - Enables drag & drop.
 * - Switches to edit mode.
 * - Detects BREAK tags.
 * - Visually indicates drop position.
 *
 * @component
 *
 * @param props
 * @param props.promptType - Prompt channel this tag belongs to.
 * @param props.item - Tag model from Redux (id, tag, position, weight, etc).
 * @param props.containerWidth - Width of the parent container in pixels.
 * @param props.onEdit - Activates edit mode for the given tag.
 * @param props.onDragOver - Reports drag position relative to this tag.
 * @param props.onDragLeave - Clears drop indicators.
 * @param props.onDragEnd - Resets drag state after drop.
 *
 * @returns Tag UI element.
 */
const TagsTextareaItem = ({
  item,
  promptType,
  containerWidth = 80,
  onEdit,
  onDragOver,
  onDragLeave,
  onDragEnd,
}: TagsTextareaItemProps) => {
  const [isDragged, setIsDragged] = useState(false);
  const [inputWidth, setInputWidth] = useState<number | null>(null);
  const lastTagRef = useRef<HTMLSpanElement>(null);
  // Check if current tag is special "BREAK" tag.
  const isBreak = SETTINGS_PROMPT_BREAK_ALIASES.includes(item.tag.trim());
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (lastTagRef.current)
      lastTagRef.current.scrollIntoView({
        behavior: "smooth",
      });
  }, [lastTagRef]);

  const startEditHandler = (e: MouseEvent<HTMLSpanElement>) => {
    if (!(e.target instanceof HTMLElement)) return;

    const tagWidth = e.target.offsetWidth;
    const maxInputWidth = Math.round(containerWidth - inputControlsWidth);
    const newInputWidth = tagWidth < maxInputWidth ? tagWidth : maxInputWidth;

    setInputWidth(newInputWidth);

    onEdit(item.id);
  };

  const removeTagHandler = (value: string) => {
    dispatch(
      promptActions.removeTag({
        ...JSON.parse(value),
        type: promptType,
      }),
    );
  };

  const dragStartHandler = (e: DragEvent<HTMLDivElement>) => {
    setIsDragged(true);

    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ ...item, type: promptType }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverHandler = (e: DragEvent<HTMLSpanElement>) => {
    e.preventDefault();

    if (!(e.target instanceof Element)) return;

    const targetTagContainer = e.target.closest(
      `.${classes["tag-container"]}`,
    ) as HTMLElement;

    if (!targetTagContainer) return;

    const targetContainerWidth = targetTagContainer.offsetWidth;
    const targetContainerLeft = Math.round(
      targetTagContainer.getBoundingClientRect().left,
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
          onDragEnd={() => {
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
                  title="Close"
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
      {isBreak && <hr className={classes["divider"]}></hr>}
    </li>
  );
};

export default TagsTextareaItem;
