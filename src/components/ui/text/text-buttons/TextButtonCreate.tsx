import type { ComponentProps } from "react";
import classes from "./TextButtonCreate.module.scss";

type TextButtonCreateProps = ComponentProps<"span">;

const TextButtonCreate = ({ className }: TextButtonCreateProps) => {
  return <span className={`${classes.btn} ${className || ""}`}>Create</span>;
};

export default TextButtonCreate;
