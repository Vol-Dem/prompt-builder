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
import { Suspense, useEffect, useRef, useState } from "react";
import Spinner from "../../ui/Spinner";
import Notification from "../../ui/Notification";
import Prompt from "../../prompt/Prompt";
import UsedModelsPanel from "../../used-models-panel/UsedModelsPanel";
import { modelActions } from "../../../store/model";
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
import { usedModelsActions } from "../../../store/usedModels";
import { useMemo } from "react";
import NsfwSwitch from "../../ui/nsfw-switch/NsfwSwitch";
import ScrollToTop from "../../ui/ScrollToTop";

const Layout = () => {
  const [cookificationIsOpen, setCookificationIsOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState({});
  const [allNotification, setAllNotification] = useState([]);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const promptBtnHeight = useSelector((state) => state.prompt.promptBtnHeight);
  const promptHeight = useSelector((state) => state.prompt.promptHeight);
  const emailVerified = useSelector((state) => state.auth.user.emailVerified);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  const headerIsFixed = useSelector((state) => state.general.headerIsFixed);
  const mainRef = useRef(null);
  const headerRef = useRef(null);
  const notifications = useSelector(
    (state) => state.notification.notifications
  );
  const maintenance = useSelector((state) => state.notification.maintenance);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location?.pathname) {
      dispatch(usedModelsActions.setFormIsOpen(false));
      dispatch(modelActions.resetModelData());
    }
  }, [location?.pathname, dispatch]);

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

  useEffect(() => {
    if (!isAuth) {
      const cookies = uploadStorage(`cookies`);
      if (!cookies?.accepted) {
        setCookificationIsOpen(true);
      }
    }
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) {
      const noticeInfo = uploadLocalStorage(`notifications`);
      const updatedNitice = notifications.map((message) => {
        const notice = noticeInfo?.messages?.find(
          (userNotice) => userNotice.id === message.id
        );
        return {
          ...message,
          readed: notice ? notice.readed : message.readed,
        };
      });

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

  const paddingMain = useMemo(() => {
    if (
      headerIsFixed &&
      headerRef?.current?.offsetHeight &&
      promptHeight &&
      promptIsOpen
    ) {
      return headerRef.current.offsetHeight + promptHeight + promptBtnHeight;
    } else if (
      headerIsFixed &&
      headerRef?.current?.offsetHeight &&
      promptHeight &&
      !promptIsOpen
    ) {
      return headerRef.current.offsetHeight + promptBtnHeight;
    } else {
      return null;
    }
  }, [headerIsFixed, headerRef, promptHeight, promptIsOpen, promptBtnHeight]);

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
                    <img
                      src={require("../../../assets/logo5.png")}
                      alt="Logo"
                      width={1088}
                      height={188}
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

        <main ref={mainRef} style={{ paddingTop: paddingMain }}>
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
        </AnimatePresence>
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
          <Notification type="notification" onClick={closeCookificationHandler}>
            This website uses cookies to ensure you get the best experience on
            our website. By using our site you consent cookies.{" "}
            <Link className={classes.link} to="/privacy">
              Privacy policy
            </Link>
          </Notification>
        )}

        <Footer />
      </div>
      {!maintenance && <UsedModelsPanel />}
      <ScrollToTop />
    </div>
  );
};

export default Layout;
