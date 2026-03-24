import type { ComponentProps } from "react";
import classes from "./TextButtonTertiary.module.scss";

type TextButtonTertiaryProps = ComponentProps<"span">;

const TextButtonTertiary = ({
  children,
  className,
}: TextButtonTertiaryProps) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>{children}</span>
  );
};

export default TextButtonTertiary;
