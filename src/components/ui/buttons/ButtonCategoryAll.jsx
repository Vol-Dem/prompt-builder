import classes from "./ButtonCategoryAll.module.scss";
import { motion } from "framer-motion";

const ButtonCategoryAll = ({ className, onClick, activeCategory }) => {
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
    >
      All
    </motion.li>
  );
};

export default ButtonCategoryAll;
