import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import classes from "./ComboSelect.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { validateInput } from "../../utils/generalUtils";
import { useEffect, useState } from "react";

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
}) => {
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    setShowErrorMessage(showError);
  }, [showError]);

  const nameExists = optionsData.find((option) => option.name === query);

  useEffect(() => {
    if (!!validation) {
      // console.log(selected);
      const { errorMessage } = validateInput(validation, selected?.name || "");

      setInputErrorMessage(errorMessage);
    }
  }, [validation, selected]);

  const conditionalPlaceholder = !loading ? placeholder : "Loading...";
  // console.log(optionsData);

  return (
    <div className={classes["container"]}>
      <Combobox
        immediate
        value={selected}
        onChange={(value) => {
          if (validation) {
            // console.log(value);
            const { isValid, errorMessage } = validateInput(
              validation,
              value || ""
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
                onChange={(event) => setQuery(event.target.value, true, "", id)}
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
                  exit={{ opacity: 0, scale: 0.95 }}
                  anchor="bottom"
                  transition
                  className={classes.options}
                  onAnimationComplete={() => setQuery("")}
                  data-id={id}
                  modal={false}
                  // portal={false}
                >
                  {query.length > 0 && !nameExists && (
                    <ComboboxOption
                      value={{ id: null, name: query }}
                      className={`${classes.option}`}
                    >
                      Create <span className="font-bold">"{query}"</span>
                    </ComboboxOption>
                  )}
                  {optionsData.map((options, i) => (
                    <ComboboxOption
                      key={options?.id}
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
        <div className={classes.error}>{error}</div>
      )}
      {showErrorMessage && inputErrorMessage && (
        <div className={classes.error}>{inputErrorMessage}</div>
      )}
    </div>
  );
};

export default ComboSelect;
