import type { ComponentProps } from "react";
import classes from "./Arrow.module.scss";

type ArrowProps = ComponentProps<"span"> & {
  direction: "up" | "down" | "left" | "right";
};

const Arrow = ({ direction, ...props }: ArrowProps) => {
  return (
    <span
      className={`${classes.arrow} ${classes[`arrow--${direction}`]}`}
      {...props}
    ></span>
  );
};

export default Arrow;
