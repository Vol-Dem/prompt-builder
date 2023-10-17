import React from "react";
import Tag from "../tag/Tag";
import classes from "./TagList.module.scss";

const TagList = ({ tags }) => {
  // console.log(subcat);
  return (
    <ul className={classes.list}>
      {tags?.map((tag, i) => {
        return <Tag tag={tag} key={i} />;
      })}
    </ul>
  );
};

export default TagList;
