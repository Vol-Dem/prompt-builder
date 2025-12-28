import classes from "./ButtonTertiary.module.scss";

const ButtonTertiary = ({ children, className, button, ...props }) => {
  return (
    <button
      className={`${classes.btn} ${className || ""}`}
      {...button}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonTertiary;
