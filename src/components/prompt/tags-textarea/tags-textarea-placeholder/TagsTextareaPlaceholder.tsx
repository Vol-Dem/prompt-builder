import type { ComponentProps } from "react";
import classes from "./TagsTextareaPlaceholder.module.scss";

type TagsTextareaPlaceholderProps = ComponentProps<"li"> & {
  aditional?: boolean;
};

const TagsTextareaPlaceholder = ({
  aditional,
  children,
}: TagsTextareaPlaceholderProps) => {
  return (
    <li
      className={`${classes.placeholder} ${
        aditional ? classes["placeholder--aditional"] : ""
      }`}
    >
      {children}
    </li>
  );
};

export default TagsTextareaPlaceholder;
