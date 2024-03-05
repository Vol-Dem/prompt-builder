import classes from "./Checkbox.module.scss";

const Checkbox = ({ id, value, name, label, onChange, checked, className }) => {
  return (
    <div>
      <label htmlFor={id} className={`${classes.label} ${className || ""}`}>
        <input
          type="checkbox"
          id={id}
          value={value}
          name={name}
          className={classes.checkbox}
          onChange={onChange}
          checked={checked}
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
