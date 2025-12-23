import { motion } from "framer-motion";

import classes from "./ButtonCategoryAll.module.scss";

const ButtonCategoryAll = ({
  className,
  onClick,
  activeCategory,
  ...props
}) => {
  return (
    <motion.li
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
