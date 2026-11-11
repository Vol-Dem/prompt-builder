import classes from "./Spinner.module.scss";
import statusClasses from "./LiveStatus.module.scss";

type SpinnerProps = {
  size?: "small" | "medium" | "big";
  label?: string;
  /** Use for per-image loaders or when another live region owns the feedback. */
  decorative?: boolean;
};

const Spinner = ({
  size = "big",
  label = "Loading",
  decorative = false,
}: SpinnerProps) => {
  return (
    <div
      className={`${classes.spinner} ${classes[size]}`}
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-atomic={decorative ? undefined : true}
      aria-hidden={decorative || undefined}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      {!decorative && <span className={statusClasses.status}>{label}</span>}
    </div>
  );
};

export default Spinner;
