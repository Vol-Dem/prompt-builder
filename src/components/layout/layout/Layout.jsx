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
  const dispatch = useDispatch();

  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };
  const closeAuth = () => {
    dispatch(authActions.closeAuthForm());
  };

  return (
    <div className={classes.wrapper}>
      <Header>
        <MobileNavigation />
        <div className={classes.logo}>LOGO</div>
        <MainNavigation />
        {isAuth && <UserNavigation />}
        {!isAuth && (
          <Buttton onClick={openAuth} className={classes["btn-auth"]}>
            Sign In
          </Buttton>
        )}
      </Header>

      <main>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      {authIsOpen && (
        <Modal onClose={closeAuth}>
          <AuthForm />
        </Modal>
      )}
      {notificationIsShown && (
        <Notification title={notificationTitle} message={notificationMessage} />
      )}
      <Footer />
    </div>
  );
};

export default Layout;
