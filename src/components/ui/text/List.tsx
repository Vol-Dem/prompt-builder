import type { ComponentProps } from "react";
import classes from "./List.module.scss";

type ListProps = ComponentProps<"ul"> & { sub?: boolean };

const List = ({ id, className, sub, children, ...props }: ListProps) => {
  return (
    <ul
      id={id}
      className={`${classes.list} ${sub ? classes["list--sub"] : ""} ${className || ""}`}
      {...props}
    >
      {children}
    </ul>
  );
};

export default List;
