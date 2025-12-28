import classes from "./GuideActionMessage.module.scss";

const GuideActionMessage = (props) => {
  return (
    <span
      className={`${classes.message} ${
        props?.className ? props.className : ""
      }`}
    >
      {props.children}
    </span>
  );
};

export default GuideActionMessage;
