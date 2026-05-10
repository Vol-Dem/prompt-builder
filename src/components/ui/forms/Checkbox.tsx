import type { ComponentProps, ReactNode } from "react";
import classes from "./Checkbox.module.scss";

type CheckboxProps = ComponentProps<"input"> & { label: string | ReactNode };

/**
 * Presentational wrapper for checkbox inputs.
 * Binds <label> to <input> and applies app-specific styles.
 *
 * @param props - Native input props passed to <input>.
 * @param props.id - Input id used for label binding.
 * @param props.label - Text label shown next to checkbox.
 * @param props.className - Optional custom class.
 * @param props.disabled - Disables the checkbox and applies disabled styles.
 *
 * @returns Checkbox input.
 */
const Checkbox = ({
  id,
  label,
  className,
  disabled,
  ...props
}: CheckboxProps) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`${classes.label} ${disabled ? classes.disabled : ""}`}
      >
        <input
          type="checkbox"
          id={id}
          className={`${classes.checkbox} ${className || ""}`}
          disabled={disabled}
          {...props}
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
