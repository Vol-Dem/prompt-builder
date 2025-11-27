import { useDispatch, useSelector } from "react-redux";
import classes from "./TagsTextarea.module.scss";
import { promptActions } from "../../../store/prompt";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import TagsTextareaItem from "./tags-textarea-item/TagsTextareaItem";
import { getNewTagPosition } from "../../../utils/promptUtils";
import TagsTextareaPlaceholder from "./tags-textarea-placeholder/TagsTextareaPlaceholder";

const TagsTextarea = ({
  className,
  placeholder,
  aditionalPlacegholder,
  promptType,
}) => {
  const [curPrompt, setCurrentPrompt] = useState([]);
  const curPosPromptArr = useSelector((state) => state.prompt.curPromptArr);
  const curNegPromptArr = useSelector((state) => state.prompt.curNegPromptArr);
  const dispatch = useDispatch();
  const fieldRef = useRef(null);

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

  const dragOverHandler = (e, id, isLeftSide) => {
    e.preventDefault();
    const curTargetData = curPrompt.find((tagItem) => +tagItem.id === +id);

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

  const dropHandler = (e) => {
    const tagData = e.dataTransfer.getData("text/plain");

    if (!tagData.trim()) return;

    const { id, tag, position, type } = JSON.parse(tagData);
    const targetTagContainer = e.target.closest(`[data-item]`);

    if (!targetTagContainer) {
      const fieldType = e.target.closest(`[data-type]`)?.dataset?.type;

      if (!fieldType) return;

      dispatch(
        promptActions.removeTag({ id, type, dropTargetType: fieldType })
      );
      dispatch(
        promptActions.addTagToPrompt({ id: id, value: tag, type: fieldType })
      );
      return;
    }

    const { id: dropTargetId, type: dropTargetType } = JSON.parse(
      targetTagContainer.dataset.item
    );

    if (
      Number.isFinite(dropTargetId) &&
      dropTargetType &&
      id !== dropTargetId
    ) {
      const { position: dropTargetPosition, dropLeft: dropTargetLeft } =
        curPrompt.find((tagItem) => +tagItem.id === dropTargetId);

      if (dropTargetLeft === null) return;

      const newPosition = getNewTagPosition(
        position,
        dropTargetPosition,
        dropTargetLeft
      );

      // //Abort when droped on the same position
      if (type === dropTargetType && position === newPosition) return;

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
        })
      );
    }
  };

  const openEditHandler = (id) => {
    setCurrentPrompt((prevState) => {
      return prevState.map((item) => {
        if (item.id === id) {
          return { ...item, edit: true };
        }
        return { ...item, edit: false };
      });
    });
  };

  const tagItemsHtml = curPrompt.map((item, i) => {
    return (
      <TagsTextareaItem
        key={item.id}
        item={item}
        promptType={promptType}
        containerWidth={fieldRef.current.offsetWidth}
        onEdit={openEditHandler}
        onDragOver={dragOverHandler}
        onDragLeave={dragLeaveHandler}
        onDragEnd={dragEndHandler}
      />
    );
  });

  const promptResizeHandler = () => {
    dispatch(
      promptActions.setPromptHeight({
        type: promptType,
        value: fieldRef.current.offsetHeight,
      })
    );
  };

  return (
    <ul
      ref={fieldRef}
      onDragOver={dragOverHandler}
      onDragLeave={dragLeaveHandler}
      onDrop={dropHandler}
      onResize={promptResizeHandler}
      data-type={promptType}
      className={`${classes.field} ${
        promptType === "positive"
          ? classes["field--positive"]
          : classes["field--negative"]
      } ${className || ""}`}
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
