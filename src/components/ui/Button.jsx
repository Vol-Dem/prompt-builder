import classes from "./Button.module.scss";

const Buttton = (props) => {
  return (
    <button
      type={props.type}
      className={`${classes.btn} ${props.className || ""}`}
      onClick={props.onClick}
      disabled={props.disabled}
      style={props.style}
      title={props.title}
      {...props.button}
    >
      {props.children}
    </button>
  );
};

export default Buttton;
