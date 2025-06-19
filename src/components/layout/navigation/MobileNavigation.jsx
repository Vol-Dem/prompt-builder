import { useEffect, useState } from "react";
import classes from "./MobileNavigation.module.scss";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../../store/tabs";
import { createPortal } from "react-dom";
import { imagesActions } from "../../../store/images";
import { modelActions } from "../../../store/model";

const MobileNavigation = () => {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const resetTabsHandler = () => {
    dispatch(tabActions.resetActiveTabs());
    dispatch(imagesActions.resetCollectionListState());
    dispatch(modelActions.setActiveCarouselData({}));
  };

  useEffect(() => {
    if (navIsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = null;
    }

    return () => {
      document.body.style.overflow = null;
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
        document.body
      )}
    </>
  );
};

export default MobileNavigation;
