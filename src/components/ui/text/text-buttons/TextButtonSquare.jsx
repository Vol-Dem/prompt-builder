import classes from "./TextButtonSquare.module.scss";

const TextButtonSquare = ({ children, className }) => {
  return <span className={`${classes.btn} ${className || ""}`}>{children}</span>;
};

export default TextButtonSquare;
