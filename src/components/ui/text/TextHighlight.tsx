import type { ComponentProps } from "react";
import classes from "./TextHighlight.module.scss";

type TextHighlightProps = ComponentProps<"span">;

const TextHighlight = ({ children, className }: TextHighlightProps) => {
  return (
    <span className={`${classes["highlight"]} ${className || ""}`}>
      {children}
    </span>
  );
};

export default TextHighlight;
