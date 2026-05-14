import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
  Ref,
} from "react";
import classes from "./ModelVersionsItem.module.scss";

type ModelVersionsItemProps<T extends ElementType> = {
  component?: T;
  saved: boolean;
  active: boolean;
  children: ReactNode;
  className?: string;
  liRef?: Ref<HTMLLIElement>;
} & ComponentPropsWithoutRef<T>;

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
 * @param props
 * @param props.component - Element or component
 *   used to render the clickable content.
 * @param props.active - Whether this version is currently active.
 * @param props.saved - Whether this version is saved/downloaded.
 * @param props.className - Optional additional class names.
 * @param props.children - Version label.
 *
 * @returns Model version list item.
 */
const ModelVersionsItem = <T extends ElementType = "span">({
  component,
  children,
  className,
  saved,
  active,
  liRef,
  ...props
}: ModelVersionsItemProps<T>) => {
  const ComponentTag = component || "span";
  return (
    <li
      ref={liRef}
      className={`${classes.version} ${active ? classes["version--active"] : ""}
          ${saved ? classes["version--downloaded"] : ""} ${className || ""}`}
    >
      <ComponentTag {...props}>{children}</ComponentTag>
    </li>
  );
};

export default ModelVersionsItem;
