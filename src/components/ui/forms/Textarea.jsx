import { useEffect, useState } from "react";

import { validateInput } from "../../../utils/validationUtils";
import classes from "./Textarea.module.scss";

/**
 * Controlled textarea with validation and animated error display.
 *
 * @param {string} id - Textarea id.
 * @param {string} name - Textarea name.
 * @param {string} [label] - Optional label text.
 * @param {object} [textarea] - Native textarea props.
 * @param {string} [className] - Optional custom class.
 * @param {function} onChange - Change handler (e, isValid?, errorMessage?).
 * @param {function} [onBlur] - Blur handler.
 * @param {string} [error] - External error message.
 * @param {number} [cols] - Column count.
 * @param {number} [rows=5] - Row count.
 * @param {string} value - Controlled value.
 * @param {string} [placeholder] - Placeholder text.
 * @param {object} [validation] - Validation rules.
 * @param {boolean} [showError] - Force show errors.
 * @param {object} props - Native textarea props.
 * @returns {JSX.Element} Rendered textarea component.
 */
const Textarea = ({
  id,
  name,
  label,
  textarea,
  className,
  onChange,
  onBlur,
  error,
  cols,
  rows = 5,
  value,
  placeholder,
  validation,
  showError,
  ...props
}) => {
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    setShowErrorMessage(showError);
  }, [showError]);

  useEffect(() => {
    if (validation) {
      const { errorMessage } = validateInput(validation, value);

      setInputErrorMessage(errorMessage);
    }
    if (!validation) {
      setShowErrorMessage(false);
    }
  }, [value, validation]);

  return (
    <div>
      {label && (
        <label htmlFor={id} className={classes.label}>
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
          if (validation && !validation?.disableErrorOnBlur) {
            setShowErrorMessage(true);
          }
        }}
        onChange={(e) => {
          if (validation) {
            const { isValid, errorMessage } = validateInput(
              validation,
              e.target.value,
            );
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
        {...props}
      ></textarea>
      {showError && error && <div className={classes.error}>{error}</div>}
      {showError && inputErrorMessage && (
        <div className={classes.error}>{inputErrorMessage}</div>
      )}
    </div>
  );
};

export default Textarea;
