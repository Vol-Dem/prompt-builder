import classes from "./Spinner.module.scss";

type SpinnerProps = { size?: "small" | "medium" | "big" };

const Spinner = ({ size = "big" }: SpinnerProps) => {
  return (
    <div className={`${classes.spinner} ${classes[size]}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Spinner;
