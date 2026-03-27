import type { ComponentProps } from "react";
import classes from "./TextButtonSecondary.module.scss";

type TextButtonSecondaryProps = ComponentProps<"span">;

const TextButtonSecondary = ({
  children,
  className,
}: TextButtonSecondaryProps) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>{children}</span>
  );
};

export default TextButtonSecondary;
