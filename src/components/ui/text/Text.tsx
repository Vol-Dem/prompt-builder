import type { ComponentProps } from "react";
import classes from "./Text.module.scss";

type TextProps = ComponentProps<"p">;

const Text = ({ id, className, children, ...props }: TextProps) => {
  return (
    <p id={id} className={`${classes.text} ${className || ""}`} {...props}>
      {children}
    </p>
  );
};

export default Text;
