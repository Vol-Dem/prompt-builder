import type { ComponentProps } from "react";
import classes from "./ButtonTertiary.module.scss";

type ButtonTertiaryProps = ComponentProps<"button">;

const ButtonTertiary = ({
  children,
  className,
  ...props
}: ButtonTertiaryProps) => {
  return (
    <button className={`${classes.btn} ${className || ""}`} {...props}>
      {children}
    </button>
  );
};

export default ButtonTertiary;
