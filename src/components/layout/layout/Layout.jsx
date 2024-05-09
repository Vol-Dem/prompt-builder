import React from "react";
import classes from "./Layout.module.scss";
import { Outlet } from "react-router-dom";
import Footer from "../footer/Footer";

// const Layout = () => {
//   return (
//     <div>
//       <Outlet />
//       <Footer />
//     </div>
//   );
// };

// export default Layout;

import Header from "../header/Header";
import MainNavigation from "../navigation/MainNavigation";
import MobileNavigation from "../navigation/MobileNavigation";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../../../store/auth";
import UserNavigation from "../navigation/UserNavigation";
import Buttton from "../../ui/Button";
import Modal from "../../ui/Modal";
import AuthForm from "../../forms/Auth/AuthForm";
import { Suspense } from "react";
import Spinner from "../../ui/Spinner";
import Notification from "../../ui/Notification";
import Prompt from "../../prompt/Prompt";
import UsedModelsPanel from "../../used-models-panel/UsedModelsPanel";
import { modelActions } from "../../../store/model";
import Search from "../../search/Search";
import UploadingPanel from "../../uploading-panel/UploadingPanel";

const Layout = () => {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  const notificationIsShown = useSelector(
    (state) => state.notification.isShown
  );
  const notificationTitle = useSelector((state) => state.notification.title);
  const notificationMessage = useSelector(
    (state) => state.notification.message
  );
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();

  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };
  const closeAuth = () => {
    dispatch(authActions.closeAuthForm());
  };

  const nsfwSwitchHandler = () => {
    dispatch(modelActions.setNsfwMode(!isNsfwMode));
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.content}>
        <Header>
          <div className={classes["menu-container"]}>
            <div className="wrapper">
              <div className={classes.menu}>
                <MobileNavigation />
                <div className={classes.logo}>LOGO</div>
                <MainNavigation />
                <Search />
                <div className={classes["mode-switch"]}>
                  <button
                    type="button"
                    onClick={nsfwSwitchHandler}
                    className={`${classes["btn-mode"]} ${
                      !isNsfwMode ? classes["btn-mode--active"] : ""
                    }`}
                  >
                    SFW
                  </button>
                  <button
                    type="button"
                    onClick={nsfwSwitchHandler}
                    className={`${classes["btn-mode"]} ${
                      isNsfwMode ? classes["btn-mode--active"] : ""
                    }`}
                  >
                    NSFW
                  </button>
                </div>
                <UploadingPanel />

                {isAuth && <UserNavigation />}
                {!isAuth && (
                  <Buttton onClick={openAuth} className={classes["btn-auth"]}>
                    Sign In
                  </Buttton>
                )}
              </div>
            </div>
          </div>
          <div className="wrapper">
            <Prompt />
          </div>
        </Header>

        <main>
          <div className="wrapper">
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        {authIsOpen && (
          <Modal onClose={closeAuth}>
            <AuthForm />
          </Modal>
        )}
        {notificationIsShown && (
          <Notification
            title={notificationTitle}
            message={notificationMessage}
          />
        )}
        <Footer />
      </div>
      <UsedModelsPanel />
    </div>
  );
};

export default Layout;
