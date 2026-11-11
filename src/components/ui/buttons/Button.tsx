import type { ComponentProps } from "react";
import classes from "./Button.module.scss";
import LiveStatus from "../LiveStatus";
import Spinner from "../Spinner";

type ButtonProps = ComponentProps<"button"> & {
  loading?: boolean;
  loadingMessage?: string;
};

const Button = ({
  children,
  className,
  loading,
  loadingMessage = "Loading",
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) => {
  return (
    <>
      <button
        className={`${classes.btn} ${className || ""}`}
        {...props}
        aria-label={
          ariaLabel ??
          (loading !== undefined && typeof children === "string"
            ? children
            : undefined)
        }
        aria-busy={loading ?? props["aria-busy"]}
      >
        {loading ? <Spinner size="small" decorative /> : children}
      </button>
      {loading !== undefined && (
        <LiveStatus>{loading ? loadingMessage : ""}</LiveStatus>
      )}
    </>
  );
};

export default Button;
