import classes from "./ModelVersionsItem.module.scss";

/**
 * Model versions list item.
 *
 * Renders a single model version entry and supports polymorphic rendering
 * via the `component` prop.
 *
 * Can render as:
 * - A navigation link (e.g. React Router NavLink)
 * - A non-navigational element (e.g. span or button)
 *
 * Visual state reflects whether the version is active and/or saved.
 *
 * @component
 *
 * @param {object} props
 * @param {React.ElementType} [props.component="span"] - Element or component
 *   used to render the clickable content.
 * @param {boolean} props.active - Whether this version is currently active.
 * @param {boolean} props.saved - Whether this version is saved/downloaded.
 * @param {string} [props.className] - Optional additional class names.
 * @param {React.ReactNode} props.children - Version label.
 *
 * @returns {JSX.Element} Model version list item.
 */
const ModelVersionsItem = ({
  component = "span",
  children,
  className,
  saved,
  active,
  ref,
  ...props
}) => {
  const ComponentTag = component;
  return (
    <li
      ref={ref}
      className={`${classes.version} ${active ? classes["version--active"] : ""}
          ${saved ? classes["version--downloaded"] : ""} ${className || ""}`}
    >
      <ComponentTag {...props}>{children}</ComponentTag>
    </li>
  );
};

export default ModelVersionsItem;
