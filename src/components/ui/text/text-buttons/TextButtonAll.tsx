import type { ComponentProps } from "react";
import classes from "./TextButtonAll.module.scss";

type TextButtonAllProps = ComponentProps<"span">;

const TextButtonAll = ({ children, className }: TextButtonAllProps) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>{children}</span>
  );
};

export default TextButtonAll;
