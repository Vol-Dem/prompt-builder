import classes from "./Checkbox.module.scss";

const Checkbox = ({
  id,
  value,
  name,
  label,
  onChange,
  checked,
  disabled,
  className,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`${classes.label} ${disabled ? classes.disabled : ""}`}
      >
        <input
          type="checkbox"
          id={id}
          value={value}
          name={name}
          className={`${classes.checkbox} ${className || ""}`}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
