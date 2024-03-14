import classes from "./Textarea.module.scss";

const Textarea = (props) => {
  const {
    id,
    name,
    label,
    textarea,
    className,
    // onBlur,
    onChange,
    error,
    cols,
    rows = 5,
    // autoFocus,
    value,
    placeholder,
  } = props;

  return (
    <div>
      {label && (
        <label htmlFor={name} className={classes.label}>
          {label || ""}
        </label>
      )}

      <textarea
        id={id}
        name={name}
        cols={cols}
        rows={rows}
        placeholder={placeholder}
        value={value}
        {...textarea}
        onChange={onChange}
        className={`${classes.textarea} ${className || ""}`}
      ></textarea>
      {error && <div className={classes.error}>{error}</div>}
    </div>
  );
};

export default Textarea;
