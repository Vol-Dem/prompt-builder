import React from "react";
import Tag from "../tag/Tag";
import classes from "./TagList.module.scss";

const TagList = ({ subcat }) => {
  // console.log(subcat);
  return (
    <ul className={classes.list}>
      {subcat?.map((tag) => {
        return <Tag tag={tag} key={tag} />;
      })}
    </ul>
  );
};

export default TagList;
