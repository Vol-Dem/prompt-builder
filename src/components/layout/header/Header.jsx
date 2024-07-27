import { useEffect, useRef, useState } from "react";
import classes from "./Header.module.scss";
import { useSelector } from "react-redux";

const Header = (props) => {
  const [isFixed, setIsFixed] = useState(false);
  const sidePanelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const headerRef = useRef(null);

  useEffect(() => {
    if (isFixed) {
      setTimeout(() => {
        headerRef.current.style.transition = "all 0.4s";
      }, 100);
    } else {
      headerRef.current.style.transition = "all 0s";
    }
  }, [isFixed]);

  useEffect(() => {
    const scrollHandler = () => {
      const scrollToTop = document.documentElement.scrollTop;
      // headerRef.current.style.transition = "all 0s";
      setIsFixed(scrollToTop > 1000);

      // if (scrollToTop > 1000) {
      //   document.querySelector("main").style.paddingTop = "255.2px";
      // } else {
      //   document.querySelector("main").style.paddingTop = "0";
      // }
    };
    document.addEventListener("scroll", scrollHandler);

    return () => {
      document.removeEventListener("scroll", scrollHandler);
    };
  }, [sidePanelIsOpen]);

  return (
    <header
      ref={headerRef}
      className={`${classes.header}
       ${isFixed ? classes["header--fixed"] : ""} 
       ${isFixed && promptIsOpen ? classes["header--fixed-open"] : ""} 
      ${isFixed && !promptIsOpen ? classes["header--fixed-closed"] : ""} 
      ${sidePanelIsOpen && isFixed ? classes["header--open"] : ""}`}
    >
      {props.children}
    </header>
  );
};

export default Header;
