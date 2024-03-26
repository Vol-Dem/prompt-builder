import React, { forwardRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";
import classes from "./Tag.module.scss";
import { usedModelsActions } from "../../store/usedModels";

const Tag = forwardRef((props, ref) => {
  const [isInPrompt, setIsInPrompt] = useState(false);
  const dispatch = useDispatch();
  const curPromt = useSelector((state) => state.prompt.curPrompt);
  const curNegPromt = useSelector((state) => state.prompt.curNegPrompt);

  useEffect(() => {
    let isActive;
    // const escTag = props?.tag?.replace(/[.*+?^${}()<>|[\]\\]/g, "\\$&");
    // const word = new RegExp(
    //   new RegExp(`\\b${escTag}\\b`).test(escTag)
    //     ? `\\b${escTag}\\b.?`
    //     : `${escTag}.?`,
    //   "gi"
    // );
    // if (props.promptType === "positive") {
    //   isActive = curPromt.match(word);
    // } else {
    //   isActive = curNegPromt.match(word);
    // }
    const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
    const positiveWordsArr = curPromt
      ?.split(splitRegEx)
      ?.flatMap((tag) => tag.trim() || []);
    const negativeWordsArr = curNegPromt
      ?.split(splitRegEx)
      ?.flatMap((tag) => tag.trim() || []);
    if (props.promptType === "positive") {
      isActive = positiveWordsArr.find((word) => word === props?.tag);
    } else {
      isActive = negativeWordsArr.find((word) => word === props?.tag);
    }
    setIsInPrompt(isActive);
  }, [props.promptType, curPromt, curNegPromt, props.tag]);

  const addTagHandler = (e) => {
    console.log(props.tag);
    if (!isInPrompt) {
      dispatch(
        promptActions.addTagToPrompt({
          type: props.promptType,
          value: props.tag,
        })
      );
      if (props.modelData) {
        dispatch(usedModelsActions.addModelToPanel(props.modelData));
      }
    } else {
      console.log("DEL");
      dispatch(
        promptActions.removeTag({
          type: props.promptType,
          value: props.tag,
        })
      );
    }
  };

  return (
    <div
      ref={ref}
      onClick={addTagHandler}
      data-type={props?.promptType}
      className={`${classes.tag} ${isInPrompt && classes.active}`}
    >
      {props.tag}
    </div>
  );
});

export default Tag;
