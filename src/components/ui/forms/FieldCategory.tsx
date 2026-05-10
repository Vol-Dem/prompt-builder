import type { ComponentProps } from "react";
import classes from "./FieldCategory.module.scss";

type FieldCategoryProps = ComponentProps<"div">;

/**
 * Presentational wrapper for field category.
 * Displays field content with title.
 *
 * @param props - Native props passed to field.
 * @param props.title - Field title.
 * @param props.children - Field content.
 * @param props.className - Optional custom class.
 *
 * @returns {JSX.Element} Fieldset.
 */
const FieldCategory = ({
  title,
  children,
  className,
  ...props
}: FieldCategoryProps) => {
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
