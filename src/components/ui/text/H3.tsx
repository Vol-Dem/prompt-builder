import type { ComponentProps } from "react";
import classes from "./H3.module.scss";

type H3Props = ComponentProps<"h3">;

const H3 = ({ id, className, children, ...props }: H3Props) => {
  return (
    <h3 id={id} className={`${classes.h3} ${className || ""}`} {...props}>
      {children}
    </h3>
  );
};

export default H3;
