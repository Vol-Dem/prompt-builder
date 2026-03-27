import type { ComponentProps } from "react";
import classes from "./ButtonSecondary.module.scss";

type ButttonSecondaryProps = ComponentProps<"button">;

const ButttonSecondary = ({
  children,
  className,
  ...props
}: ButttonSecondaryProps) => {
  return (
    <button
      className={`${classes["btn-secondary"]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButttonSecondary;
