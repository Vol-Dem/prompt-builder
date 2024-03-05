import classes from "./Select.module.scss";
// import { ReactComponent as BoxEmptyImg } from "./../assets/layout/boxempty.svg";
import { useEffect, useRef, useState } from "react";
import Input from "./Input";

const Select = ({ options, onChange, className }) => {
  const [selectIsOpen, setSelectIsOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(options[0].name);
  const [optionsFieldHeight, setOptionsFieldHeight] = useState(15);
  const visibleOptionsAmount = 3;
  const labeldRef = useRef();
  const inputRef = useRef();

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
    console.log(selectHeight);
    // console.log(labelStyle);
    // console.log(labeldRef.current.clientHeight);
  }, [visibleOptionsAmount, options.length, selectIsOpen]);

  const onBoxSizeChange = (e) => {
    setSelectedField(e.target.dataset.name);
    onChange(e);
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
          id={`select-${i}`}
          name="option"
          value={item.value}
          data-name={item.name}
        />
        <label
          ref={labeldRef}
          className={classes["select__label"]}
          htmlFor={`select-${i}`}
        >
          <div className={classes["select__title"]}>
            <span>{item.name}</span>
          </div>
        </label>
      </div>
    );
  });

  return (
    <div className={`${classes["select"]} ${className}`} onClick={onShowSelect}>
      <span
        className={`${classes["select__arrow"]} ${
          selectIsOpen ? classes["select__arrow--open"] : ""
        }`}
      ></span>
      <Input
        className={classes["select__input"]}
        type="text"
        placeholder="Select size"
        input={{ readOnly: true }}
        value={selectedField}
      />
      <fieldset
        style={
          optionsFieldHeight && selectIsOpen
            ? { height: `${optionsFieldHeight}px` }
            : {}
        }
        className={`${classes["select__field"]} ${
          !selectIsOpen ? classes["select__field--hide"] : ""
        }`}
        onChange={onBoxSizeChange}
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
