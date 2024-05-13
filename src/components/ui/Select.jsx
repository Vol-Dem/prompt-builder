import classes from "./Select.module.scss";
// import { ReactComponent as BoxEmptyImg } from "./../assets/layout/boxempty.svg";
import { useEffect, useRef, useState } from "react";
import Input from "./Input";

const Select = ({
  id = "select",
  options,
  onChange,
  className,
  label,
  selected,
}) => {
  const [selectIsOpen, setSelectIsOpen] = useState(false);
  const [selectedFieldName, setSelectedFieldName] = useState(selected);
  const [selectedFieldValue, setSelectedFieldValue] = useState(selected);
  const [optionsFieldHeight, setOptionsFieldHeight] = useState(15);
  const visibleOptionsAmount = 5;
  const labeldRef = useRef();
  const inputRef = useRef();

  const closeSelect = (e) => {
    if (!e.target.classList.contains(classes["select__input-field"]))
      setSelectIsOpen(false);
  };

  useEffect(() => {
    if (selectIsOpen) {
      document.addEventListener("click", closeSelect);
    } else {
      document.removeEventListener("click", closeSelect);
    }

    return () => {
      document.removeEventListener("click", closeSelect);
    };
  }, [selectIsOpen]);

  useEffect(() => {
    const labelStyle = window.getComputedStyle(labeldRef.current);
    const merginTop = parseFloat(labelStyle.marginTop);
    const merginBottom = parseFloat(labelStyle.marginBottom);
    const selectHeight =
      labeldRef.current.clientHeight + merginTop + merginBottom;
    const fieldHeight =
      options.length <= visibleOptionsAmount
        ? options.length * selectHeight
        : visibleOptionsAmount * selectHeight;
    setOptionsFieldHeight(fieldHeight);
    // console.log(selectHeight);
    // console.log(labelStyle);
    // console.log(labeldRef.current.clientHeight);
    if (selected) {
      const selectedData = options.find(
        (option) => option.value + "" === selected + ""
      );
      setSelectedFieldName(selectedData.name);
      setSelectedFieldValue(selectedData.value);
    }
  }, [visibleOptionsAmount, options.length, selectIsOpen, options, selected]);

  const onSelectValueChange = (e) => {
    setSelectedFieldName(e.target.dataset.name);
    onChange(e.target.value);
    setSelectIsOpen(false);
  };

  const onShowSelect = () => {
    setSelectIsOpen((state) => !state);
  };

  const selectOptions = options.map((item, i) => {
    return (
      <div ref={inputRef} key={i} className={classes["select__item"]}>
        <input
          className={classes["select__radio"]}
          type="radio"
          id={`select-${item.value}-${id}`}
          name="option"
          value={item.value}
          data-name={item.name}
          onChange={onSelectValueChange}
          checked={item.value === selectedFieldValue}
        />
        <label
          ref={labeldRef}
          className={classes["select__label"]}
          htmlFor={`select-${item.value}-${id}`}
        >
          <div className={classes["select__title"]}>
            <span>{item.name}</span>
          </div>
        </label>
      </div>
    );
  });

  return (
    <div
      className={`${classes["select"]} ${className || ""}`}
      onClick={onShowSelect}
    >
      <label htmlFor={id} className={classes.label}>
        {label}
      </label>
      <div className={classes["select__input"]}>
        <span
          className={`${classes["select__arrow"]} ${
            selectIsOpen ? classes["select__arrow--open"] : ""
          }`}
        ></span>
        <Input
          id={id}
          className={classes["select__input-field"]}
          type="text"
          placeholder="Select size"
          input={{ readOnly: true }}
          value={selectedFieldName}
        />
      </div>
      <fieldset
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
            options.length <= visibleOptionsAmount ? { overflowY: `unset` } : {}
          }
        >
          {selectOptions}
        </div>
      </fieldset>
    </div>
  );
};

export default Select;
