import classes from "./ButtonSecondary.module.scss";

const ButttonSecondary = ({ children, className, button, ...props }) => {
  return (
    <button
      className={`${classes["btn-secondary"]} ${className || ""}`}
      {...button}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButttonSecondary;
