import { motion } from "framer-motion";

import ButtonTertiary from "../buttons/ButtonTertiary";
import classes from "./SubcategoryList.module.scss";
import type { ComponentProps } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

type SubcategoryListProps = ComponentProps<"div"> & {
  onEdit: () => void;
};

const SubcategoryList = ({
  children,
  className,
  onEdit,
}: SubcategoryListProps) => {
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
          <PencilSquareIcon />
        </ButtonTertiary>
      )}
    </div>
  );
};

export default SubcategoryList;
