import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import classes from "./TextImageMenu.module.scss";
import type { ComponentProps } from "react";

type TextImageMenuProps = ComponentProps<"span">;

const TextImageMenu = ({ className }: TextImageMenuProps) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>
      <EllipsisHorizontalIcon />
    </span>
  );
};

export default TextImageMenu;
