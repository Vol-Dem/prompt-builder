import { NavLink } from "react-router-dom";
import classes from "./MainNavigation.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../../store/tabs";

function MainNavigation() {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const resetTabsHandler = () => {
    dispatch(tabActions.resetActiveTabs());
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
              Home
            </NavLink>
          </li>
          {/* {isAuth && (
            <>
              <li>
                <NavLink
                  to="profile"
                  className={(nav) => (nav.isActive ? classes.active : "")}
                  onClick={resetTabsHandler}
                >
                  Profile
                </NavLink>
              </li>
            </>
          )} */}
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
