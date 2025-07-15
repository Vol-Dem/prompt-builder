import classes from "./TextButton.module.scss";

const TextButton = ({ children, className }) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>{children}</span>
  );
};

export default TextButton;
