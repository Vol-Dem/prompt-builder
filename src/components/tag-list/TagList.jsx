import React, { forwardRef } from "react";
import Tag from "../tag/Tag";
import classes from "./TagList.module.scss";
import { useDispatch } from "react-redux";
import { promptActions } from "../../store/prompt";

const TagList = forwardRef(function TagList(props, ref) {
  const dispatch = useDispatch();

  const addAllPromptHandler = (e) => {
    dispatch(
      promptActions.addAllTagsToPrompt({
        type: e.target.dataset.type,
        value: props.tags,
      })
    );
  };

  const removeAllPromptHandler = (e) => {
    dispatch(
      promptActions.removeAllTags({
        type: e.target.dataset.type,
        value: props.tags,
      })
    );
  };

  return (
    <div className={`${classes["container"]} ${props.className || ""}`}>
      <div className={classes.title}>
        <h3>
          {props.name}:
          {props?.coment && (
            <span className={classes.coment}>({props.coment})</span>
          )}
        </h3>
        <span>
          <button
            id="negativePrompt"
            data-type={props?.promptType}
            onClick={addAllPromptHandler}
            className={classes["btn-copy"]}
          >
            Add all
          </button>
          <button
            id="prompt"
            data-type={props?.promptType}
            onClick={removeAllPromptHandler}
            className={classes["btn-copy"]}
          >
            Remove all
          </button>
        </span>
      </div>
      <ul className={classes.tags}>
        {props?.tags?.length &&
          props?.tags?.map((tag, i) => {
            return (
              <li key={i}>
                <Tag ref={ref} tag={tag} promptType={props?.promptType} />
              </li>
            );
          })}
      </ul>
    </div>
  );
});

export default TagList;
