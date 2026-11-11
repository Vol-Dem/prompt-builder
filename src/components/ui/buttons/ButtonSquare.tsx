import type { ComponentProps } from "react";
import classes from "./ButtonSquare.module.scss";

type ButtonSquareProps = ComponentProps<"button">;

const ButtonSquare = ({
  children,
  onClick,
  title,
  disabled,
  className,
  ...props
}: ButtonSquareProps) => {
  return (
    <button
      className={`${classes["button"]} ${onClick ? classes["active"] : ""} ${
        disabled ? classes["active--disabled"] : ""
      } ${className || ""}`}
      onClick={onClick}
      title={title || ""}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonSquare;
