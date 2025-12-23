import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import classes from "./TextImageMenu.module.scss";

const TextImageMenu = ({ children }) => {
  return (
    <span className={classes.btn}>
      <EllipsisHorizontalIcon />
    </span>
  );
};

export default TextImageMenu;
