import { NavLink, useLocation } from "react-router-dom";
import classes from "./AboutNavBtnContainer.module.scss";
import { ABOUT_NAV_DATA } from "../../../variables/constants";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

/**
 * Navigation buttons for the About section.
 *
 * Handles navigation between nested About section pages
 *
 * @component
 *
 * @returns {JSX.Element} The About navigation buttons.
 */
const AboutNavBtnContainer = () => {
  const location = useLocation();
  const curPageUrl = location.pathname.split("/").slice(-1)[0];
  const curLocationDataIndex = Math.max(
    ABOUT_NAV_DATA.findIndex((nav) => nav.url === curPageUrl),
    0
  );
  const btnLeftData = ABOUT_NAV_DATA[curLocationDataIndex - 1];
  const btnRightData = ABOUT_NAV_DATA[curLocationDataIndex + 1];

  /**
   * Resets the scroll position to the top.
   */
  const resetScrollHandler = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      {curLocationDataIndex >= 0 && (
        <div className={classes.container}>
          {btnLeftData && (
            <NavLink
              to={{
                pathname: `/about/${btnLeftData.url}`,
                hash: btnLeftData.id,
              }}
              className={`${classes.btn} ${classes["btn--left"]}`}
              onClick={resetScrollHandler}
            >
              <ChevronLeftIcon /> {btnLeftData.name}
            </NavLink>
          )}
          {btnRightData && (
            <>
              <NavLink
                to={{
                  pathname: `/about/${btnRightData.url}`,
                  hash: btnRightData.id,
                }}
                className={`${classes.btn} ${classes["btn--right"]}`}
                onClick={resetScrollHandler}
              >
                {btnRightData.name} <ChevronRightIcon />{" "}
              </NavLink>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AboutNavBtnContainer;
