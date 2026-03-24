import type { ComponentProps } from "react";
import classes from "./TextContentBlock.module.scss";

type TextContentBlockProps = ComponentProps<"div">;

const TextContentBlock = ({ children, className }: TextContentBlockProps) => {
  return (
    <div className={`${classes.content} ${className || ""}`}>{children}</div>
  );
};

export default TextContentBlock;
