import classes from "./TextButtonAll.module.scss";

const TextButtonAll = ({ children }) => {
  return <span className={classes.btn}>{children}</span>;
};

export default TextButtonAll;
