import classes from "./ButtonTertiary.module.scss";

const ButtonTertiary = (props) => {
  return (
    <button
      type={props.type}
      className={`${classes.btn} ${props.className || ""}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default ButtonTertiary;
