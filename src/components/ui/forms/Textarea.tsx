import { useEffect, useState, type ComponentProps } from "react";

import { validateInput } from "../../../utils/validationUtils";
import classes from "./Textarea.module.scss";
import type {
  ExtendedOnChange,
  ValidationTypes,
} from "../../../types/general.types";
import type { OverrideFields } from "../../../../shared/types/general";

type TextareaProps = OverrideFields<
  ComponentProps<"textarea">,
  {
    label?: string;
    error?: string;
    validation?: ValidationTypes;
    showError?: boolean;
    value: string;
    onChange: ExtendedOnChange<HTMLTextAreaElement>;
  }
>;

/**
 * Controlled textarea with validation and animated error display.
 *
 * @param {string} props.id - Textarea id.
 * @param {string} props.name - Textarea name.
 * @param {string} [props.label] - Optional label text.
 * @param {object} [props.textarea] - Native textarea props.
 * @param {string} [props.className] - Optional custom class.
 * @param {function} props.onChange - Change handler (e, isValid?, errorMessage?).
 * @param {function} [props.onBlur] - Blur handler.
 * @param {string} [props.error] - External error message.
 * @param {number} [props.cols] - Column count.
 * @param {number} [props.rows=5] - Row count.
 * @param {string} props.value - Controlled value.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {object} [props.validation] - Validation rules.
 * @param {boolean} [props.showError] - Force show errors.
 * @param {object} props - Native textarea props.
 * @returns {JSX.Element} Rendered textarea component.
 */
const Textarea = ({
  id,
  name,
  label,
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
}: TextareaProps) => {
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    if (typeof showError === "boolean") setShowErrorMessage(showError);
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
            onChange(e, true);
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
