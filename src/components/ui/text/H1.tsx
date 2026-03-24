import type { ComponentProps } from "react";
import classes from "./H1.module.scss";

type H1Props = ComponentProps<"h1">;

const H1 = ({ id, className, children, ...props }: H1Props) => {
  return (
    <h1 id={id} className={`${classes.h1} ${className || ""}`} {...props}>
      {children}
    </h1>
  );
};

export default H1;
