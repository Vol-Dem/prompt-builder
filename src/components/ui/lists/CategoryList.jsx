import EditSvg from "../../../assets/EditSvg";
import ButtonTertiary from "../ButtonTertiary";
import classes from "./CategoryList.module.scss";
import { motion } from "framer-motion";

const CategoryList = ({
  onClick,
  onEdit,
  activeCategory,
  children,
  className,
}) => {
  return (
    <div className={classes.category}>
      <motion.ul
        // initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
        // animate={ANIMATIONS_FM_SLIDEIN}
        // exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
        className={`${classes["category__list"]} ${className || ""}`}
      >
        {children}
      </motion.ul>
      {onEdit && (
        <ButtonTertiary
          className={classes["category__edit"]}
          type="button"
          onClick={onEdit}
        >
          <EditSvg />
        </ButtonTertiary>
      )}
    </div>
  );
};

export default CategoryList;
