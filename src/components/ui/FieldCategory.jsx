import classes from "./FieldCategory.module.scss";

const FieldCategory = (props) => {
  return (
    <div className={classes["field-category"]}>
      {props.title && <h3 className={classes["field-title"]}>{props.title}</h3>}
      {props.children}
    </div>
  );
};

export default FieldCategory;
