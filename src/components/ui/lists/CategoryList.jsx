import EditSvg from "../../../assets/EditSvg";
import ButtonTertiary from "../buttons/ButtonTertiary";
import classes from "./CategoryList.module.scss";

const CategoryList = ({ onEdit, children, className }) => {
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
          <EditSvg />
        </ButtonTertiary>
      )}
    </div>
  );
};

export default CategoryList;
