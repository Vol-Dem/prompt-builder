import type { ComponentProps } from "react";
import ButtonTertiary from "../buttons/ButtonTertiary";
import classes from "./CategoryList.module.scss";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

type CategoryListProps = ComponentProps<"div"> & {
  onEdit?: () => void;
};

const CategoryList = ({ onEdit, children, className }: CategoryListProps) => {
  return (
    <div className={classes.category}>
      <ul className={`${classes["category__list"]} ${className || ""}`}>
        {children}
      </ul>
      {onEdit && (
        <ButtonTertiary
          className={classes["category__edit"]}
          type="button"
          onClick={onEdit}
        >
          <PencilSquareIcon />
        </ButtonTertiary>
      )}
    </div>
  );
};

export default CategoryList;
