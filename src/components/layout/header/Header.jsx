import { useEffect, useRef, useState } from "react";
import classes from "./Header.module.scss";
import { useSelector } from "react-redux";

const Header = (props) => {
  const [isFixed, setIsFixed] = useState(false);
  const sidePanelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const headerRef = useRef(null);
  const transitionRef = useRef(null);

  // useEffect(() => {
  //   if (isFixed) {
  //     // setTimeout(() => {
  //     // }, 100);
  //     headerRef.current.style.transition = "all 0.4s";
  //   } else {
  //     headerRef.current.style.transition = "all 0s";
  //   }
  // }, [isFixed]);

  useEffect(() => {
    const scrollHandler = () => {
      const scrollToTop = document.documentElement.scrollTop;
      // headerRef.current.style.transition = "all 0s";
      setIsFixed(scrollToTop > 255);

      if (scrollToTop > 255) {
        if (transitionRef?.current) {
          clearTimeout(transitionRef.current);
        }

        transitionRef.current = setTimeout(() => {
          headerRef.current.style.transition = "all 0.4s";
        }, 100);
      } else {
        headerRef.current.style.transition = "all 0s";
      }

      // if (scrollToTop > 1000) {
      //   document.querySelector("main").style.paddingTop = "255.2px";
      // } else {
      //   document.querySelector("main").style.paddingTop = "0";
      // }
    };
    document.addEventListener("scroll", scrollHandler);

    return () => {
      document.removeEventListener("scroll", scrollHandler);
      clearTimeout(transitionRef?.current);
    };
  }, [sidePanelIsOpen]);

  return (
    <header
      ref={headerRef}
      id="header"
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
