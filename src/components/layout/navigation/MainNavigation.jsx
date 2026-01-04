import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import classes from "./MainNavigation.module.scss";
import { tabActions } from "../../../store/tabs";
import { imagesActions } from "../../../store/images";
import { modelActions } from "../../../store/model";

/**
 * Application main navigation bar.
 *
 * Displays different navigation links depending on the authentication state
 * and resets tab, collection, and active carousel state when navigating
 * between routes.
 *
 * @component
 *
 * @returns {JSX.Element} The main navigation element.
 */
function MainNavigation() {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const resetTabsHandler = () => {
    dispatch(tabActions.resetActiveTabs());
    dispatch(imagesActions.resetCollectionListState());
    dispatch(modelActions.setActiveCarouselData({}));
  };

  return (
    <>
      <nav className={classes.nav}>
        <ul className={classes["nav__links"]}>
          <li>
            <NavLink
              to="/"
              className={(nav) => (nav.isActive ? classes.active : "")}
              onClick={resetTabsHandler}
            >
              {isAuth ? "Models" : "Home"}
            </NavLink>
          </li>
          {isAuth && (
            <li>
              <NavLink
                to="images"
                className={(nav) => (nav.isActive ? classes.active : "")}
                onClick={resetTabsHandler}
              >
                Images
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to="about"
              className={(nav) => (nav.isActive ? classes.active : "")}
              onClick={resetTabsHandler}
            >
              About
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default MainNavigation;
