import type { ComponentProps } from "react";
import classes from "./Button.module.scss";

type ButttonProps = ComponentProps<"button">;

const Buttton = ({ children, className, ...props }: ButttonProps) => {
  return (
    <button className={`${classes.btn} ${className || ""}`} {...props}>
      {children}
    </button>
  );
};

export default Buttton;
