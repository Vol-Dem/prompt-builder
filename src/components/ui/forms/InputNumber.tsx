import {
  useEffect,
  useState,
  type ComponentProps,
  type MouseEvent,
} from "react";

import classes from "./InputNumber.module.scss";
import { validateInput } from "../../../utils/validationUtils";
import type { ValidationTypes } from "../../../types/general.types";
import type { OverrideFields } from "../../../../shared/types/general";

type InputNumberProps = OverrideFields<
  ComponentProps<"input">,
  {
    label?: string;
    validation?: ValidationTypes;
    showError?: boolean;
    fitContent?: boolean;
    error?: string;
    value: string | number;
    step: number;
    onChange: (
      value: string,
      isValid: boolean | null,
      errorMessage?: string,
    ) => void;
  }
>;

/**
 * Numeric input with increment/decrement controls and validation.
 * @param props
 * @param props.id - Input id.
 * @param props.type - Input type (number, text).
 * @param props.name - Input name.
 * @param props.label - Optional label text.
 * @param props.input - Native input props.
 * @param props.className - Optional custom class.
 * @param props.onBlur - Blur handler.
 * @param props.onChange - Change handler (e, isValid?, errorMessage?).
 * @param props.onClick - Click handler.
 * @param props.onFocus - Focus handler.
 * @param props.error - External error message.
 * @param props.autoFocus - Autofocus input.
 * @param props.value - Controlled value.
 * @param props.placeholder - Placeholder text.
 * @param props.validation - Validation rules.
 * @param props.showError - Force show errors.
 * @param props.step - Step size for increment/decrement.
 * @returns Rendered numeric input component.
 */
const InputNumber = ({
  id,
  type,
  name,
  label,
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
}: InputNumberProps) => {
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    setShowErrorMessage(!!showError);
  }, [showError]);

  useEffect(() => {
    if (validation) {
      const { errorMessage } = validateInput(validation, value + "");

      setInputErrorMessage(errorMessage);
    }
  }, [value, validation]);

  const strengthHandler = (e: MouseEvent<HTMLButtonElement>) => {
    const curStrength = parseFloat(value + "") || 0;
    const strenghth =
      (e.target as HTMLButtonElement).dataset.type === "inc"
        ? curStrength + step
        : curStrength - step;

    let isValid: boolean | null = null;

    if (validation) {
      ({ isValid } = validateInput(validation, strenghth + ""));
    }

    onChange(strenghth.toFixed(1), isValid);
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
                e.target.value,
              );

              onChange(e.target.value, isValid, errorMessage);
              setInputErrorMessage(errorMessage);
            } else {
              onChange(e.target.value, null);
            }
          }}
          onClick={onClick}
          onFocus={onFocus}
          placeholder={placeholder}
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
