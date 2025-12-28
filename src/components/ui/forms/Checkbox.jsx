import classes from "./Checkbox.module.scss";

const Checkbox = ({ id, label, className, disabled, ...props }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`${classes.label} ${disabled ? classes.disabled : ""}`}
      >
        <input
          type="checkbox"
          id={id}
          className={`${classes.checkbox} ${className || ""}`}
          disabled={disabled}
          {...props}
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
