import { NavLink } from "react-router-dom";
import classes from "./MainNavigation.module.scss";
import { useDispatch } from "react-redux";
import { tabActions } from "../../../store/tabs";

function MainNavigation() {
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
