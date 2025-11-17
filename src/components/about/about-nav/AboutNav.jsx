import { useLocation } from "react-router-dom";
import List from "../../ui/text/List";
import { ABOUT_NAV_DATA } from "../../../variables/constants";
import { useEffect, useState } from "react";
import { smoothScroll } from "../../../utils/generalUtils";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import LeftSidebar from "../../layout/left-sidebar/LeftSidebar";
import AboutNavItem from "./about-nav-item/AboutNavItem";

const AboutNav = () => {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;

    if (hash) {
      smoothScroll(hash);
    }
  }, [location]);

  const openNavHandler = () => {
    setNavIsOpen(true);
  };

  const closeNavHandler = (url) => {
    const curPageUrl = location.pathname.split("/").slice(-1)[0];
    if (curPageUrl !== url) window.scrollTo(0, 0);
    setNavIsOpen(false);
  };

  const aboutNavItemsHrml = ABOUT_NAV_DATA.map((item, i) => {
    const subNavHtml = item.subNav.map((subItem, j) => {
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
        <List>{aboutNavItemsHrml}</List>
      </LeftSidebar>
    </>
  );
};

export default AboutNav;
