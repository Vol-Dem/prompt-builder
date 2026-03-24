import type { ComponentProps } from "react";
import classes from "./ListItem.module.scss";

type ListItemProps = ComponentProps<"li"> & {
  sub?: boolean;
};

const ListItem = ({
  id,
  sub,
  className,
  children,
  ...props
}: ListItemProps) => {
  return (
    <li
      id={id}
      className={`${classes.item} ${sub ? classes["item--sub"] : ""} ${className || ""}`}
      {...props}
    >
      {children}
    </li>
  );
};

export default ListItem;
