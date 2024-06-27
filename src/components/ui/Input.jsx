import { useEffect, useState } from "react";
import { useValidation } from "../../hooks/use-validation";
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
    error,
    autoFocus,
    value,
    placeholder,
    validation,
    showError,
  } = props;
  // const [inputValue, setInputValue] = useState(value || "");
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  // const inputState = useValidation(validation, inputValue);
  // const {
  //   inputValue: valueIn,
  //   isValid: inputIsValid,
  //   errorMessage: inputErrorMessage,
  // } = inputState;

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

  // useEffect(() => {
  //   if (onChange && validation) {
  //     console.log("INPUT", valueIn);
  //     onChange(valueIn, inputIsValid, id);
  //   }
  // }, [inputState]);

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
        onBlur={(e) => {
          if (onBlur) {
            onBlur(e);
          }
          if (validation) {
            setShowErrorMessage(true);
          }
        }}
        onChange={(e) => {
          // onChange(e, inputIsValid);
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
