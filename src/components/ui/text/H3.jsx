import classes from "./H3.module.scss";

const H3 = ({ id, className, children, ...props }) => {
  return (
    <h3 id={id} className={`${classes.h3} ${className || ""}`} {...props}>
      {children}
    </h3>
  );
};

export default H3;
