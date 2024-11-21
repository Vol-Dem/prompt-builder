import { useDispatch } from "react-redux";
import classes from "./TagsTextarea.module.scss";
import { promptActions } from "../../store/prompt";
import CrossSvg from "../../assets/CrossSvg";
import { useEffect, useState } from "react";

const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

const TagsTextarea = ({
  data,
  className,
  placeholder,
  aditionalPlacegholder,
  promptType,
}) => {
  const [curPrompt, setCurrentPrompt] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const tagsData = data
      .trim()
      .split(splitRegEx)
      .flatMap((item, i) => {
        if (!item) return [];
        return {
          id: i,
          tag: item,
          dropLeft: null,
        };
      });
    setCurrentPrompt(tagsData);
  }, [data]);

  const removeTagHandler = (e) => {
    const value = e.target.closest(`.${classes.btn}`).dataset.value;
    dispatch(
      promptActions.removeTag({
        type: promptType,
        value: value,
      })
    );
  };

  const dragStartHandler = (e) => {
    const targetTagContainer = e.target.closest(`.${classes["tag-container"]}`);
    e.dataTransfer.setData("text/plain", targetTagContainer.dataset.id);
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
    const id = +e.dataTransfer.getData("text/plain");
    const targetTagContainer = e.target.closest(`.${classes["tag-container"]}`);
    const containerId = +targetTagContainer.dataset.id;
    if (id === containerId) return;

    const containerData = curPrompt.find(
      (tagItem) => +tagItem.id === containerId
    );
    if (containerData.dropLeft === null) return;

    let newPosition;

    if (
      (containerData.dropLeft && id > containerId) ||
      (!containerData.dropLeft && id < containerId)
    ) {
      newPosition = containerData.id;
    } else if (containerData.dropLeft && id < containerId) {
      newPosition = containerData.id - 1;
    } else if (!containerData.dropLeft && id > containerId) {
      newPosition = containerData.id + 1;
    }

    const movedItem = curPrompt[id];

    const newPrompt = curPrompt
      .toSpliced(id, 1)
      .toSpliced(newPosition, 0, movedItem);

    dispatch(
      promptActions.setCurrentPrompt(
        newPrompt.map((tagItem) => tagItem.tag).join(", ")
      )
    );
  };

  const tagItemsHtml = curPrompt.map((item, i) => {
    return (
      <li
        key={i}
        className={`${classes["tag-container"]} ${
          item.dropLeft !== null && item.dropLeft ? classes["drop-left"] : ""
        } ${
          item.dropLeft !== null && !item.dropLeft ? classes["drop-right"] : ""
        }`}
        onDragOver={dragOverHandler}
        onDragLeave={dragLeaveHandler}
        onDrop={dropHandler}
        data-id={item.id}
      >
        <div
          className={classes.tag}
          draggable="true"
          onDragStart={dragStartHandler}
          onDragEnd={dragEndHandler}
          data-id={item.id}
        >
          <div className={classes["tag__content"]}>
            <span className={classes["tag__text"]}>{item.tag.trim()}</span>
            <button
              type="button"
              className={classes.btn}
              onClick={removeTagHandler}
              data-value={item.tag.trim()}
              data-type=""
            >
              <span className={classes["tag__cross"]}>
                {" "}
                <CrossSvg />{" "}
              </span>
            </button>
          </div>
        </div>
      </li>
    );
  });

  return (
    <ul className={`${classes.field} ${className || ""}`}>
      {!tagItemsHtml.length && (
        <li className={classes.placeholder}>{placeholder}</li>
      )}
      {!tagItemsHtml.length && (
        <li
          className={`${classes.placeholder} ${classes["placeholder--aditional"]}`}
        >
          {aditionalPlacegholder}
        </li>
      )}
      {tagItemsHtml}
    </ul>
  );
};

export default TagsTextarea;
