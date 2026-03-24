import type { ComponentProps } from "react";
import classes from "./TextButtonSquare.module.scss";

type TextButtonSquareProps = ComponentProps<"span">;

const TextButtonSquare = ({ children, className }: TextButtonSquareProps) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>{children}</span>
  );
};

export default TextButtonSquare;
