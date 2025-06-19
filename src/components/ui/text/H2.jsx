import classes from "./H2.module.scss";

const H2 = ({ id, className, children, ...props }) => {
  return (
    <h2 id={id} className={`${classes.h2} ${className || ""}`} {...props}>
      {children}
    </h2>
  );
};

export default H2;
