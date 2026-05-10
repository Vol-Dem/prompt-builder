import { useLayoutEffect, useRef, type ComponentProps } from "react";

import classes from "./Header.module.scss";
import { SETTINGS_STICKY_SWITCH_HEIGHT } from "../../../variables/constants";
import { generalActions } from "../../../store/general";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { CSSVariables } from "../../../types/general.types";

type HeaderProps = ComponentProps<"header">;

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
 * @param props
 * @param props.children - Header content.
 *
 * @returns The application header element.
 */
const Header = ({ children }: HeaderProps) => {
  const sidePanelIsOpen = useAppSelector((state) => state.used.panelIsOpen);
  const promptIsOpen = useAppSelector((state) => state.prompt.promptIsOpen);
  const sidePanelWidth = useAppSelector((state) => state.used.sidePanelWidth);
  const isFixed = useAppSelector((state) => state.general.headerIsFixed);
  const activeCarouselData = useAppSelector(
    (state) => state.model.activeCarouselData,
  );
  const headerRef = useRef<HTMLElement>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout>>(null);
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    const scrollHandler = () => {
      const scrollToTop = document.documentElement.scrollTop;

      dispatch(
        generalActions.setHeaderIsFixed(
          scrollToTop >= SETTINGS_STICKY_SWITCH_HEIGHT,
        ),
      );

      if (scrollToTop >= SETTINGS_STICKY_SWITCH_HEIGHT) {
        if (transitionRef?.current) {
          clearTimeout(transitionRef.current);
        }

        // Enables smooth transition only after header becomes sticky
        transitionRef.current = setTimeout(() => {
          if (headerRef.current)
            headerRef.current.style.transitionDuration = "0.3s";
        }, 500);
      } else {
        // Remove transition immediately when header returns to normal flow
        if (headerRef.current)
          headerRef.current.style.transitionDuration = "0s";
      }
    };
    document.addEventListener("scroll", scrollHandler);

    return () => {
      document.removeEventListener("scroll", scrollHandler);
      if (transitionRef?.current) clearTimeout(transitionRef.current);
    };
  }, [
    sidePanelIsOpen,
    promptIsOpen,
    headerRef.current?.offsetHeight,
    dispatch,
  ]);

  const style: CSSVariables = {
    "--padding-right": `${sidePanelWidth}px`,
  };

  return (
    <header
      ref={headerRef}
      id="header"
      className={`${classes.header}
       ${isFixed ? classes["header--fixed"] : ""} ${
         activeCarouselData?.images?.length ? classes["header--active"] : ""
       }
      ${sidePanelIsOpen && isFixed ? classes["header--aside-open"] : ""}`}
      style={style}
    >
      {children}
    </header>
  );
};

export default Header;
