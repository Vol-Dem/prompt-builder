import classes from "./Layout.module.scss";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
import { Suspense, useEffect, useState } from "react";
import Spinner from "../../ui/Spinner";
import Notification from "../../ui/Notification";
import Prompt from "../../prompt/Prompt";
import UsedModelsPanel from "../../used-models-panel/UsedModelsPanel";
import { switchNsfwMode } from "../../../store/model";
import Search from "../../search/Search";
import UploadingPanel from "../../uploading-panel/UploadingPanel";
import ActiveCarousel from "../../active-carousel/ActiveCarousel";
import SearchSvg from "../../../assets/SearchSvg";
import { tabActions } from "../../../store/tabs";
import VerifyEmailMessage from "../../notification-messages/VerifyEmailMessage";
import {
  saveToLocalStorage,
  saveToStorage,
  uploadLocalStorage,
  uploadStorage,
} from "../../../variables/utils";
import Maintenance from "../maintenance/Maintenance";
import { AnimatePresence } from "framer-motion";

const Layout = () => {
  const [cookificationIsOpen, setCookificationIsOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState({});
  const [allNotification, setAllNotification] = useState([]);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const emailVerified = useSelector((state) => state.auth.user.emailVerified);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  // const notificationIsShown = useSelector(
  //   (state) => state.notification.isShown
  // );
  const notifications = useSelector(
    (state) => state.notification.notifications
  );
  const maintenance = useSelector((state) => state.notification.maintenance);
  // const notificationType = useSelector((state) => state.notification.type);
  // const notificationTitle = useSelector((state) => state.notification.title);
  // const notificationMessage = useSelector(
  //   (state) => state.notification.message
  // );
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };
  const closeAuth = () => {
    dispatch(authActions.closeAuthForm());
  };

  const openMobileSearch = () => {
    if (location.pathname !== "/search") {
      navigate("search");
    }
  };

  const nsfwSwitchHandler = () => {
    dispatch(switchNsfwMode(!isNsfwMode));
  };

  useEffect(() => {
    if (!isAuth) {
      const cookies = uploadStorage(`cookies`);
      // console.log(cookies);
      if (!cookies?.accepted) {
        setCookificationIsOpen(true);
      }
    }
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) {
      const noticeInfo = uploadLocalStorage(`notifications`);
      // console.log(noticeInfo);

      const updatedNitice = notifications.map((message) => {
        const notice = noticeInfo?.messages?.find(
          (userNotice) => userNotice.id === message.id
        );
        return {
          ...message,
          readed: notice ? notice.readed : message.readed,
        };
      });
      // console.log(updatedNitice);
      setAllNotification(updatedNitice);
    }
  }, [notifications, isAuth]);

  useEffect(() => {
    if (isAuth) {
      const notification = allNotification.find((message) => !message.readed);
      setActiveNotification(notification);
    }
  }, [notifications, allNotification, isAuth]);

  const closeNotificationHandler = () => {
    const noticeInfo = allNotification.map((message) => {
      return {
        // id: message.id,
        ...message,
        readed: activeNotification.id === message.id ? true : message.readed,
      };
    });
    saveToLocalStorage(`notifications`, { messages: noticeInfo });
    setAllNotification(noticeInfo);
    setActiveNotification({});
  };

  const closeCookificationHandler = () => {
    saveToStorage(`cookies`, { accepted: true });
    setCookificationIsOpen(false);
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.content}>
        <Header>
          <div className={classes["menu-container"]}>
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
                    <img
                      src={require("../../../assets/logo5.png")}
                      alt="Logo"
                    />
                  </NavLink>
                </div>
                {!maintenance && <MainNavigation />}
                {isAuth && !maintenance && (
                  <>
                    <Search
                      className={`${
                        location.pathname === "/search"
                          ? ""
                          : classes["search-hidden"]
                      }`}
                    />
                    <span
                      className={classes["btn-search"]}
                      onClick={openMobileSearch}
                    >
                      <SearchSvg />
                    </span>
                    <UploadingPanel />

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
          {!maintenance && (
            <div className={classes.wrap}>
              <Prompt />
            </div>
          )}
          <ActiveCarousel />
        </Header>

        <main>
          <div className="wrapper">
            {!maintenance && (
              <Suspense fallback={<Spinner />}>
                <Outlet />
              </Suspense>
            )}
            {maintenance && <Maintenance />}
          </div>
        </main>
        <AnimatePresence>
          {authIsOpen && (
            <Modal onClose={closeAuth}>
              {!isAuth && <AuthForm />}
              {isAuth && !emailVerified && <VerifyEmailMessage />}
            </Modal>
          )}
          {activeNotification?.id && isAuth && (
            <Notification
              type={activeNotification.type}
              title={activeNotification.title}
              onClick={closeNotificationHandler}
            >
              {activeNotification.text}
            </Notification>
          )}
          {cookificationIsOpen && !isAuth && (
            <Notification
              type="notification"
              onClick={closeCookificationHandler}
            >
              This website uses cookies to ensure you get the best experience on
              our website. By using our site you consent cookies.{" "}
              <Link className={classes.link} to="/privacy">
                Learn more
              </Link>
            </Notification>
          )}
        </AnimatePresence>
        <Footer />
      </div>
      {!maintenance && <UsedModelsPanel />}
    </div>
  );
};

export default Layout;
