import React, { forwardRef, useState } from "react";
import Tag from "../tag/Tag";
import classes from "./TagList.module.scss";
import { useDispatch } from "react-redux";
import { promptActions } from "../../store/prompt";
import ButtonTertiary from "../ui/ButtonTertiary";
import CopiedSvg from "../../assets/CopiedSvg";
import CopySvg from "../../assets/CopySvg";

const TagList = forwardRef(function TagList(props, ref) {
  const [copied, setCopied] = useState(false);
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

  const copyHandler = (e) => {
    navigator.clipboard.writeText(props.tags.join(", "));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
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
        <ButtonTertiary
          className={`${classes["btn-copy"]} ${
            copied ? classes["btn-copy--copied"] : ""
          }`}
          onClick={copyHandler}
          title="Copy"
        >
          {!copied && <CopySvg />}
          {copied && <CopiedSvg />}
        </ButtonTertiary>
      </div>
      <ul className={classes.tags}>
        {!!props?.tags?.length &&
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
