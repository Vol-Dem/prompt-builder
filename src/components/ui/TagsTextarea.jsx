import { useDispatch, useSelector } from "react-redux";
import classes from "./TagsTextarea.module.scss";
import { promptActions } from "../../store/prompt";
import CrossSvg from "../../assets/CrossSvg";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SPLIT_TAG_REGEX } from "../../variables/constants";

const TagsTextarea = ({
  data,
  className,
  placeholder,
  aditionalPlacegholder,
  promptType,
}) => {
  const [curPrompt, setCurrentPrompt] = useState([]);
  const dispatch = useDispatch();
  const curPromptArr = useSelector((state) => state.prompt.curPromptArr);
  const curNegPromptArr = useSelector((state) => state.prompt.curNegPromptArr);

  useEffect(() => {
    const promptArr =
      promptType === "positive" ? curPromptArr : curNegPromptArr;
    const tagsData = promptArr.map((item, i) => {
      return {
        ...item,
        dropLeft: null,
      };
    });
    console.log(tagsData);
    // const tagsData = data
    //   .trim()
    //   .split(SPLIT_TAG_REGEX)
    //   .flatMap((item, i) => {
    //     if (!item) return [];
    //     return {
    //       id: i,
    //       tag: item.trim(),
    //       dropLeft: null,
    //     };
    //   });
    setCurrentPrompt(tagsData);
  }, [curPromptArr, curNegPromptArr, promptType]);

  const removeTagHandler = (e) => {
    const value = e.target.closest(`.${classes.btn}`).dataset.value;
    dispatch(
      promptActions.removeTag({
        ...JSON.parse(value),
        type: promptType,
      })
    );
  };

  const dragStartHandler = (e) => {
    const targetTagContainer = e.target.closest(`.${classes["tag-container"]}`);
    const tagData = targetTagContainer.dataset.item;
    // console.log(tagData);

    e.dataTransfer.setData("text/plain", tagData);
    e.dataTransfer.effectAllowed = "move";
  };

  const dragEndHandler = (e) => {
    const targetTag = e.target.closest(`.${classes["tag"]}`);
    if (!targetTag) return;
    setCurrentPrompt((prevState) => {
      return prevState.map((tagItem) => {
        return {
          ...tagItem,
          dropLeft: null,
        };
      });
    });
  };

  const dragOverHandler = (e) => {
    e.preventDefault();

    const targetTagContainer = e.target.closest(`.${classes["tag-container"]}`);
    const targetTag = e.target.closest(`.${classes["tag"]}`);
    if (!targetTagContainer || !targetTag) return;

    const targetTagWidth = targetTag.offsetWidth;
    const targetTagLeft = Math.round(
      targetTagContainer.getBoundingClientRect().left
    );
    const isLeftSide = targetTagWidth / 2 + targetTagLeft > e.clientX;

    const curTargetData = curPrompt.find(
      (tagItem) => +tagItem.id === +targetTagContainer.dataset.id
    );
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

  const dragLeaveHandler = (e) => {
    const targetTagContainer = e.target.closest(`.${classes["tag-container"]}`);
    if (!targetTagContainer) return;

    const curTargetData = curPrompt.find(
      (tagItem) => +tagItem.id === +targetTagContainer.dataset.id
    );
    if (!curTargetData) return;
    setCurrentPrompt((prevState) => {
      return prevState.map((tagItem) => {
        if (tagItem.id !== curTargetData.id) {
          return {
            ...tagItem,
            dropLeft: null,
          };
        }
        return tagItem;
      });
    });
  };

  const dropHandler = (e) => {
    const { id, tag, position, type } = JSON.parse(
      e.dataTransfer.getData("text/plain")
    );
    // console.log(id, tag, position, type);
    const targetTagContainer = e.target.closest(`.${classes["tag-container"]}`);
    const fieldType = e.target?.dataset?.type;
    const fieldId = e.target?.dataset?.id;
    // const dropTargetId = +targetTagContainer?.dataset?.id;
    // const dropTargetType = targetTagContainer?.dataset?.type;
    // if (targetTagContainer && fieldType && fieldId) return;
    // console.log(targetTagContainer, fieldType, fieldId);
    console.log(e.target);
    console.log(targetTagContainer);
    console.log(fieldType);
    console.log(fieldId);
    if (!targetTagContainer && fieldType === type) return;
    if (!targetTagContainer) {
      dispatch(
        promptActions.removeTag({ id, type, dropTargetType: fieldType })
      );
      dispatch(
        promptActions.addTagToPrompt({ id: id, value: tag, type: fieldType })
      );
      return;
    }

    const {
      id: dropTargetId,
      tag: dropTargetTag,
      position: dropTargetPosition,
      type: dropTargetType,
    } = JSON.parse(targetTagContainer.dataset.item);
    console.log(targetTagContainer.dataset.item);
    console.log(dropTargetType);
    console.log(dropTargetId);

    if (Number.isFinite(dropTargetId) && dropTargetType) {
      if (id === dropTargetId && dropTargetType === type) return;

      const containerData = curPrompt.find(
        (tagItem) => +tagItem.id === dropTargetId
      );
      if (containerData.dropLeft === null) return;

      let newPosition;
      // if (containerData.dropLeft || containerData.position < position) {
      //   newPosition = containerData.position;
      // } else {
      //   newPosition = containerData.position + 1;
      // }
      if (
        (containerData.dropLeft && position > containerData.position) ||
        (!containerData.dropLeft && position < containerData.position)
        // || (containerData.dropLeft && position <= containerData.position && containerData.position === 0)
      ) {
        newPosition = containerData.position;
      } else if (
        containerData.dropLeft &&
        position <= containerData.position &&
        containerData.position > 0
      ) {
        newPosition = containerData.position - 1;
      } else if (
        !containerData.dropLeft &&
        position >= containerData.position
      ) {
        newPosition = containerData.position + 1;
      }
      // console.log(containerData);
      console.log("new", newPosition);

      // dispatch(
      //   promptActions.removeTag({
      //     id: id,
      //     type: type,
      //     value: tag,
      //   })
      // );
      // dispatch(
      //   promptActions.addTagToPosition({
      //     position: newPosition,
      //     tag,
      //     type: dropTargetType,
      //   })
      // );
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

  const tagItemsHtml = curPrompt.map((item, i) => {
    return (
      <motion.li
        key={item.id}
        layout
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
        // className={`${classes["tag-container"]}`}
        className={`${classes["tag-container"]} ${
          item.dropLeft !== null && item.dropLeft ? classes["drop-left"] : ""
        } ${
          item.dropLeft !== null && !item.dropLeft ? classes["drop-right"] : ""
        }`}
        onDragOver={dragOverHandler}
        onDragLeave={dragLeaveHandler}
        // onDrop={dropHandler}
        data-item={JSON.stringify({ ...item, type: promptType })}
        data-id={item.id}
        // data-tag={item.tag}
        // data-type={promptType}
      >
        <div
          className={classes.tag}
          draggable="true"
          onDragStart={dragStartHandler}
          onDragEnd={dragEndHandler}
          data-item={JSON.stringify({ ...item, type: promptType })}
          data-id={item.id}
          // data-tag={item.tag}
          // data-type={promptType}
        >
          <div className={classes["tag__content"]}>
            <span className={classes["tag__text"]}>{item.tag.trim()}</span>
            <button
              type="button"
              className={classes.btn}
              onClick={removeTagHandler}
              data-value={JSON.stringify(item)}
              data-type=""
            >
              <span className={classes["tag__cross"]}>
                {" "}
                <CrossSvg />{" "}
              </span>
            </button>
          </div>
        </div>
      </motion.li>
    );
  });

  return (
    <ul
      onDragOver={dragOverHandler}
      onDragLeave={dragLeaveHandler}
      onDrop={dropHandler}
      data-type={promptType}
      className={`${classes.field} ${className || ""}`}
    >
      {!tagItemsHtml.length && (
        <li data-type={promptType} className={classes.placeholder}>
          {placeholder}
        </li>
      )}
      {!tagItemsHtml.length && (
        <li
          data-type={promptType}
          className={`${classes.placeholder} ${classes["placeholder--aditional"]}`}
        >
          {aditionalPlacegholder}
        </li>
      )}
      <AnimatePresence>{tagItemsHtml}</AnimatePresence>
    </ul>
  );
};

export default TagsTextarea;
