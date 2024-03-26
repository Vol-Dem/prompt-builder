import classes from "./Arrow.module.scss";

const Arrow = ({ direction }) => {
  return (
    <span
      className={`${classes.arrow} ${classes[`arrow--${direction}`]}`}
    ></span>
  );
};

export default Arrow;
