import type { ComponentProps } from "react";
import classes from "./TextButtonSaved.module.scss";

type TextButtonSavedProps = ComponentProps<"span">;

const TextButtonSaved = ({ className }: TextButtonSavedProps) => {
  return <span className={`${classes.btn} ${className || ""}`}>Saved</span>;
};

export default TextButtonSaved;
