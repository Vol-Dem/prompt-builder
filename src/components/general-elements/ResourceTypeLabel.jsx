import classes from "./ResourceTypeLabel.module.scss";

const ResourceTypeLabel = ({ type, children, className }) => {
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
