import { motion } from "framer-motion";

import classes from "./CategoryListItem.module.scss";

const CategoryListItem = ({
  children,
  onClick,
  dataValue,
  active,
  className,
}) => {
  return (
    <motion.li
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
