import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ListBulletIcon } from "@heroicons/react/24/outline";

import List from "../../ui/text/List";
import { ABOUT_NAV_DATA } from "../../../variables/constants";
import { smoothScroll } from "../../../utils/generalUtils";
import LeftSidebar from "../../layout/left-sidebar/LeftSidebar";
import AboutNavItem from "./about-nav-item/AboutNavItem";

/**
 * Navigation component for the About section.
 *
 * Handles opening and closing the sidebar navigation, smooth scrolling to
 * hash-based sections, and rendering nested navigation items from the
 * ABOUT_NAV_DATA structure.
 *
 * @component
 *
 * @returns The About navigation sidebar with section links.
 */
const AboutNav = () => {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;

    //Smooth-scrolls to target sections when URL hash changes
    if (hash) {
      smoothScroll(hash);
    }
  }, [location]);

  const openNavHandler = () => {
    setNavIsOpen(true);
  };

  const closeNavHandler = (url?: string) => {
    const curPageUrl = location.pathname.split("/").slice(-1)[0];

    //If navigating to a different page, resets the scroll position to the top.
    if (curPageUrl !== url) window.scrollTo(0, 0);

    setNavIsOpen(false);
  };

  const aboutNavItemsHtml = ABOUT_NAV_DATA.map((item) => {
    const subNavHtml = item.subNav.map((subItem) => {
      return (
        <AboutNavItem
          key={subItem.id}
          item={subItem}
          url={item.url}
          onClose={closeNavHandler}
          sub
        />
      );
    });

    return (
      <AboutNavItem
        key={item.id}
        item={item}
        url={item.url}
        onClose={closeNavHandler}
      >
        {!!item?.subNav.length && <List sub>{subNavHtml}</List>}
      </AboutNavItem>
    );
  });

  return (
    <>
      <LeftSidebar
        isOpen={navIsOpen}
        onClose={closeNavHandler}
        onOpen={openNavHandler}
        btnContent={<ListBulletIcon />}
      >
        <List>{aboutNavItemsHtml}</List>
      </LeftSidebar>
    </>
  );
};

export default AboutNav;
