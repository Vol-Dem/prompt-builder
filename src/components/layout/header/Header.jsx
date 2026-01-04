import { useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import classes from "./Header.module.scss";
import { SETTINGS_STICKY_SWITCH_HEIGHT } from "../../../variables/constants";
import { generalActions } from "../../../store/general";

/**
 * Application header container with sticky behavior and dynamic layout offsets.
 *
 * Listens to page scroll position to toggle a fixed header mode, applies delayed
 * CSS transitions when switching to the sticky state, and dynamically adjusts
 * right padding based on the side panel width. The header style also reflects
 * the active carousel state and whether the side panel is open.
 *
 * @component
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Header content.
 *
 * @returns {JSX.Element} The application header element.
 */
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

        // Enables smooth transition only after header becomes sticky
        transitionRef.current = setTimeout(() => {
          headerRef.current.style.transitionDuration = "0.3s";
        }, 500);
      } else {
        // Remove transition immediately when header returns to normal flow
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
