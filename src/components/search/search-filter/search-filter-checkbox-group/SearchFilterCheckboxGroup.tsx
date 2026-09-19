import type { ChangeEventHandler } from "react";

import Checkbox from "../../../ui/forms/Checkbox";
import classes from "./SearchFilterCheckboxGroup.module.scss";

type SearchFilterCheckboxGroupProps = {
  title: string;
  options: {
    id: string;
    name: string;
    label: string;
    value: boolean;
    disabled?: boolean;
  }[];
  checkedCount: number;
  maxAllowed: number;
  showSelectionCount: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const SearchFilterCheckboxGroup = ({
  title,
  options,
  checkedCount,
  maxAllowed,
  showSelectionCount,
  onChange,
}: SearchFilterCheckboxGroupProps) => {
  return (
    <div>
      <div className={classes["filter__name"]}>
        {title}{" "}
        {showSelectionCount && (
          <span
            className={`${classes["filter__checked"]} ${
              checkedCount === maxAllowed ? classes["filter__limit"] : ""
            }`}
          >
            ({checkedCount} / {maxAllowed})
          </span>
        )}
      </div>
      <ul className={classes["filter__field"]}>
        {options.map((option) => (
          <li key={option.id}>
            <Checkbox
              id={option.id}
              name={option.name}
              checked={option.value}
              label={option.label}
              onChange={onChange}
              disabled={option.disabled}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchFilterCheckboxGroup;
