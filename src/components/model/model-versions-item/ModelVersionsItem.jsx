import { forwardRef } from "react";

import classes from "./ModelVersionsItem.module.scss";

const ModelVersionsItem = forwardRef(
  ({ component = "li", children, className, saved, active, ...props }, ref) => {
    const ComponentTag = component;
    return (
      <li
        ref={ref}
        className={`${classes.version} ${
          active ? classes["version--active"] : ""
        }
          ${saved ? classes["version--downloaded"] : ""} ${className || ""}`}
      >
        <ComponentTag {...props}>{children}</ComponentTag>
      </li>
    );
  }
);

export default ModelVersionsItem;
