import classes from "./Input.module.scss";

const Input = (props) => {
  const {
    id,
    type,
    name,
    label,
    input,
    className,
    onBlur,
    onChange,
    onClick,
    onFocus,
    error,
    autoFocus,
    value,
    placeholder,
  } = props;

  return (
    <div>
      {label && (
        <label htmlFor={id} className={classes.label}>
          {label || ""}
        </label>
      )}
      <input
        id={id}
        type={type}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        onClick={onClick}
        onFocus={onFocus}
        placeholder={placeholder}
        {...input}
        className={`${classes.input} ${className || ""}`}
        autoFocus={autoFocus}
        value={value}
      />
      {error && <div className={classes.error}>{error}</div>}
    </div>
  );
};

export default Input;
