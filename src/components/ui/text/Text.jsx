import classes from "./Text.module.scss";

const Text = ({ id, className, children, ...props }) => {
  return (
    <p id={id} className={`${classes.text} ${className || ""}`} {...props}>
      {children}
    </p>
  );
};

export default Text;
