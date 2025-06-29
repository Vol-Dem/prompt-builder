import { useLayoutEffect, useRef } from "react";
import classes from "./Header.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { SETTINGS_STICKY_SWITCH_HEIGHT } from "../../../variables/constants";
import { generalActions } from "../../../store/general";

const Header = ({ children }) => {
  const sidePanelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const sidePanelWidth = useSelector((state) => state.used.sidePanelWidth);
  const isFixed = useSelector((state) => state.general.headerIsFixed);
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const headerRef = useRef(null);
  const transitionRef = useRef(null);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    const scrollHandler = () => {
      const scrollToTop = document.documentElement.scrollTop;

      dispatch(
        generalActions.setHeaderIsFixed(
          scrollToTop >= SETTINGS_STICKY_SWITCH_HEIGHT
        )
      );

      if (scrollToTop >= SETTINGS_STICKY_SWITCH_HEIGHT) {
        if (transitionRef?.current) {
          clearTimeout(transitionRef.current);
        }

        transitionRef.current = setTimeout(() => {
          headerRef.current.style.transitionDuration = "0.3s";
        }, 500);
      } else {
        headerRef.current.style.transitionDuration = "0s";
      }
    };
    document.addEventListener("scroll", scrollHandler);

    return () => {
      document.removeEventListener("scroll", scrollHandler);
      clearTimeout(transitionRef?.current);
    };
  }, [
    sidePanelIsOpen,
    promptIsOpen,
    headerRef.current?.offsetHeight,
    dispatch,
  ]);

  return (
    <header
      ref={headerRef}
      id="header"
      className={`${classes.header}
       ${isFixed ? classes["header--fixed"] : ""} ${
        activeCarouselData?.images?.length ? classes["header--active"] : ""
      }
      ${sidePanelIsOpen && isFixed ? classes["header--aside-open"] : ""}`}
      style={{
        "--padding-right": `${sidePanelWidth}px`,
      }}
    >
      {children}
    </header>
  );
};

export default Header;
