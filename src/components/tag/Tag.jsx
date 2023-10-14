import React from "react";
import { useDispatch } from "react-redux";
import { promptActions } from "../../store/prompt";
import classes from "./Tag.module.scss";

const Tag = ({ tag }) => {
  const dispatch = useDispatch();

  const addTagHandler = (e) => {
    // console.log(e);
    dispatch(promptActions.addTagToPrompt(e.target.innerText));
  };
  return (
    <li onClick={addTagHandler} className={classes.tag}>
      {tag}
    </li>
  );
};

export default Tag;
