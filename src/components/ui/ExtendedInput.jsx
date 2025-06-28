import { useCallback, useEffect, useState } from "react";
import classes from "./ExtendedInput.module.scss";
import { validateInput } from "../../utils/generalUtils";
import { useSelector } from "react-redux";

const ExtendedInput = (props) => {
  const {
    id,
    type,
    name,
    label,
    input,
    className,
    onBlur,
    onChange,
    onClick,
    onFocus,
    error,
    autoFocus,
    value,
    placeholder,
    validation,
    showError,
  } = props;
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [categoriesSearchData, setCategoriesSearchData] = useState([]);
  const [subcategoriesSearchResult, setSubcategoriesSearchResult] = useState(
    []
  );

  const categories = useSelector((state) => state.tabs.categoriesData);

  const subcategoriesSearch = useCallback(() => {
    let subcats = [];
    categoriesSearchData.forEach((category) => {
      const subcategories = category?.subcategories?.filter((subcategory) => {
        return subcategory.name
          .toLowerCase()
          .includes(`${searchInput.toLowerCase().trim()}`);
      });

      const subcategoriesData = subcategories.map((subcategory) => {
        return {
          type: category.type,
          id: category.id,
          name: category.name,
          subId: subcategory.id,
          subName: subcategory.name,
        };
      });
      subcats = [...subcats, ...subcategoriesData];
    });

    setSubcategoriesSearchResult(subcats);
  }, [categoriesSearchData, searchInput]);

  useEffect(() => {
    const categoriesArr = Object.keys(categories)?.flatMap((type) => {
      return categories[type]?.map((category) => {
        return {
          type: type,
          ...category,
        };
      });
    });

    setCategoriesSearchData(categoriesArr);
  }, [categories]);

  useEffect(() => {
    subcategoriesSearch(searchInput);
  }, [searchInput, subcategoriesSearch]);

  useEffect(() => {
    setShowErrorMessage(showError);
  }, [showError]);

  useEffect(() => {
    if (!!validation) {
      const { errorMessage } = validateInput(validation, value);

      setInputErrorMessage(errorMessage);
    }
    if (!validation) {
      setShowErrorMessage(false);
    }
  }, [value, validation]);

  return (
    <div className={classes.container}>
      {label && (
        <label htmlFor={id} className={classes.label}>
          {label || ""}
        </label>
      )}
      <input
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
          setSearchInput(e.target.value);
          if (validation) {
            const { isValid, errorMessage } = validateInput(
              validation,
              e.target.value
            );

            onChange(e, isValid, errorMessage);
            setInputErrorMessage(errorMessage);
          } else {
            onChange(e);
          }
        }}
        onClick={onClick}
        onFocus={onFocus}
        placeholder={placeholder}
        {...input}
        className={`${classes.input} ${className || ""} ${
          inputErrorMessage && showErrorMessage ? classes["input--error"] : ""
        }`}
        autoFocus={autoFocus}
        value={value}
      />
      {showErrorMessage && error && (
        <div className={classes.error}>{error}</div>
      )}
      {showErrorMessage && inputErrorMessage && (
        <div className={classes.error}>{inputErrorMessage}</div>
      )}
    </div>
  );
};

export default ExtendedInput;
