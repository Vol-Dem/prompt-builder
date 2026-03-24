import type { ComponentProps } from "react";
import classes from "./Card.module.scss";

type CardProps = ComponentProps<"div">;

function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={`${classes.card} ${className || ""}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
