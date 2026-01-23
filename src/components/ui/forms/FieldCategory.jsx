import React from "react";
import classes from "./FieldCategory.module.scss";

/**
 * Presentational wrapper for field category.
 * Displays field content with title.
 *
 * @param {string} title - Field title.
 * @param {React.ReactNode} children - Field content.
 * @param {string} [className] - Optional custom class.
 * @param {object} props - Native props passed to field.
 *
 * @returns {JSX.Element} Fieldset.
 */
const FieldCategory = ({ title, children, className, ...props }) => {
  return (
    <div
      className={`${classes["field-category"]} ${className || ""}`}
      {...props}
    >
      {title && <h3 className={classes["field-title"]}>{title}</h3>}
      {children}
    </div>
  );
};

export default FieldCategory;
