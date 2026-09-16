import type { ComponentProps } from "react";
import classes from "./ButtonSecondary.module.scss";

type ButtonSecondaryProps = ComponentProps<"button">;

const ButtonSecondary = ({
  children,
  className,
  ...props
}: ButtonSecondaryProps) => {
  return (
    <button
      className={`${classes["btn-secondary"]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonSecondary;
