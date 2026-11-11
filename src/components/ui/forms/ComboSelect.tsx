import { Combobox, ComboboxButton, ComboboxInput } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, type ComponentProps } from "react";

import classes from "./ComboSelect.module.scss";
import { validateInput } from "../../../utils/validationUtils";
import {
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
} from "../../../variables/constants";
import type {
  SelectOption,
  ValidationTypes,
} from "../../../types/general.types";
import ComboSelectOptions from "./ComboSelectOptions";
import useFieldAccessibility from "../../../hooks/use-field-accessibility";

type ComboSelectInputProps = ComponentProps<"input"> & {
  fieldDescription?: string;
  fieldLabelledBy?: string;
};

// Headless UI owns these ARIA props, so preserve field associations at its input boundary.
const ComboSelectInput = ({
  fieldDescription,
  fieldLabelledBy,
  ...props
}: ComboSelectInputProps) => (
  <input
    {...props}
    aria-describedby={
      [props["aria-describedby"], fieldDescription].filter(Boolean).join(" ") ||
      undefined
    }
    aria-labelledby={fieldLabelledBy ?? props["aria-labelledby"]}
  />
);

type ComboSelectProps<T extends number | string> = ComponentProps<"input"> & {
  optionsData: SelectOption<T>[];
  query: string;
  setQuery: (value: string) => void;
  setSelected: (
    value: SelectOption<T> | null,
    isValid: boolean | null,
    error?: string,
    id?: string,
  ) => void;
  selected: SelectOption<T> | null;
  loading?: boolean;
  validation: ValidationTypes;
  error?: string;
  showError?: boolean;
  label?: string;
};

/**
 * ComboSelect.
 *
 * Autocomplete select input built on top of
 * `@headlessui/react` Combobox.
 *
 * Supports:
 * - Searching & filtering
 * - Creating new options
 * - Keyboard navigation (via Headless UI)
 * - Validation with error feedback
 * - Animated dropdown (Framer Motion)
 *
 * Built with:
 * - @headlessui/react (Combobox, ComboboxInput, ComboboxOptions, ComboboxOption)
 * - framer-motion
 *
 * Responsibilities:
 * - Renders searchable select field.
 * - Manages query input and option filtering.
 * - Supports creating new values when no match exists.
 * - Applies validation and error display.
 * - Forwards selection and query state to parent.
 *
 * @component
 *
 * @param props
 * @param props.id - Field identifier.
 * @param props.optionsData - List of selectable options.
 * @param props.query - Current search query.
 * @param props.setQuery - Updates the search query.
 * @param props.setSelected - Callback triggered when an option is selected or created.
 * @param props.selected - Currently selected option.
 * @param props.placeholder - Input placeholder.
 * @param props.loading - Whether options are loading.
 * @param props.disabled - Whether the field is disabled.
 * @param props.validation - Validation rules passed to `validateInput`.
 * @param props.error - External error message.
 * @param props.showError - Whether to display validation error.
 * @param props.onBlur - Blur event handler.
 * @param props.label - Optional field label.
 *
 * @returns {JSX.Element} ComboSelect input.
 */
const ComboSelect = <T extends number | string>({
  id,
  optionsData,
  query,
  setQuery,
  setSelected,
  selected,
  placeholder,
  loading,
  disabled,
  validation,
  error,
  showError,
  onBlur,
  label,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: ComboSelectProps<T>) => {
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const inputErrorMessage = validation
    ? validateInput(validation, selected?.name || "").errorMessage
    : "";
  const { fieldId, externalErrorId, validationErrorId, ariaProps } =
    useFieldAccessibility({
      id,
      describedBy,
      invalid,
      externalErrorVisible: showErrorMessage && !!error,
      validationErrorVisible: showErrorMessage && !!inputErrorMessage,
    });

  useEffect(() => {
    if (showError !== undefined) setShowErrorMessage(showError);
  }, [showError]);

  const conditionalPlaceholder = !loading ? placeholder : "Loading...";

  return (
    <div className={classes["container"]}>
      {label && (
        <label htmlFor={fieldId} className={classes.label}>
          {label || ""}
        </label>
      )}
      <Combobox
        as={motion.div}
        animate={ANIMATIONS_FM_SLIDEOUT}
        immediate
        value={selected}
        onChange={(value) => {
          if (validation) {
            const { isValid, errorMessage } = validateInput(
              validation,
              value?.name || "",
            );
            setSelected(value, isValid, errorMessage, id);
          } else {
            setSelected(value, null);
          }
        }}
        onClose={() => setQuery("")}
        data-id={id}
      >
        {({ open }) => (
          <>
            <div className={classes.relative}>
              <ComboboxInput
                as={ComboSelectInput}
                id={fieldId}
                aria-label={ariaLabel}
                fieldLabelledBy={ariaLabelledBy}
                fieldDescription={ariaProps["aria-describedby"]}
                aria-invalid={ariaProps["aria-invalid"]}
                disabled={loading || disabled}
                autoComplete="off"
                placeholder={
                  open && !!optionsData.length
                    ? "Start typing"
                    : conditionalPlaceholder
                }
                className={`${classes.select} ${
                  showErrorMessage && inputErrorMessage
                    ? classes["select--error"]
                    : ""
                }`}
                displayValue={(options: SelectOption<T>) => options?.name}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                onBlur={(e) => {
                  if (onBlur) {
                    onBlur(e);
                  }
                  if (validation && !validation?.disableErrorOnBlur) {
                    setShowErrorMessage(true);
                  }
                }}
                data-id={id}
              />
              <ComboboxButton className={classes.button}>
                {!!optionsData?.length && (
                  <motion.div animate={{ rotate: open ? 180 : 0 }}>
                    <ChevronDownIcon className={classes.arrow} />
                  </motion.div>
                )}
              </ComboboxButton>
            </div>
            <AnimatePresence>
              {open && (
                <ComboSelectOptions
                  optionsData={optionsData}
                  query={query}
                  id={id}
                  selected={selected}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </Combobox>
      {showErrorMessage && error && (
        <motion.div
          id={externalErrorId}
          initial={ANIMATIONS_FM_SLIDEOUT_INITIAL}
          animate={ANIMATIONS_FM_SLIDEOUT}
          className={classes.error}
        >
          {error}
        </motion.div>
      )}
      {showErrorMessage && inputErrorMessage && (
        <motion.div
          id={validationErrorId}
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

export default ComboSelect;
