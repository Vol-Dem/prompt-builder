import { NavLink, Outlet } from "react-router-dom";
import { Suspense, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import classes from "./Layout.module.scss";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import MainNavigation from "../navigation/MainNavigation";
import MobileNavigation from "../navigation/MobileNavigation";
import { authActions } from "../../../store/auth";
import UserNavigation from "../navigation/UserNavigation";
import Button from "../../ui/buttons/Button";
import Modal from "../../ui/Modal";
import AuthForm from "../../forms/Auth/AuthForm";
import Spinner from "../../ui/Spinner";
import Prompt from "../../prompt/Prompt";
import SearchField from "../../search/SearchField";
import UploadingPanel from "../uploading-panel/UploadingPanel";
import ActiveCarousel from "../../general-elements/active-carousel/ActiveCarousel";
import { tabActions } from "../../../store/tabs";
import VerifyEmailMessage from "../../general-elements/verify-email-message/VerifyEmailMessage";
import Maintenance from "../maintenance/Maintenance";
import NsfwSwitch from "../../general-elements/nsfw-switch/NsfwSwitch";
import ScrollToTop from "../../ui/ScrollToTop";
import LayoutContentWrap from "./LayoutContentWrap";
import Notifications from "../notifications/Notifications";
import RightSidebar from "../right-sidebar/RightSidebar";
import logo from "../../../assets/logo-730.webp";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Main application layout container.
 *
 * Orchestrates the global UI structure including header, navigation, sidebars,
 * routed content, authentication modal, maintenance mode, notifications,
 * and footer. Tracks authentication and email verification state, controls
 * the auth form modal, and conditionally renders content based on maintenance
 * status.
 *
 * @component
 *
 * @returns The full application layout wrapper.
 */
const Layout = () => {
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const emailVerified = useAppSelector(
    (state) => state.auth.user.emailVerified,
  );
  const authIsOpen = useAppSelector((state) => state.auth.authFormIsOpen);
  const headerRef = useRef<HTMLDivElement>(null);
  const maintenance = useAppSelector((state) => state.notification.maintenance);
  const dispatch = useAppDispatch();

  // Opens the authentication modal
  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };

  // Closes the authentication modal
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
                  <Button onClick={openAuth} className={classes["btn-auth"]}>
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
          {!maintenance && <Prompt />}
          <AnimatePresence>
            <ActiveCarousel />
          </AnimatePresence>
        </Header>

        <LayoutContentWrap offsetHeight={headerRef.current?.offsetHeight}>
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
