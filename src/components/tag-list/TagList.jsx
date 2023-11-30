import React, { forwardRef } from "react";
import Tag from "../tag/Tag";
import classes from "./TagList.module.scss";

const TagList = forwardRef(function TagList(props, ref) {
  return (
    <ul className={classes.list}>
      {props?.tags?.length &&
        props?.tags?.map((tag, i) => {
          return (
            <Tag key={i} ref={ref} tag={tag} promptType={props?.promptType} />
          );
        })}
    </ul>
  );
});

export default TagList;
