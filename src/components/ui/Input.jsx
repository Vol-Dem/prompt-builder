import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import classes from "./Input.module.scss";
import { validateInput } from "../../utils/validationUtils";
import {
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
} from "../../variables/constants";

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
  // isValid,
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
              e.target.value
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
