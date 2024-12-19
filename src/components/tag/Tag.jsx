import React, { forwardRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";
import classes from "./Tag.module.scss";
import { addModelToPanel } from "../../store/usedModels";
import { motion } from "framer-motion";

const Tag = forwardRef((props, ref) => {
  const [isInPrompt, setIsInPrompt] = useState(false);
  const dispatch = useDispatch();
  const curPromt = useSelector((state) => state.prompt.curPrompt);
  const curNegPromt = useSelector((state) => state.prompt.curNegPrompt);

  useEffect(() => {
    let isActive;
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
    if (!isInPrompt) {
      dispatch(
        promptActions.addTagToPrompt({
          type: props.promptType,
          value: props.tag,
        })
      );
      if (props.modelData) {
        dispatch(addModelToPanel(props.modelData));
      }
    } else {
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
      // initial={{ opacity: 0, scale: 0.9 }}
      // variants={{
      //   hidden: { opacity: 0.4, scale: 0.5 },
      //   visible: {
      //     opacity: 1,
      //     scale: 1,
      //     transition: { type: "spring" },
      //   },
      // }}
      // animate="visible"
      ref={ref}
      onClick={addTagHandler}
      data-type={props?.promptType}
      className={`${classes.tag} ${isInPrompt && classes.active}`}
      style={props.style}
    >
      {props.tag}
    </div>
  );
});

export default Tag;
