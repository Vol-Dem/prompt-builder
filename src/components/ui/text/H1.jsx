import classes from "./H1.module.scss";

const H1 = ({ id, className, children, ...props }) => {
  return (
    <h1 id={id} className={`${classes.h1} ${className || ""}`} {...props}>
      {children}
    </h1>
  );
};

export default H1;
