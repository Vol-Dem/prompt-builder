import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import classes from "./Input.module.scss";
import { validateInput } from "../../../utils/validationUtils";
import {
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
} from "../../../variables/constants";
import type {
  ExtendedOnChange,
  ValidationTypes,
} from "../../../types/general.types";
import type { OverrideFields } from "../../../../shared/types/general";

type InputProps = OverrideFields<
  HTMLMotionProps<"input"> & ComponentProps<"input">,
  {
    label?: string | ReactNode;
    validation?: ValidationTypes;
    showError?: boolean;
    fitContent?: boolean;
    error?: string;
    onChange?: ExtendedOnChange;
  }
>;

/**
 * Controlled text input with validation and animated error display.
 *
 * Supports inline validation, auto-resizing (fitContent),
 * and custom change handlers with validity feedback.
 *
 * @param props.id - Input id.
 * @param props.type - Input type (text, password, email, etc.).
 * @param props.name - Input name.
 * @param props.label - Optional label text.
 * @param props.input - Native input props spread to element.
 * @param props.className - Optional custom class.
 * @param props.onBlur - Blur event handler.
 * @param props.onChange - Change handler (e, isValid?, errorMessage?).
 * @param props.onClick - Click handler.
 * @param props.onFocus - Focus handler.
 * @param props.autoComplete - Autocomplete attribute.
 * @param props.error - External error message.
 * @param props.autoFocus - Autofocus input.
 * @param props.value - Controlled value.
 * @param props.placeholder - Placeholder text.
 * @param props.validation - Validation rules object.
 * @param props.showError - Force show error messages.
 * @param props.fitContent - Auto-resize width to content.
 * @param props.readOnly - Makes input read-only.
 * @param props - Native input props.
 * @returns Rendered input component.
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
      const { errorMessage } = validateInput(validation, value + "");

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
            onChange(e, true);
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
