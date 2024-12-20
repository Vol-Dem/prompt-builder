import { useEffect, useLayoutEffect, useRef, useState } from "react";
import classes from "./Header.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../../store/prompt";

const fixedSwitchHeight = 10;

const Header = ({ onFixed, onHeightChange, children }) => {
  const [isFixed, setIsFixed] = useState(false);
  const sidePanelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
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

  useEffect(() => {
    const scrollHandler = () => {
      const scrollToTop = document.documentElement.scrollTop;

      setIsFixed(scrollToTop > fixedSwitchHeight);

      if (scrollToTop > fixedSwitchHeight) {
        if (transitionRef?.current) {
          clearTimeout(transitionRef.current);
        }

        transitionRef.current = setTimeout(() => {
          headerRef.current.style.transition = "all 0.4s";
        }, 100);
      } else {
        headerRef.current.style.transition = "all 0s";
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
    onFixed,
    onHeightChange,
  ]);

  useEffect(() => {
    // const mainEl = document.querySelector("main");
    // if (isFixed && headerRef?.current) {
    //   mainEl.style.paddingTop = `${headerRef.current.offsetHeight}px`;
    // } else {
    //   mainEl.style.paddingTop = null;
    // }
    onFixed(isFixed);
    console.log("HEADER", headerRef.current?.offsetHeight);
    onHeightChange(headerRef.current?.offsetHeight);
    // dispatch(promptActions.setHeaderHeight(headerRef.current?.offsetHeight));
  }, [
    isFixed,
    promptIsOpen,
    positivePromptHeight,
    negativePromptHeight,
    onFixed,
    onHeightChange,
  ]);

  return (
    <header
      ref={headerRef}
      id="header"
      className={`${classes.header}
       ${isFixed ? classes["header--fixed"] : ""} ${
        activeCarouselData?.modelId ? classes["header--active"] : ""
      }
      ${sidePanelIsOpen && isFixed ? classes["header--open"] : ""}`}
      onResize={() => {
        console.log(headerRef.current?.offsetHeight);
        dispatch(
          promptActions.setHeaderHeight(headerRef.current?.offsetHeight)
        );
      }}
    >
      {children}
    </header>
  );
};

export default Header;
