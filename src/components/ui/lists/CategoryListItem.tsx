import { motion } from "framer-motion";

import classes from "./CategoryListItem.module.scss";
import { ANIMATIONS_FM_CATEGORY_LIST } from "../../../variables/constants";
import type { ComponentProps } from "react";

type CategoryListItem = ComponentProps<"li"> & {
  // onClick,
  dataValue: string | number;
  active: boolean;
};

const CategoryListItem = ({
  children,
  onClick,
  dataValue,
  active,
  className,
}: CategoryListItem) => {
  return (
    <motion.li
      {...ANIMATIONS_FM_CATEGORY_LIST}
      data-value={dataValue}
      onClick={onClick}
      className={`${classes[`category__link`]} ${
        active ? classes.active : ""
      } ${className || ""}`}
    >
      {children}
    </motion.li>
  );
};

export default CategoryListItem;
