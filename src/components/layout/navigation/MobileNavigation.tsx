import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";

import { tabActions } from "../../../store/tabs";
import classes from "./MobileNavigation.module.scss";
import { imagesActions } from "../../../store/images";
import { modelActions } from "../../../store/model";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import useNavigationDisclosure from "../../../hooks/use-navigation-disclosure";

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
  const disclosure = useNavigationDisclosure();
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const dispatch = useAppDispatch();

  const resetTabsHandler = () => {
    dispatch(tabActions.resetActiveTabs());
    dispatch(imagesActions.resetCollectionListState());
    dispatch(modelActions.setActiveCarouselData(null));
  };

  return (
    <>
      {createPortal(
        <div
          {...disclosure.containerProps}
          className={`${classes["mobile-nav"]} ${
            disclosure.isOpen ? classes["mobile-nav--open"] : ""
          }`}
        >
          <button
            {...disclosure.triggerProps}
            className={classes["mobile-nav__button"]}
            aria-label={
              disclosure.isOpen ? "Close navigation" : "Open navigation"
            }
          >
            <span
              className={classes["mobile-nav__icon"]}
              aria-hidden="true"
            ></span>
          </button>
          <div className={classes["mobile-nav__background"]}></div>
          <nav
            {...disclosure.panelProps}
            aria-label="Mobile"
            className={classes["mobile-nav__nav"]}
          >
            <ul
              className={classes["mobile-nav__links"]}
              onClick={() => disclosure.close(true)}
            >
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
