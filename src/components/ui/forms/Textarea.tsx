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
 * @param props.id - Textarea id.
 * @param props.name - Textarea name.
 * @param props.label - Optional label text.
 * @param props.textarea - Native textarea props.
 * @param props.className - Optional custom class.
 * @param props.onChange - Change handler (e, isValid?, errorMessage?).
 * @param props.onBlur - Blur handler.
 * @param props.error - External error message.
 * @param props.cols - Column count.
 * @param props.rows - Row count.
 * @param props.value - Controlled value.
 * @param props.placeholder - Placeholder text.
 * @param props.validation - Validation rules.
 * @param props.showError - Force show errors.
 * @param props - Native textarea props.
 * @returns Rendered textarea component.
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
