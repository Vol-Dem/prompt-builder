import classes from "./Button.module.scss";

const Buttton = ({ children, className, button, ...props }) => {
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

export default Buttton;
