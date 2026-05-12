import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";

import { tabActions } from "../../../store/tabs";
import classes from "./MobileNavigation.module.scss";
import { imagesActions } from "../../../store/images";
import { modelActions } from "../../../store/model";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Application main navigation bar for mobile devices.
 *
 * Displays different navigation links depending on the authentication state
 * and resets tab, collection, and active carousel state when navigating
 * between routes.
 *
 * @component
 *
 * @returns The main navigation element for mobile devices.
 */
const MobileNavigation = () => {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const dispatch = useAppDispatch();

  const resetTabsHandler = () => {
    dispatch(tabActions.resetActiveTabs());
    dispatch(imagesActions.resetCollectionListState());
    dispatch(modelActions.setActiveCarouselData(null));
  };

  useEffect(() => {
    if (navIsOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "scroll";
    }

    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, [navIsOpen]);

  const navSwitch = () => {
    setNavIsOpen((prevState) => !prevState);
  };

  return (
    <>
      {createPortal(
        <div
          className={`${classes["mobile-nav"]} ${
            navIsOpen ? classes["mobile-nav--open"] : ""
          }`}
        >
          <div className={classes["mobile-nav__button"]} onClick={navSwitch}>
            <span className={classes["mobile-nav__icon"]}></span>
          </div>
          <div className={classes["mobile-nav__background"]}></div>
          <nav className={classes["mobile-nav__nav"]}>
            <ul className={classes["mobile-nav__links"]} onClick={navSwitch}>
              <li>
                <NavLink to="/" onClick={resetTabsHandler}>
                  {isAuth ? "Models" : "Home"}
                </NavLink>
              </li>
              {isAuth && (
                <>
                  <li>
                    <NavLink
                      to="images"
                      className={(nav) => (nav.isActive ? classes.active : "")}
                      onClick={resetTabsHandler}
                    >
                      Images
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="profile" onClick={resetTabsHandler}>
                      Profile
                    </NavLink>
                  </li>
                </>
              )}
              <li>
                <NavLink to="about" onClick={resetTabsHandler}>
                  About
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
};

export default MobileNavigation;
