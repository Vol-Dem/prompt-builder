import { useEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence } from "framer-motion";

import classes from "./TagsTextarea.module.scss";
import { promptActions } from "../../../store/prompt";
import TagsTextareaItem from "./tags-textarea-item/TagsTextareaItem";
import { getNewTagPosition } from "../../../utils/promptUtils";
import TagsTextareaPlaceholder from "./tags-textarea-placeholder/TagsTextareaPlaceholder";
import type { PromptItem, PromptType } from "../../../types/prompt.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

type TagsTextareaProps = {
  promptType: PromptType;
  placeholder: string;
  aditionalPlacegholder?: string;
};

/**
 * Tag-based prompt editor.
 *
 * Converts the prompt array from Redux into interactive tags
 * that support:
 * - reordering
 * - cross-field moving
 * - inline editing
 *
 * Responsibilities:
 * - Maps Redux prompt arrays to UI tag models.
 * - Handles drag & drop logic.
 * - Dispatches structural changes to Redux.
 *
 * @component
 *
 * @param props
 * @param props.promptType - Prompt channel this field belongs to.
 * @param props.placeholder - Main placeholder shown when no tags exist.
 * @param props.aditionalPlacegholder - Secondary helper placeholder.
 *
 * @returns Tag-based prompt editor.
 */
const TagsTextarea = ({
  promptType,
  placeholder,
  aditionalPlacegholder,
}: TagsTextareaProps) => {
  const [curPrompt, setCurrentPrompt] = useState<PromptItem[]>([]);
  const curPosPromptArr = useAppSelector((state) => state.prompt.curPromptArr);
  const curNegPromptArr = useAppSelector(
    (state) => state.prompt.curNegPromptArr,
  );
  const dispatch = useAppDispatch();
  const fieldRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const promptArr =
      promptType === "positive" ? curPosPromptArr : curNegPromptArr;

    const tagsData = promptArr.map((item) => {
      return {
        ...item,
        dropLeft: null,
      };
    });

    setCurrentPrompt(tagsData);
  }, [curPosPromptArr, curNegPromptArr, promptType]);

  const dragEndHandler = () => {
    setCurrentPrompt((prevState) => {
      return prevState.map((tagItem) => {
        return {
          ...tagItem,
          dropLeft: null,
        };
      });
    });
  };

  const dragOverHandler = (
    e: DragEvent,
    id?: number,
    isLeftSide?: boolean | null,
  ) => {
    e.preventDefault();
    const curTargetData =
      id !== undefined && curPrompt.find((tagItem) => +tagItem.id === +id);

    if (!curTargetData || curTargetData?.dropLeft === isLeftSide) return;

    setCurrentPrompt((prevState) => {
      return prevState.map((tagItem) => {
        if (tagItem.id === curTargetData.id) {
          return {
            ...tagItem,
            dropLeft: isLeftSide,
          };
        }
        return tagItem;
      });
    });
  };

  const dragLeaveHandler = () => {
    setCurrentPrompt((prevState) => {
      return prevState.map((tagItem) => {
        return {
          ...tagItem,
          dropLeft: null,
        };
      });
    });
  };

  const dropHandler = (e: DragEvent<HTMLElement>) => {
    if (!(e.target instanceof Element)) return;

    const tagData = e.dataTransfer.getData("text/plain");

    if (!tagData.trim()) return;

    const { id, tag, position, type } = JSON.parse(tagData);
    const targetTagContainer = e.target.closest(`[data-item]`) as HTMLElement;

    if (!targetTagContainer) {
      const fieldType = (e.target.closest(`[data-type]`) as HTMLElement)
        ?.dataset?.type;

      if (!fieldType) return;
      dispatch(
        promptActions.removeTag({ id, type, dropTargetType: fieldType }),
      );
      dispatch(
        promptActions.addTagToPrompt({ id: id, value: tag, type: fieldType }),
      );
      return;
    }

    if (!targetTagContainer.dataset.item) return;

    const { id: dropTargetId, type: dropTargetType } = JSON.parse(
      targetTagContainer.dataset.item,
    );

    if (
      Number.isFinite(dropTargetId) &&
      dropTargetType &&
      id !== dropTargetId
    ) {
      const { position: dropTargetPosition, dropLeft: dropTargetLeft } =
        curPrompt.find((tagItem) => +tagItem.id === dropTargetId)!;

      if (dropTargetLeft === null || dropTargetLeft === undefined) return;

      const sameField = type === dropTargetType;
      const newPosition = getNewTagPosition(
        position,
        dropTargetPosition,
        dropTargetLeft,
        sameField,
      );

      // //Abort when droped on the same position
      if (sameField && position === newPosition) return;
      dispatch(promptActions.removeTag({ id, type, dropTargetType }));
      dispatch(
        promptActions.addTagToPosition({
          item: {
            id,
            tag,
            position: newPosition,
          },
          type,
          dropTargetType,
          prevPosition: position,
        }),
      );
    }
  };

  const openEditHandler = (id: number) => {
    setCurrentPrompt((prevState) => {
      return prevState.map((item) => {
        if (item.id === id) {
          return { ...item, edit: true };
        }
        return { ...item, edit: false };
      });
    });
  };

  const tagItemsHtml = curPrompt.map((item) => {
    return (
      <TagsTextareaItem
        key={item.id}
        item={item}
        promptType={promptType}
        containerWidth={fieldRef.current?.offsetWidth}
        onEdit={openEditHandler}
        onDragOver={dragOverHandler}
        onDragLeave={dragLeaveHandler}
        onDragEnd={dragEndHandler}
      />
    );
  });

  return (
    <ul
      ref={fieldRef}
      onDragOver={dragOverHandler}
      onDragLeave={dragLeaveHandler}
      onDrop={dropHandler}
      data-type={promptType}
      className={`${classes.field} ${
        promptType === "positive"
          ? classes["field--positive"]
          : classes["field--negative"]
      } `}
    >
      {!curPrompt.length && (
        <TagsTextareaPlaceholder>{placeholder}</TagsTextareaPlaceholder>
      )}
      {!curPrompt.length && (
        <TagsTextareaPlaceholder aditional>
          {aditionalPlacegholder}
        </TagsTextareaPlaceholder>
      )}
      <AnimatePresence>{tagItemsHtml}</AnimatePresence>
    </ul>
  );
};

export default TagsTextarea;
