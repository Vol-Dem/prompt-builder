import classes from "./ButtonSquare.module.scss";

const ButtonSquare = ({ children, onClick, title, disabled, className }) => {
  return (
    <button
      className={`${classes["button"]} ${
        disabled ? classes["button--disabled"] : ""
      } ${className || ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
};

export default ButtonSquare;
