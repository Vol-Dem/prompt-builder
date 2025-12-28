import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import classes from "./Notifications.module.scss";
import Notification from "../../ui/Notification";
import {
  saveToLocalStorage,
  saveToStorage,
  uploadLocalStorage,
  uploadStorage,
} from "../../../utils/generalUtils";

const Notifications = () => {
  const [cookificationIsOpen, setCookificationIsOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState({});
  const [allNotification, setAllNotification] = useState([]);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const notifications = useSelector(
    (state) => state.notification.notifications
  );

  useEffect(() => {
    if (!isAuth) {
      const cookies = uploadStorage(`cookies`);
      if (!cookies?.accepted) {
        setCookificationIsOpen(true);
      }
    } else {
      const noticeInfo = uploadLocalStorage(`notifications`);
      const updatedNotifications = notifications.map((message) => {
        const notice = noticeInfo?.messages?.find(
          (userNotice) => userNotice.id === message.id
        );
        return {
          ...message,
          readed: notice ? notice.readed : message.readed,
        };
      });
      const notification = updatedNotifications.find(
        (message) => !message.readed
      );
      setAllNotification(updatedNotifications);
      setActiveNotification(notification);
    }
  }, [notifications, isAuth]);

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

  return (
    <>
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
          This website uses cookies to ensure you get the best experience on our
          website. By using our site you consent cookies.{" "}
          <Link className={classes.link} to="/privacy">
            Privacy policy
          </Link>
        </Notification>
      )}
    </>
  );
};

export default Notifications;
