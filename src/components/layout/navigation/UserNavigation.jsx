import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { UserCircleIcon } from "@heroicons/react/24/outline";

import classes from "./UserNavigation.module.scss";
import ButttonSecondary from "../../ui/buttons/ButtonSecondary";
import { authActions } from "../../../store/auth";
import { tabActions } from "../../../store/tabs";
import { imagesActions } from "../../../store/images";
import { modelActions } from "../../../store/model";

const UserNavigation = () => {
  const email = useSelector((state) => state.auth.user.email);
  const userName =
    useSelector((state) => state.auth.user.userName) || email.split("@")[0];

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logout = () => {
    dispatch(authActions.logout());
    navigate("/", { replace: true });
  };

  const resetTabsHandler = () => {
    dispatch(tabActions.resetActiveTabs());
    dispatch(imagesActions.resetCollectionListState());
    dispatch(modelActions.setActiveCarouselData({}));
  };

  return (
    <div className={classes["nav-profile-container"]}>
      <div className={classes["nav-profile"]}>
        <div className={classes["nav-profile__user"]}>
          <span className={classes["nav-profile__name"]}>
            {" "}
            <span>{userName}</span>{" "}
          </span>
          <UserCircleIcon />
        </div>
        <div className={classes["nav-profile__menu"]}>
          <ul className={classes["nav-profile__links"]}>
            <li className={classes["nav-profile__link"]}>
              <NavLink to="profile" onClick={resetTabsHandler}>
                Profile
              </NavLink>
            </li>
          </ul>
          <ButttonSecondary
            onClick={logout}
            className={classes["nav-btn-auth"]}
          >
            Logout
          </ButttonSecondary>
        </div>
      </div>
    </div>
  );
};

export default UserNavigation;
