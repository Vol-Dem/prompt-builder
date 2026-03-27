import type { ComponentProps } from "react";
import classes from "./H2.module.scss";

type H2Props = ComponentProps<"h2">;

const H2 = ({ id, className, children, ...props }: H2Props) => {
  return (
    <h2 id={id} className={`${classes.h2} ${className || ""}`} {...props}>
      {children}
    </h2>
  );
};

export default H2;
