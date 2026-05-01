import type { ComponentProps } from "react";
import classes from "./NsfwSwitchInput.module.scss";

type NsfwSwitchInputProps = ComponentProps<"input">;

const NsfwSwitchInput = ({
  id,
  value,
  name,
  defaultChecked,
  className,
  children,
  ...props
}: NsfwSwitchInputProps) => {
  return (
    <div>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className={`${classes["mode__input"]} ${className || ""}`}
        {...props}
      />
      <label htmlFor={id} className={classes["mode__label"]}>
        {children}
      </label>
    </div>
  );
};

export default NsfwSwitchInput;
