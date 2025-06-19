import classes from "./ButtonSquare.module.scss";

const ButtonSquare = ({ children, onClick, title, disabled, className }) => {
  return (
    <button
      className={`${classes["button"]} ${onClick ? classes["active"] : ""} ${
        disabled ? classes["active--disabled"] : ""
      } ${className || ""}`}
      onClick={onClick}
      title={title || ""}
    >
      {children}
    </button>
  );
};

export default ButtonSquare;
