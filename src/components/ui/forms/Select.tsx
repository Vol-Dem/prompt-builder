import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import classes from "./Select.module.scss";
import {
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
} from "../../../variables/constants";
import type { OverrideFields } from "../../../../shared/types/general";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type SelectOption = { name: ReactNode; value: string | number };

type SelectProps<T extends SelectOption> = OverrideFields<
  ComponentProps<"input">,
  {
    label?: string;
    selected?: string | number;
    options: T[];
    onChange: (value: T["value"] | null) => void;
  }
>;

/**
 * Custom animated select dropdown with radio options.
 *
 * @param props - Native input props for radio inputs.
 * @param props.id - Base id for select.
 * @param props.options - Select options.
 * @param props.onChange - Callback when value changes.
 * @param props.className - Optional custom class.
 * @param props.label - Optional label text.
 * @param props.selected - Selected value.
 * @returns  Rendered select component.
 */
const Select = <T extends SelectOption>({
  id = "select",
  options,
  onChange,
  className,
  label,
  selected,
  ...props
}: SelectProps<T>) => {
  const [selectIsOpen, setSelectIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<T | null>(null);
  const [optionsFieldHeight, setOptionsFieldHeight] = useState(15);
  const visibleOptionsAmount = 5;
  const labeldRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const closeSelectHandler = useCallback((e: PointerEvent) => {
    if (!(e.target as HTMLElement)?.closest(`.${classes["select"]}`))
      setSelectIsOpen(false);
  }, []);

  useEffect(() => {
    if (selectIsOpen) {
      document.removeEventListener("click", closeSelectHandler);
      document.addEventListener("click", closeSelectHandler);
    } else {
      document.removeEventListener("click", closeSelectHandler);
    }

    return () => {
      document.removeEventListener("click", closeSelectHandler);
    };
  }, [selectIsOpen, closeSelectHandler]);

  useEffect(() => {
    if (!labeldRef?.current) return;
    const labelStyle = window.getComputedStyle(labeldRef.current);
    const merginTop = parseFloat(labelStyle.marginTop);
    const merginBottom = parseFloat(labelStyle.marginBottom);
    const selectHeight =
      labeldRef.current.clientHeight + merginTop + merginBottom;
    const optionsAmount = selected ? options.length : options.length + 1;
    const fieldHeight =
      optionsAmount <= visibleOptionsAmount
        ? optionsAmount * selectHeight
        : visibleOptionsAmount * selectHeight;
    setOptionsFieldHeight(fieldHeight);
  }, [visibleOptionsAmount, selectIsOpen, options, selected]);

  useEffect(() => {
    if (selected) {
      const selectedData = options.find(
        (option) => option.value + "" === selected + "",
      );

      if (selectedData) {
        setSelectedValue(selectedData);
      }
    }
  }, [options, selected]);

  const onSelectValueChange = (value: T | null) => {
    setSelectedValue(value);
    onChange(value?.value || null);
    setSelectIsOpen(false);
  };

  const onShowSelect = () => {
    setSelectIsOpen((curState) => !curState);
  };

  const selectOptions = options.map((item, i) => {
    return (
      <div ref={inputRef} key={i} className={classes["select__item"]}>
        <input
          className={classes["select__radio"]}
          type="radio"
          id={`select-${id}-${i}`}
          name="option"
          value={item.value}
          data-name={item.name}
          onChange={() => onSelectValueChange(item)}
          checked={item.value === selectedValue?.value}
          {...props}
        />
        <label
          ref={labeldRef}
          className={classes["select__label"]}
          htmlFor={`select-${id}-${i}`}
        >
          <div className={classes["select__title"]}>
            <span>{item.name}</span>
          </div>
        </label>
      </div>
    );
  });

  return (
    <div>
      {label && (
        <label htmlFor={id} className={classes.label}>
          {label}
        </label>
      )}
      <div className={`${classes["container"]} `}>
        <div
          onClick={!props.disabled ? onShowSelect : undefined}
          className={`${classes["select"]} ${className || ""} ${props.disabled ? classes["select--disabled"] : ""}`}
        >
          <ChevronDownIcon
            className={`${classes["select__arrow"]} ${
              selectIsOpen ? classes["select__arrow--open"] : ""
            }`}
          />
          <div className={classes["select__input"]}>
            <span className={classes["select__input-field"]}>
              {selectedValue?.name || "-"}
            </span>
          </div>
          <AnimatePresence>
            {!!selectIsOpen && (
              <motion.div
                initial={ANIMATIONS_FM_ZOOM_IN_INITIAL}
                animate={ANIMATIONS_FM_ZOOM_IN}
                exit={ANIMATIONS_FM_ZOOM_IN_INITIAL}
                style={
                  optionsFieldHeight && selectIsOpen
                    ? { height: `${optionsFieldHeight}px` }
                    : {}
                }
                className={`${classes["select__field"]} ${
                  !selectIsOpen ? classes["select__field--hide"] : ""
                }`}
              >
                <div
                  className={classes["select__field-container"]}
                  style={
                    options.length <= visibleOptionsAmount
                      ? { overflowY: `unset` }
                      : {}
                  }
                >
                  {[
                    !selected && (
                      <div key="def" className={classes["select__item"]}>
                        <input
                          className={classes["select__radio"]}
                          type="radio"
                          id={`select-def`}
                          name="option"
                          value={""}
                          data-name={"-"}
                          onChange={() => onSelectValueChange(null)}
                          checked={selectedValue?.value === null}
                          {...props}
                        />
                        <label
                          ref={labeldRef}
                          className={classes["select__label"]}
                          htmlFor={`select-def`}
                        >
                          <div className={classes["select__title"]}>
                            <span>-</span>
                          </div>
                        </label>
                      </div>
                    ),
                    ...selectOptions,
                  ]}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Select;
