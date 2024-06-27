import { useEffect, useState } from "react";
import { validateInput } from "../../utils/generalUtils";
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
    onBlur,
    error,
    cols,
    rows = 5,
    // autoFocus,
    value,
    placeholder,
    validation,
    showError,
  } = props;
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    setShowErrorMessage(showError);
  }, [showError]);

  useEffect(() => {
    if (!!validation) {
      const { isValid, errorMessage } = validateInput(validation, value);

      // onChange(e, isValid, errorMessage);
      setInputErrorMessage(errorMessage);
    }
  }, [value, validation]);

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
        onBlur={(e) => {
          if (onBlur) {
            onBlur(e);
          }
          if (validation) {
            setShowErrorMessage(true);
          }
        }}
        onChange={(e) => {
          console.log("CHANGE");
          if (validation) {
            const { isValid, errorMessage } = validateInput(
              validation,
              e.target.value
            );
            console.log(e.target.value.length);
            onChange(e, isValid, errorMessage);
            setInputErrorMessage(errorMessage);
          } else {
            onChange(e);
          }
        }}
        className={`${classes.textarea} ${className || ""} ${
          inputErrorMessage && showErrorMessage
            ? classes["textarea--error"]
            : ""
        }`}
      ></textarea>
      {showError && error && <div className={classes.error}>{error}</div>}
      {showError && inputErrorMessage && (
        <div className={classes.error}>{inputErrorMessage}</div>
      )}
    </div>
  );
};

export default Textarea;
