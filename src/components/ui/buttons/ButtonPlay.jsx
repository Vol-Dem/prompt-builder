import { PlayIcon } from "@heroicons/react/24/outline";

import classes from "./ButtonPlay.module.scss";

const ButtonPlay = ({ className, ...props }) => {
  return (
    <div className={`${classes["play-icon"]} ${className || ""}`} {...props}>
      <PlayIcon className={classes["play-icon__svg"]} />
    </div>
  );
};

export default ButtonPlay;
