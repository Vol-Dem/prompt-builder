import classes from "./Arrow.module.scss";

const Arrow = ({ direction, ...props }) => {
  return (
    <span
      className={`${classes.arrow} ${classes[`arrow--${direction}`]}`}
      {...props}
    ></span>
  );
};

export default Arrow;
