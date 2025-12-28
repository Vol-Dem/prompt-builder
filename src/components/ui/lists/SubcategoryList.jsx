import { motion } from "framer-motion";

import EditSvg from "../../../assets/EditSvg";
import ButtonTertiary from "../buttons/ButtonTertiary";
import classes from "./SubcategoryList.module.scss";

const SubcategoryList = ({ children, className, onEdit }) => {
  return (
    <div className={classes["subcategories-container"]}>
      <motion.ul
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${classes["subcategories"]} ${className || ""}`}
      >
        {children}
      </motion.ul>
      {onEdit && (
        <ButtonTertiary
          className={classes["subcategories__edit"]}
          type="button"
          onClick={onEdit}
        >
          <EditSvg />
        </ButtonTertiary>
      )}
    </div>
  );
};

export default SubcategoryList;
