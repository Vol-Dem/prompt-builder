import { useEffect, useRef, useState } from "react";
import classes from "./Input.module.scss";
import { validateInput } from "../../utils/generalUtils";

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
    autoComplete,
    error,
    autoFocus,
    value,
    placeholder,
    validation,
    showError,
    fitContent,
  } = props;
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setShowErrorMessage(showError);
  }, [showError]);

  // useEffect(() => {
  //   if (fitContent && inputRef.current) {
  //     inputRef.current.style.width = `${inputRef.current.scrollWidth + 5}px`;
  //   }
  // }, [fitContent, inputRef.current]);

  useEffect(() => {
    if (!!validation) {
      const { errorMessage } = validateInput(validation, value);

      setInputErrorMessage(errorMessage);
    }
    // if (!validation) {
    //   setShowErrorMessage(false);
    // }
  }, [value, validation]);

  return (
    <div className={classes.container}>
      {label && (
        <label htmlFor={id} className={classes.label}>
          {label || ""}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type={type}
        name={name}
        // style={{ width: 0 }}
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
          // validateInput(e.target.value);
        }}
        onClick={onClick}
        onFocus={onFocus}
        placeholder={placeholder}
        {...input}
        className={`${classes.input} ${className || ""} ${
          inputErrorMessage && showErrorMessage ? classes["input--error"] : ""
        }`}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        value={value}
      />
      {showErrorMessage && error && (
        <div className={classes.error}>{error}</div>
      )}
      {showErrorMessage && inputErrorMessage && (
        <div className={classes.error}>{inputErrorMessage}</div>
      )}
    </div>
  );
};

export default Input;
