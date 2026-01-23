import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import classes from "./Input.module.scss";
import { validateInput } from "../../../utils/validationUtils";
import {
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
} from "../../../variables/constants";

/**
 * Controlled text input with validation and animated error display.
 *
 * Supports inline validation, auto-resizing (fitContent),
 * and custom change handlers with validity feedback.
 *
 * @param {string} id - Input id.
 * @param {string} type - Input type (text, password, email, etc.).
 * @param {string} name - Input name.
 * @param {string} [label] - Optional label text.
 * @param {object} [input] - Native input props spread to element.
 * @param {string} [className] - Optional custom class.
 * @param {function} [onBlur] - Blur event handler.
 * @param {function} onChange - Change handler (e, isValid?, errorMessage?).
 * @param {function} [onClick] - Click handler.
 * @param {function} [onFocus] - Focus handler.
 * @param {string} [autoComplete] - Autocomplete attribute.
 * @param {string} [error] - External error message.
 * @param {boolean} [autoFocus] - Autofocus input.
 * @param {string|number} value - Controlled value.
 * @param {string} [placeholder] - Placeholder text.
 * @param {object} [validation] - Validation rules object.
 * @param {boolean} [showError] - Force show error messages.
 * @param {boolean} [fitContent] - Auto-resize width to content.
 * @param {boolean} [readOnly] - Makes input read-only.
 * @param {object} props - Native input props.
 * @returns {JSX.Element} Rendered input component.
 */
const Input = ({
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
  autoComplete,
  error,
  autoFocus,
  value,
  placeholder,
  validation,
  showError,
  fitContent,
  readOnly,
  ...props
}) => {
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setShowErrorMessage(showError);
  }, [showError]);

  useEffect(() => {
    if (validation) {
      const { errorMessage } = validateInput(validation, value);

      setInputErrorMessage(errorMessage);
    }
  }, [value, validation]);

  return (
    <div className={classes.container}>
      {label && (
        <label htmlFor={id} className={classes.label}>
          {label || ""}
        </label>
      )}
      <motion.input
        animate={ANIMATIONS_FM_SLIDEOUT}
        ref={inputRef}
        id={id}
        type={type}
        name={name}
        onBlur={(e) => {
          if (onBlur) {
            onBlur(e);
          }
          if (validation && !validation?.disableErrorOnBlur) {
            setShowErrorMessage(true);
          }
        }}
        onChange={(e) => {
          if (!onChange) return;
          if (fitContent) {
            inputRef.current.style.width = "0";
            inputRef.current.style.width = `${
              inputRef.current.scrollWidth + 5
            }px`;
          }
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
        onClick={onClick}
        onFocus={onFocus}
        placeholder={placeholder}
        {...input}
        readOnly={readOnly}
        className={`${classes.input} ${
          inputErrorMessage && showErrorMessage ? classes["input--error"] : ""
        } ${readOnly ? classes["input--read-only"] : ""} ${className || ""} `}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        value={value}
        {...props}
      />
      {showErrorMessage && error && (
        <motion.div
          initial={ANIMATIONS_FM_SLIDEOUT_INITIAL}
          animate={ANIMATIONS_FM_SLIDEOUT}
          className={classes.error}
        >
          {error}
        </motion.div>
      )}
      {showErrorMessage && inputErrorMessage && (
        <motion.div
          initial={ANIMATIONS_FM_SLIDEOUT_INITIAL}
          animate={ANIMATIONS_FM_SLIDEOUT}
          className={classes.error}
        >
          {inputErrorMessage}
        </motion.div>
      )}
    </div>
  );
};

export default Input;
