import { useDispatch, useSelector } from "react-redux";
import classes from "./TagsTextarea.module.scss";
import { promptActions } from "../../store/prompt";
import CrossSvg from "../../assets/CrossSvg";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SPLIT_TAG_REGEX } from "../../variables/constants";
import { CheckIcon } from "@heroicons/react/20/solid";
import Input from "./Input";

const minInputWidth = 150;

const TagsTextarea = ({
  data,
  className,
  placeholder,
  aditionalPlacegholder,
  promptType,
}) => {
  const [curPrompt, setCurrentPrompt] = useState([]);
  const [editTagInput, setEditTagInput] = useState({ value: "" });
  const [editWeightInput, setEditWeightInput] = useState({ value: "" });
  const [inputWidth, setInputWidth] = useState(null);
  const dispatch = useDispatch();
  const curPromptArr = useSelector((state) => state.prompt.curPromptArr);
  const curNegPromptArr = useSelector((state) => state.prompt.curNegPromptArr);
  const fieldRef = useRef(null);

  useEffect(() => {
    const promptArr =
      promptType === "positive" ? curPromptArr : curNegPromptArr;
    const tagsData = promptArr.map((item, i) => {
      return {
        ...item,
        dropLeft: null,
      };
    });
    // console.log(tagsData);
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
    console.log(e.target);
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
    const tagData = e.dataTransfer.getData("text/plain");
    if (!tagData.trim()) return;

    const { id, tag, position, type } = JSON.parse(tagData);
    const targetTagContainer = e.target.closest(`.${classes["tag-container"]}`);
    const fieldType = e.target?.dataset?.type;
    // const fieldId = e.target?.dataset?.id;
    // const dropTargetId = +targetTagContainer?.dataset?.id;
    // const dropTargetType = targetTagContainer?.dataset?.type;
    // if (targetTagContainer && fieldType && fieldId) return;
    // console.log(targetTagContainer, fieldType, fieldId);
    // console.log(e.target);
    // console.log(targetTagContainer);
    // console.log(fieldType);
    // console.log(fieldId);
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
    // console.log(targetTagContainer.dataset.item);
    // console.log(dropTargetType);
    // console.log(dropTargetId);

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
      // console.log("new", newPosition);

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

  const openEditHandler = (e) => {
    // console.log("START");
    const id = +e.target.closest(`.${classes["tag-container"]}`).dataset.id;
    const fieldWidth = e.target.offsetWidth;
    setInputWidth(fieldWidth);
    // console.log(fieldWidth);
    setCurrentPrompt((prevState) => {
      return prevState.map((item) => {
        if (item.id === id) {
          setEditTagInput({ value: item.tag });
          setEditWeightInput({ value: item?.weight || 1 });
          return { ...item, edit: true };
        }
        return { ...item, edit: false };
      });
    });
  };

  const changeWeightHandler = (e) => {
    setEditWeightInput((prevState) => {
      const strenghth =
        e.target.dataset.type === "inc"
          ? prevState.value + 0.1
          : prevState.value - 0.1;

      return { value: +strenghth.toFixed(1) };
    });
  };

  const submitEditHandler = (e) => {
    e.preventDefault();
    const id = +e.target.closest(`.${classes["tag-container"]}`).dataset.id;
    // console.log(id);
    // const formData = new FormData(e.target);
    // const tagName = formData.get("tag").trim();
    // console.log(tagName);
    // console.log(editTagInput.value);
    // setCurrentPrompt((prevState) => {
    //   const newPrompt = prevState.map((item) => {
    //     if (item.id === id) {
    //       return { ...item, tag: tagName, edit: false };
    //     }
    //     return { ...item, edit: false };
    //   });
    //   return newPrompt
    // });
    const newPrompt = curPrompt.map((item) => {
      if (item.id === id) {
        let regex = /\<[^>]*\>/i;
        const isActivationTag = regex.test(editTagInput.value);

        let tag = editTagInput.value;

        if (+editWeightInput.value !== item.weight) {
          if (editTagInput.value.includes(":")) {
            const tagName = editTagInput.value
              .replace(/^\(+|\<+|\)+|\>$/g, "")
              .split(":")
              .slice(0, -1)
              .join(":");
            if (isActivationTag) {
              tag = `<${tagName}:${editWeightInput.value}>`;
            } else if (!isActivationTag && editWeightInput.value === 1) {
              tag = tagName;
            } else {
              tag = `(${tagName}:${editWeightInput.value})`;
            }
          } else {
            // console.log(editTagInput.value);
            const tagName = editTagInput.value.replace(/^\(+|\)+$/g, "");
            // console.log(tagName);
            tag = `(${tagName}:${editWeightInput.value})`;
          }
        }
        return {
          ...item,
          tag: tag,
          weight: editWeightInput.value,
          edit: false,
        };
      }
      return { ...item, edit: false };
    });
    if (promptType === "positive") {
      dispatch(promptActions.setCurPromptArr(newPrompt));
    }
    if (promptType === "negative") {
      dispatch(promptActions.setCurNegPromptArr(newPrompt));
    }
  };

  const tagItemsHtml = curPrompt.map((item, i) => {
    return (
      <motion.li
        key={item.id}
        layout
        layoutId={item.id}
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
          className={`${classes.tag} ${
            !item.duplicateId
              ? ""
              : classes[`tag--duplicate-${item.duplicateId}`]
          }`}
          draggable={!item.edit ? "true" : "false"}
          onDragStart={dragStartHandler}
          onDragEnd={dragEndHandler}
          data-item={JSON.stringify({ ...item, type: promptType })}
          data-id={item.id}
          // data-tag={item.tag}
          // data-type={promptType}
          // contenteditable={item.edit ? "true" : "false"}
        >
          <>
            {!item.edit && (
              <div className={classes["tag__content"]}>
                <span
                  onClick={openEditHandler}
                  className={classes["tag__text"]}
                >
                  {item.tag.trim()}
                </span>
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
            )}
            {item.edit && (
              <form
                onSubmit={submitEditHandler}
                className={classes["tag__content"]}
              >
                <Input
                  autoFocus={true}
                  autoComplete="off"
                  fitContent={true}
                  type="text"
                  name="tag"
                  value={editTagInput.value}
                  onChange={(e) => {
                    setEditTagInput({ value: e.target.value });
                  }}
                  input={{
                    style: { width: inputWidth ? inputWidth + 15 : "auto" },
                  }}
                />
                <Input
                  type="text"
                  name="weight"
                  value={editWeightInput.value}
                  autoComplete="off"
                  onChange={(e) => {
                    setEditWeightInput({ value: e.target.value });
                  }}
                  className={classes["tag__weight"]}
                />
                {/* <div>{item.weight}</div> */}
                <div className={classes["activation-tag__btn-container"]}>
                  <button
                    type="button"
                    title="up"
                    className={classes["activation-tag__btn"]}
                    onClick={changeWeightHandler}
                    data-type="inc"
                  >
                    <span
                      data-type="inc"
                      className={`${classes["activation-tag__btn-arrow"]} ${classes["activation-tag__btn-arrow--up"]}`}
                    ></span>
                  </button>
                  <button
                    type="button"
                    title="down"
                    className={classes["activation-tag__btn"]}
                    onClick={changeWeightHandler}
                    data-type="dec"
                  >
                    <span
                      data-type="dec"
                      className={`${classes["activation-tag__btn-arrow"]} ${classes["activation-tag__btn-arrow--down"]}`}
                    ></span>
                  </button>
                </div>
                <button
                  type="submit"
                  className={`${classes.btn} ${classes["btn--submit"]}`}
                  data-value={JSON.stringify(item)}
                >
                  <span
                    className={`${classes["tag__cross"]} ${classes["tag__cross--submit"]}`}
                  >
                    {" "}
                    <CheckIcon />{" "}
                  </span>
                </button>
              </form>
            )}
          </>
        </div>
      </motion.li>
    );
  });

  const promptResizeHandler = () => {
    console.log(fieldRef.current.offsetHeight);
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
      {!tagItemsHtml.length && (
        <li
          draggable={false}
          data-type={promptType}
          className={classes.placeholder}
        >
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
