import { NavLink } from "react-router-dom";
import ListItem from "../../../ui/text/ListItem";
import classes from "./AboutNavItem.module.scss";
import { useSelector } from "react-redux";

/**
 * Renders a navigation link inside the About section menu.
 * Supports subsections and highlights the active section based on Redux state.
 *
 * @component
 *
 * @param {object} props
 * @param {{ id: string, name: string }} props.item - Navigation item definition.
 * @param {() => void} props.onClose - Called when the link is clicked.
 * @param {string} props.url - URL segment used to build the about link (e.g., "team").
 * @param {boolean} [props.sub=false] - Whether this navigation item is a subsection.
 * @param {React.ReactNode} [props.children] - Optional nested navigation content.
 */
const AboutNavItem = ({ item, onClose, url, sub, children }) => {
  const activeAboutSectionId = useSelector(
    (state) => state.general.activeAboutSectionId
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
