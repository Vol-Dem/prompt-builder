import { useEffect, useState } from "react";
import classes from "./InputNumber.module.scss";
import { validateInput } from "../../utils/generalUtils";

const InputNumber = (props) => {
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
    step = 1,
  } = props;
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    setShowErrorMessage(showError);
  }, [showError]);

  useEffect(() => {
    if (!!validation) {
      const { errorMessage } = validateInput(validation, value);

      setInputErrorMessage(errorMessage);
    }
  }, [value, validation]);

  const strengthHandler = (e) => {
    const strenghth =
      e.target.dataset.type === "inc"
        ? (+value || 0) + step
        : (+value || 0) - step;

    const { isValid } = validateInput(validation, strenghth);
    onChange({ target: { value: strenghth.toFixed(1) } }, isValid);
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className={classes.label}>
          {label || ""}
        </label>
      )}
      <div className={classes["input-number"]}>
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
          className={`${classes.input} ${classes["input--number"]} ${
            className || ""
          } ${
            inputErrorMessage && showErrorMessage ? classes["input--error"] : ""
          }`}
          autoFocus={autoFocus}
          value={value}
        />
        <div className={classes["input__btn-container"]}>
          <button
            type="button"
            title="up"
            className={classes["input__btn"]}
            onClick={strengthHandler}
            data-type="inc"
          >
            <span
              data-type="inc"
              className={`${classes["input__btn-arrow"]} ${classes["input__btn-arrow--up"]}`}
            ></span>
          </button>
          <button
            type="button"
            title="down"
            className={classes["input__btn"]}
            onClick={strengthHandler}
            data-type="dec"
          >
            <span
              data-type="dec"
              className={`${classes["input__btn-arrow"]} ${classes["input__btn-arrow--down"]}`}
            ></span>
          </button>
        </div>
      </div>
      {showErrorMessage && error && (
        <div className={classes.error}>{error}</div>
      )}
      {showErrorMessage && inputErrorMessage && (
        <div className={classes.error}>{inputErrorMessage}</div>
      )}
    </div>
  );
};

export default InputNumber;
