import { NavLink, useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";

import classes from "./UserNavigation.module.scss";
import ButtonSecondary from "../../ui/buttons/ButtonSecondary";
import { authActions } from "../../../store/auth";
import { tabActions } from "../../../store/tabs";
import { imagesActions } from "../../../store/images";
import { modelActions } from "../../../store/model";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import useNavigationDisclosure from "../../../hooks/use-navigation-disclosure";

/**
 * Application user navigation bar.
 *
 * Displays the current user name and related navigation links, provides a logout
 * option, and resets tab, collection, and active carousel state when navigating
 * between routes.
 *
 * @component
 *
 * @returns {JSX.Element} The user navigation bar element.
 */
const UserNavigation = () => {
  const email = useAppSelector((state) => state.auth.user.email);
  const userName =
    useAppSelector((state) => state.auth.user.userName) || email?.split("@")[0];

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const disclosure = useNavigationDisclosure({ openOnHover: true });

  const logout = () => {
    disclosure.close();
    dispatch(authActions.logout());
    navigate("/", { replace: true });
  };

  const resetTabsHandler = () => {
    disclosure.close(true);
    dispatch(tabActions.resetActiveTabs());
    dispatch(imagesActions.resetCollectionListState());
    dispatch(modelActions.setActiveCarouselData(null));
  };

  return (
    <div
      {...disclosure.containerProps}
      className={classes["nav-profile-container"]}
    >
      <div
        className={`${classes["nav-profile"]} ${disclosure.isOpen ? classes["nav-profile--open"] : ""}`}
      >
        <button
          {...disclosure.triggerProps}
          aria-label={`Account menu${userName ? `: ${userName}` : ""}`}
          className={classes["nav-profile__user"]}
        >
          <span className={classes["nav-profile__name"]}>
            {" "}
            <span>{userName}</span>{" "}
          </span>
          <UserCircleIcon />
        </button>
        <nav
          {...disclosure.panelProps}
          aria-label="Account"
          className={classes["nav-profile__menu"]}
        >
          <ul className={classes["nav-profile__links"]}>
            <li className={classes["nav-profile__link"]}>
              <NavLink to="profile" onClick={resetTabsHandler}>
                Profile
              </NavLink>
            </li>
          </ul>
          <ButtonSecondary
            type="button"
            onClick={logout}
            className={classes["nav-btn-auth"]}
          >
            Logout
          </ButtonSecondary>
        </nav>
      </div>
    </div>
  );
};

export default UserNavigation;
