import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import classes from "./Select.module.scss";
import accessibilityClasses from "../LiveStatus.module.scss";
import {
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
} from "../../../variables/constants";
import type { OverrideFields } from "../../../../shared/types/general";

type SelectOption = {
  name: ReactNode;
  value: string | number;
  textValue?: string;
};

type SelectProps<T extends SelectOption> = OverrideFields<
  ComponentProps<"input">,
  {
    label?: string;
    selected?: string | number | null;
    options: T[];
    onChange: (value: T["value"] | null) => void;
  }
>;

type SelectButtonProps = ComponentProps<"button"> & {
  fieldLabelledBy?: string;
  fieldDescription?: string;
};

// Preserve caller associations after Headless UI sets its own ARIA props.
const SelectButton = ({
  fieldLabelledBy,
  fieldDescription,
  ...props
}: SelectButtonProps) => (
  <button
    {...props}
    onKeyDown={(event) => {
      if (event.defaultPrevented) return;
      if (event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.click();
      } else {
        props.onKeyDown?.(event);
      }
    }}
    aria-labelledby={
      fieldLabelledBy ??
      (props["aria-label"] ? undefined : props["aria-labelledby"])
    }
    aria-describedby={fieldDescription ?? props["aria-describedby"]}
  />
);

const visibleOptionsAmount = 5;

const SelectOptions = <T extends SelectOption>({
  options,
  showEmptyOption,
}: {
  options: T[];
  showEmptyOption: boolean;
}) => {
  const [optionsFieldHeight, setOptionsFieldHeight] = useState(15);
  const optionRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();
  const optionsAmount = options.length + (showEmptyOption ? 1 : 0);

  useLayoutEffect(() => {
    if (!optionRef.current) return;
    const optionStyle = window.getComputedStyle(optionRef.current);
    const rowHeight =
      optionRef.current.clientHeight +
      (parseFloat(optionStyle.marginTop) || 0) +
      (parseFloat(optionStyle.marginBottom) || 0);
    setOptionsFieldHeight(
      Math.min(optionsAmount, visibleOptionsAmount) * rowHeight,
    );
  }, [options, optionsAmount]);

  return (
    <ListboxOptions
      static
      as={motion.div}
      initial={ANIMATIONS_FM_ZOOM_IN_INITIAL}
      animate={ANIMATIONS_FM_ZOOM_IN}
      exit={ANIMATIONS_FM_ZOOM_IN_INITIAL}
      modal={false}
      aria-hidden={!isPresent || undefined}
      inert={!isPresent}
      style={
        optionsFieldHeight > 0 ? { height: optionsFieldHeight } : undefined
      }
      className={classes["select__field"]}
    >
      <div
        className={classes["select__field-container"]}
        style={
          optionsAmount <= visibleOptionsAmount
            ? { overflowY: "unset" }
            : undefined
        }
      >
        {showEmptyOption && (
          <ListboxOption
            ref={options.length === 0 ? optionRef : undefined}
            value={null}
            className={classes["select__label"]}
          >
            <div className={classes["select__title"]}>
              <span>-</span>
            </div>
          </ListboxOption>
        )}
        {options.map((item, i) => (
          <ListboxOption
            ref={i === options.length - 1 ? optionRef : undefined}
            key={i}
            value={item.value}
            aria-label={item.textValue}
            className={classes["select__label"]}
          >
            <div className={classes["select__title"]}>
              <span>{item.name}</span>
              {item.textValue && (
                <span className={accessibilityClasses.status}>
                  {item.textValue}
                </span>
              )}
            </div>
          </ListboxOption>
        ))}
      </div>
    </ListboxOptions>
  );
};

/**
 * Accessible animated select with native input props on its hidden form value.
 * Explicit null, undefined, or empty-string selected values clear the selection.
 * Omit selected for uncontrolled selection. Callbacks receive raw option values.
 */
const Select = <T extends SelectOption>(selectProps: SelectProps<T>) => {
  const {
    id,
    options,
    onChange,
    className,
    label,
    selected,
    disabled,
    name,
    form,
    autoFocus,
    tabIndex,
    title,
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
    ...inputProps
  } = selectProps;
  const generatedId = useId();
  const fieldId = id || generatedId;
  const [uncontrolledValue, setUncontrolledValue] = useState<T["value"] | null>(
    null,
  );
  const isControlled = "selected" in selectProps;
  const selectedId = isControlled ? selected : uncontrolledValue;
  const selectedValue =
    selectedId != null && selectedId !== ""
      ? (options.find(
          (option) => String(option.value) === String(selectedId),
        ) ?? null)
      : null;
  const showEmptyOption = selected == null || selected === "";

  const onSelectValueChange = (value: T["value"] | null) => {
    if (value === (selectedValue?.value ?? null)) return;
    if (!isControlled) setUncontrolledValue(value);
    onChange(value);
  };

  return (
    <Listbox
      as="div"
      value={selectedValue?.value ?? null}
      onChange={onSelectValueChange}
      disabled={disabled}
    >
      {({ open }) => (
        <>
          {label && (
            <ListboxLabel htmlFor={fieldId} className={classes.label}>
              {label}
            </ListboxLabel>
          )}
          <div className={classes.container}>
            <ListboxButton
              as={SelectButton}
              id={fieldId}
              type="button"
              autoFocus={autoFocus}
              tabIndex={tabIndex}
              title={title}
              aria-label={ariaLabel}
              fieldLabelledBy={labelledBy}
              fieldDescription={describedBy}
              aria-invalid={invalid}
              className={`${classes.select} ${className || ""} ${disabled ? classes["select--disabled"] : ""}`}
            >
              <ChevronDownIcon
                className={`${classes["select__arrow"]} ${open ? classes["select__arrow--open"] : ""}`}
              />
              <span className={classes["select__input"]}>
                <span className={classes["select__input-field"]}>
                  {selectedValue?.name || "-"}
                </span>
              </span>
            </ListboxButton>
            <AnimatePresence>
              {open && !disabled && (
                <SelectOptions
                  options={options}
                  showEmptyOption={showEmptyOption}
                />
              )}
            </AnimatePresence>
          </div>
          <input
            {...inputProps}
            type="hidden"
            name={name}
            form={form}
            disabled={disabled}
            value={selectedValue?.value ?? ""}
          />
        </>
      )}
    </Listbox>
  );
};

export default Select;
