import { NavLink } from "react-router-dom";

import ListItem from "../../../ui/text/ListItem";
import classes from "./AboutNavItem.module.scss";
import type { ComponentProps } from "react";
import { useAppSelector } from "../../../../store/hooks/hooks";
import type { AboutNavigationItem } from "../../../../types/general.types";

type AboutNavItemProps = ComponentProps<"a"> & {
  item: AboutNavigationItem;
  onClose: (url: string) => void;
  url: string;
  sub?: boolean;
};

/**
 * Renders a navigation link inside the About section menu.
 * Supports subsections and highlights the active section based on Redux state.
 *
 * @component
 *
 * @param props
 * @param props.item - Navigation item definition.
 * @param props.onClose - Called when the link is clicked.
 * @param props.url - URL segment used to build the about link (e.g., "team").
 * @param props.sub - Whether this navigation item is a subsection.
 * @param props.children - Optional nested navigation content.
 */
const AboutNavItem = ({
  item,
  onClose,
  url,
  sub,
  children,
}: AboutNavItemProps) => {
  const activeAboutSectionId = useAppSelector(
    (state) => state.general.activeAboutSectionId,
  );

  let styles = `${classes.link} ${classes.active}`;

  if (sub && activeAboutSectionId !== `${item.id}`) {
    styles = `${classes.link}`;
  }

  return (
    <ListItem>
      <NavLink
        className={(nav) => (nav.isActive ? styles : classes.link)}
        to={{
          pathname: `/about/${url}`,
          hash: item.id,
        }}
        onClick={() => onClose(url)}
      >
        {item.name}
      </NavLink>
      {children}
    </ListItem>
  );
};

export default AboutNavItem;
