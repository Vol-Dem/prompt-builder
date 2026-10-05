import { motion, type HTMLMotionProps } from "framer-motion";

import classes from "./ButtonCategoryAll.module.scss";
import { ANIMATIONS_FM_CATEGORY_LIST } from "../../../variables/constants";

type ButtonCategoryAllProps = HTMLMotionProps<"li"> & {
  activeCategory: string;
};

const ButtonCategoryAll = ({
  className,
  onClick,
  activeCategory,
  ...props
}: ButtonCategoryAllProps) => {
  return (
    <motion.li
      {...ANIMATIONS_FM_CATEGORY_LIST}
      data-value="all"
      onClick={onClick}
      className={`${classes[`category__link`]} ${
        classes["category__link--all"]
      } ${activeCategory === "all" ? classes.active : ""} ${className || ""}`}
      {...props}
    >
      All
    </motion.li>
  );
};

export default ButtonCategoryAll;
