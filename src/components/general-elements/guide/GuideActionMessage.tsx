import type { ComponentProps } from "react";
import classes from "./GuideActionMessage.module.scss";

type GuideActionMessageProps = ComponentProps<"span">;

const GuideActionMessage = ({
  className,
  children,
}: GuideActionMessageProps) => {
  return (
    <span className={`${classes.message} ${className ? className : ""}`}>
      {children}
    </span>
  );
};

export default GuideActionMessage;
