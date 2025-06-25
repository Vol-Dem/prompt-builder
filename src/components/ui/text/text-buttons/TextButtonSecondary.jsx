import classes from "./TextButtonSecondary.module.scss";

const TextButtonSecondary = ({ children, className }) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>{children}</span>
  );
};

export default TextButtonSecondary;
