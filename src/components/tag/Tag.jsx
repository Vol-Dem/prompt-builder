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
    if (props.promptType === "positive") {
      isActive = curPromt.includes(props.tag.trim());
    } else {
      isActive = curNegPromt.includes(props.tag.trim());
    }
    setIsInPrompt(isActive);
  }, [props.promptType, curPromt, curNegPromt, props.tag]);

  const addTagHandler = (e) => {
    dispatch(
      promptActions.addTagToPrompt({
        type: props.promptType,
        value: props.tag,
      })
    );
    if (props.modelData) {
      dispatch(usedModelsActions.addModelToPanel(props.modelData));
    }
  };

  return (
    <li
      ref={ref}
      onClick={addTagHandler}
      data-type={props?.promptType}
      className={`${classes.tag} ${isInPrompt && classes.active}`}
    >
      {props.tag}
    </li>
  );
});

export default Tag;
