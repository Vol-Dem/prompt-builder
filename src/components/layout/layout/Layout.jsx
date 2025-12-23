import classes from "./Layout.module.scss";
import { NavLink, Outlet } from "react-router-dom";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import MainNavigation from "../navigation/MainNavigation";
import MobileNavigation from "../navigation/MobileNavigation";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../../../store/auth";
import UserNavigation from "../navigation/UserNavigation";
import Buttton from "../../ui/Button";
import Modal from "../../ui/Modal";
import AuthForm from "../../forms/Auth/AuthForm";
import { Suspense, useRef } from "react";
import Spinner from "../../ui/Spinner";
import Prompt from "../../prompt/Prompt";
import SearchField from "../../search/SearchField";
import UploadingPanel from "../../uploading-panel/UploadingPanel";
import ActiveCarousel from "../../active-carousel/ActiveCarousel";
import { tabActions } from "../../../store/tabs";
import VerifyEmailMessage from "../../notification-messages/VerifyEmailMessage";
import Maintenance from "../maintenance/Maintenance";
import { AnimatePresence } from "framer-motion";
import NsfwSwitch from "../../ui/nsfw-switch/NsfwSwitch";
import ScrollToTop from "../../ui/ScrollToTop";
import LayoutContentWrap from "./LayoutContentWrap";
import Notifications from "../notifications/Notifications";
import RightSidebar from "../right-sidebar/RightSidebar";
import logo from "../../../assets/logo-730.webp";

const Layout = () => {
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const emailVerified = useSelector((state) => state.auth.user.emailVerified);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  const headerRef = useRef(null);
  const maintenance = useSelector((state) => state.notification.maintenance);
  const dispatch = useDispatch();

  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };
  const closeAuth = () => {
    dispatch(authActions.closeAuthForm());
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.content}>
        <Header>
          <div ref={headerRef} className={classes["menu-container"]}>
            <div className="wrapper">
              <div className={classes.menu}>
                <MobileNavigation />
                <div className={classes.logo}>
                  <NavLink
                    to="/"
                    className={(nav) => (nav.isActive ? classes.active : "")}
                    onClick={() => {
                      dispatch(tabActions.resetActiveTabs());
                    }}
                  >
                    <img src={logo} alt="Logo" width={1088} height={188} />
                  </NavLink>
                </div>
                {!maintenance && <MainNavigation />}
                {isAuth && !maintenance && (
                  <>
                    <SearchField />
                    <UploadingPanel />
                    <NsfwSwitch />
                  </>
                )}

                {isAuth && !maintenance && <UserNavigation />}
                {!isAuth && (
                  <Buttton onClick={openAuth} className={classes["btn-auth"]}>
                    Sign In
                  </Buttton>
                )}
              </div>
            </div>
          </div>
          {!maintenance && <Prompt />}
          <AnimatePresence>
            <ActiveCarousel />
          </AnimatePresence>
        </Header>

        <LayoutContentWrap headerRef={headerRef}>
          {!maintenance && (
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          )}
          {maintenance && <Maintenance />}
        </LayoutContentWrap>
        <AnimatePresence>
          {authIsOpen && (
            <Modal onClose={closeAuth}>
              {!isAuth && <AuthForm />}
              {isAuth && !emailVerified && <VerifyEmailMessage />}
            </Modal>
          )}
        </AnimatePresence>
        <Notifications />
        <Footer />
      </div>
      {!maintenance && <RightSidebar />}
      <ScrollToTop />
    </div>
  );
};

export default Layout;
