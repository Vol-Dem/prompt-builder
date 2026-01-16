import classes from "./GuideActionMessage.module.scss";

const GuideActionMessage = ({ className, children }) => {
  return (
    <span className={`${classes.message} ${className ? className : ""}`}>
      {children}
    </span>
  );
};

export default GuideActionMessage;
