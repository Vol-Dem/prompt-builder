import type { ComponentProps } from "react";
import classes from "./Checkbox.module.scss";

type CheckboxProps = ComponentProps<"input"> & { label: string };

/**
 * Presentational wrapper for checkbox inputs.
 * Binds <label> to <input> and applies app-specific styles.
 *
 * @param {string} id - Input id used for label binding.
 * @param {string} label - Text label shown next to checkbox.
 * @param {string} [className] - Optional custom class.
 * @param {boolean} [disabled] - Disables the checkbox and applies disabled styles.
 * @param {object} props - Native input props passed to <input>.
 *
 * @returns {JSX.Element} Checkbox input.
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
