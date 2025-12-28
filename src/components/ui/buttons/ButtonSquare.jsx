import classes from "./ButtonSquare.module.scss";

const ButtonSquare = ({
  children,
  onClick,
  title,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={`${classes["button"]} ${onClick ? classes["active"] : ""} ${
        disabled ? classes["active--disabled"] : ""
      } ${className || ""}`}
      onClick={onClick}
      title={title || ""}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonSquare;
