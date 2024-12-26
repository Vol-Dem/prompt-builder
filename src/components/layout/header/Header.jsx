import { useEffect, useLayoutEffect, useRef, useState } from "react";
import classes from "./Header.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../../store/prompt";
import { SETTINGS_STICKY_SWITCH_HEIGHT } from "../../../variables/constants";
import { generalActions } from "../../../store/general";

const Header = ({ children }) => {
  // const [isFixed, setIsFixed] = useState(false);
  const sidePanelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const sidePanelWidth = useSelector((state) => state.used.sidePanelWidth);
  const isFixed = useSelector((state) => state.general.headerIsFixed);
  const positivePromptHeight = useSelector(
    (state) => state.prompt.positivePromptHeight
  );
  const negativePromptHeight = useSelector(
    (state) => state.prompt.negativePromptHeight
  );
  const activeCarouselData = useSelector(
    (state) => state.model.activeCarouselData
  );
  const headerRef = useRef(null);
  const transitionRef = useRef(null);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    const scrollHandler = () => {
      const scrollToTop = document.documentElement.scrollTop;

      // setIsFixed(scrollToTop > SETTINGS_STICKY_SWITCH_HEIGHT);
      // onFixed(scrollToTop > SETTINGS_STICKY_SWITCH_HEIGHT);
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
          // headerRef.current.style.transition = "all 0.3s";
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

  // useLayoutEffect(() => {
  //   // dispatch(promptActions.setHeaderHeight(headerRef.current?.offsetHeight));
  //   // onFixed(isFixed);
  //   // const mainEl = document.querySelector("main");
  //   // if (isFixed && headerRef?.current) {
  //   //   mainEl.style.paddingTop = `${headerRef.current.offsetHeight}px`;
  //   // } else {
  //   //   mainEl.style.paddingTop = null;
  //   // }
  //   // console.log("HEADER", headerRef.current?.offsetHeight);
  //   // onHeightChange(headerRef.current?.offsetHeight);
  //   // dispatch(promptActions.setHeaderHeight(headerRef.current?.offsetHeight));
  // }, [
  //   isFixed,
  //   onFixed,
  //   dispatch,
  //   headerRef?.current?.offsetHeight,
  //   // promptIsOpen,
  //   // positivePromptHeight,
  //   // negativePromptHeight,
  //   // onFixed,
  //   // onHeightChange,
  // ]);

  return (
    <header
      ref={headerRef}
      id="header"
      className={`${classes.header}
       ${isFixed ? classes["header--fixed"] : ""} ${
        activeCarouselData?.versionId ? classes["header--active"] : ""
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
