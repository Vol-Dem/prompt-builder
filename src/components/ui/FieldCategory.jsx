import classes from "./FieldCategory.module.scss";

const FieldCategory = ({ title, children, className, ...props }) => {
  return (
    <div
      className={`${classes["field-category"]} ${className || ""}`}
      {...props}
    >
      {title && <h3 className={classes["field-title"]}>{title}</h3>}
      {children}
    </div>
  );
};

export default FieldCategory;
