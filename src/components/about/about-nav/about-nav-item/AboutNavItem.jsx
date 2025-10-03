import { NavLink } from "react-router-dom";
import ListItem from "../../../ui/text/ListItem";
import classes from "./AboutNavItem.module.scss";
import { useSelector } from "react-redux";

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
