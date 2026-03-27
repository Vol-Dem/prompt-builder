import type { ComponentProps } from "react";
import classes from "./Button.module.scss";

type ButtonProps = ComponentProps<"button">;

const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button className={`${classes.btn} ${className || ""}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
