import type { ComponentProps } from "react";
import classes from "./ResourceTypeLabel.module.scss";

type ResourceTypeLabelProps = ComponentProps<"div"> & {
  type?: string;
};

/**
 * Displays a resource label with a background color based on its type.
 *
 * @component
 *
 * @param {object} props
 * @param {'model' | 'collection'} [props.type] - Resource type that controls the label style.
 * @param {string} [props.className] - Optional CSS class for custom styling.
 * @param {React.ReactNode} props.children - Label content.
 *
 * @returns {JSX.Element} The styled resource type label.
 */
const ResourceTypeLabel = ({
  type,
  children,
  className,
}: ResourceTypeLabelProps) => {
  return (
    <div
      className={`${classes["type"]} ${
        type ? classes[`type--${type?.toLowerCase()}`] : ""
      } ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default ResourceTypeLabel;
