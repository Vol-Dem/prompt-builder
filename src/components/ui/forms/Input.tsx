import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import classes from "./Input.module.scss";
import { validateInput } from "../../../utils/validationUtils";
import {
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
} from "../../../variables/constants";
import type { ValidationTypes } from "../../../types/general.types";
import type { OverrideFields } from "../../../../shared/types/general";

type InputProps = OverrideFields<
  HTMLMotionProps<"input">,
  {
    label?: string;
    validation?: ValidationTypes;
    showError?: boolean;
    fitContent?: boolean;
    error?: string;
    value: string;
    onChange: (
      e: ChangeEvent<HTMLInputElement>,
      isValid: boolean | null,
      errorMessage?: string,
    ) => void;
  }
>;

/**
 * Controlled text input with validation and animated error display.
 *
 * Supports inline validation, auto-resizing (fitContent),
 * and custom change handlers with validity feedback.
 *
 * @param {string} props.id - Input id.
 * @param {string} props.type - Input type (text, password, email, etc.).
 * @param {string} props.name - Input name.
 * @param {string} [props.label] - Optional label text.
 * @param {object} [props.input] - Native input props spread to element.
 * @param {string} [props.className] - Optional custom class.
 * @param {function} [props.onBlur] - Blur event handler.
 * @param {function} props.onChange - Change handler (e, isValid?, errorMessage?).
 * @param {function} [props.onClick] - Click handler.
 * @param {function} [props.onFocus] - Focus handler.
 * @param {string} [props.autoComplete] - Autocomplete attribute.
 * @param {string} [props.error] - External error message.
 * @param {boolean} [props.autoFocus] - Autofocus input.
 * @param {string|number} props.value - Controlled value.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {object} [props.validation] - Validation rules object.
 * @param {boolean} [props.showError] - Force show error messages.
 * @param {boolean} [props.fitContent] - Auto-resize width to content.
 * @param {boolean} [props.readOnly] - Makes input read-only.
 * @param {Object} props - Native input props.
 * @returns {JSX.Element} Rendered input component.
 */
const Input = ({
  id,
  type,
  name,
  label,
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
}: InputProps) => {
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputMargin = 5;

  useEffect(() => {
    setShowErrorMessage(!!showError);
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
          if (fitContent && inputRef.current) {
            inputRef.current.style.width = "0";
            inputRef.current.style.width = `${
              inputRef.current.scrollWidth + inputMargin
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
            onChange(e, null);
          }
        }}
        onClick={onClick}
        onFocus={onFocus}
        placeholder={placeholder}
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
