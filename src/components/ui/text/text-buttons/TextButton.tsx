import type { ComponentProps } from "react";
import classes from "./TextButton.module.scss";

type TextButtonProps = ComponentProps<"span">;

const TextButton = ({ children, className }: TextButtonProps) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>{children}</span>
  );
};

export default TextButton;
