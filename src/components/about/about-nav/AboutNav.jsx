import { NavLink, useLocation } from "react-router-dom";
import classes from "./AboutNav.module.scss";
import List from "../../ui/text/List";
import ListItem from "../../ui/text/ListItem";
import { ABOUT_NAV_DATA } from "../../../variables/constants";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { smoothScroll } from "../../../utils/generalUtils";
import ButtonTertiary from "../../ui/ButtonTertiary";
import { motion } from "framer-motion";

const AboutNav = () => {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const location = useLocation();
  const activeAboutSectionId = useSelector(
    (state) => state.general.activeAboutSectionId
  );

  useEffect(() => {
    const hash = location.hash;

    if (hash) {
      smoothScroll(hash);
    }
  }, [location]);

  const navHandler = () => {
    setNavIsOpen((prev) => !prev);
  };

  const closeNav = (url) => {
    const curPageUrl = location.pathname.split("/").slice(-1)[0];
    if (curPageUrl !== url) window.scrollTo(0, 0);
    setNavIsOpen(false);
  };

  const aboutNavItemsHrml = ABOUT_NAV_DATA.map((item, i) => {
    const subNavHtml = item.subNav.map((subItem, j) => {
      return (
        <ListItem key={j}>
          <NavLink
            className={(nav) =>
              nav.isActive && activeAboutSectionId === `${subItem.id}`
                ? `${classes.link} ${classes.active}`
                : classes.link
            }
            to={{
              pathname: `/about/${item.url}`,
              hash: subItem.id,
            }}
            onClick={closeNav.bind(null, item.url)}
          >
            {subItem.name}
          </NavLink>
        </ListItem>
      );
    });

    return (
      <ListItem key={i}>
        <NavLink
          className={(nav) =>
            nav.isActive ? `${classes.link} ${classes.active}` : classes.link
          }
          to={{
            pathname: `/about/${item.url}`,
            hash: item.id,
          }}
          onClick={closeNav.bind(null, item.url)}
        >
          {item.name}
        </NavLink>
        {!!item?.subNav.length && <List sub>{subNavHtml}</List>}
      </ListItem>
    );
  });

  return (
    <>
      <ButtonTertiary className={classes["nav-btn"]} onClick={navHandler}>
        Menu
      </ButtonTertiary>
      <motion.div
        animate={{ left: navIsOpen ? 0 : "-100%" }}
        // transition={{ type: "spring", bounce: 0.3 }}
        className={`${classes["sidebar"]}`}
      >
        <List>
          {/* <ListItem>
            <NavLink
              className={(nav) =>
                location.pathname === "/about"
                  ? `${classes.link} ${classes.active}`
                  : classes.link
              }
              to={{
                pathname: `/about`,
                hash: "about",
              }}
            >
              About
            </NavLink>
          </ListItem> */}
          {aboutNavItemsHrml}
        </List>
      </motion.div>
    </>
  );
};

export default AboutNav;
