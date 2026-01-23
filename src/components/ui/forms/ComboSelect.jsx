import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import classes from "./ComboSelect.module.scss";
import { validateInput } from "../../../utils/validationUtils";
import {
  ANIMATIONS_FM_SLIDEOUT,
  ANIMATIONS_FM_SLIDEOUT_INITIAL,
} from "../../../variables/constants";

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
 * @param {Object} props
 * @param {string} props.id - Field identifier.
 * @param {Array<{ id: string | number, name: string }>} props.optionsData - List of selectable options.
 * @param {string} props.query - Current search query.
 * @param {(value: string, isUserInput?: boolean, error?: string, id?: string) => void} props.setQuery - Updates the search query.
 * @param {(value: Object, isValid?: boolean, error?: string, id?: string) => void} props.setSelected - Callback triggered when an option is selected or created.
 * @param {{ id: string | number, name: string } | null} props.selected - Currently selected option.
 * @param {string} props.placeholder - Input placeholder.
 * @param {boolean} props.loading - Whether options are loading.
 * @param {boolean} props.disabled - Whether the field is disabled.
 * @param {Object} [props.validation] - Validation rules passed to `validateInput`.
 * @param {string} [props.error] - External error message.
 * @param {boolean} props.showError - Whether to display validation error.
 * @param {(e: React.FocusEvent) => void} [props.onBlur] - Blur event handler.
 * @param {string} [props.label] - Optional field label.
 *
 * @returns {JSX.Element} ComboSelect input.
 */
const ComboSelect = ({
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
}) => {
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const nameExists = optionsData?.find(
    (option) => option.name.trim().toLowerCase() === query.trim().toLowerCase(),
  );

  useEffect(() => {
    setShowErrorMessage(showError);
  }, [showError]);

  useEffect(() => {
    if (validation) {
      const { errorMessage } = validateInput(validation, selected?.name || "");

      setInputErrorMessage(errorMessage);
    }
  }, [validation, selected]);

  const conditionalPlaceholder = !loading ? placeholder : "Loading...";

  return (
    <div className={classes["container"]}>
      {label && (
        <label htmlFor={id} className={classes.label}>
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
            setInputErrorMessage(errorMessage);
          } else {
            setSelected(value);
          }
        }}
        onClose={() => setQuery("")}
        data-id={id}
      >
        {({ open }) => (
          <>
            <div className={classes.relative}>
              <ComboboxInput
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
                displayValue={(options) => options?.name}
                onChange={(event) => {
                  setQuery(event.target.value, true, "", id);
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
                <ComboboxOptions
                  static
                  as={motion.div}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    zIndex: -1,
                    transition: {
                      duration: 0.2,
                      zIndex: {
                        delay: 0.1,
                        duration: 0.1,
                      },
                    },
                  }}
                  anchor="bottom"
                  transition
                  className={`${classes.options} ${
                    optionsData?.length ? classes["options__border"] : ""
                  }`}
                  data-id={id}
                  modal={false}
                >
                  {query.length > 0 && !nameExists && (
                    <ComboboxOption
                      value={{ id: null, name: query.trim() }}
                      className={`${classes.option} ${classes["option--create"]}`}
                    >
                      <span className={`${classes["create-btn"]}`}>Create</span>{" "}
                      <span className="font-bold">"{query.trim()}"</span>
                    </ComboboxOption>
                  )}
                  {optionsData.map((options, i) => (
                    <ComboboxOption
                      key={options?.id || i}
                      value={options}
                      className={`${classes.option} ${
                        options?.name && options?.name === selected?.name
                          ? classes.selected
                          : ""
                      }`}
                    >
                      {options?.name && options?.name === selected?.name && (
                        <CheckIcon className={classes.check} />
                      )}
                      <div className="text-sm/6 text-white">
                        {options?.name}
                      </div>
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              )}
            </AnimatePresence>
          </>
        )}
      </Combobox>
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

export default ComboSelect;
