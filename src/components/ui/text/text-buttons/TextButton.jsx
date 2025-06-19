import classes from "./TextButton.module.scss";

const TextButton = ({ children }) => {
  return <span className={classes.btn}>{children}</span>;
};

export default TextButton;
