import classes from "./TextButtonTertiary.module.scss";

const TextButtonTertiary = ({ children, className }) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>{children}</span>
  );
};

export default TextButtonTertiary;
