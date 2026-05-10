import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import classes from "./Notifications.module.scss";
import Notification from "../../ui/Notification";
import {
  saveToLocalStorage,
  saveToStorage,
  uploadLocalStorage,
  uploadStorage,
} from "../../../utils/generalUtils";
import { useAppSelector } from "../../../store/hooks/hooks";
import type { NotificationData } from "../../../types/notification.types";

type CookiesType = { accepted: boolean };

type NotificationMessages = { messages: NotificationData[] };

/**
 * Application notifications.
 *
 * Displays an app notification or cookie notification depending on the authentication state.
 * Handles loading and saving notification acceptance state from storage.
 *
 * @component
 *
 * @returns The application notifications.
 */
const Notifications = () => {
  const [cookificationIsOpen, setCookificationIsOpen] = useState(false);
  const [activeNotification, setActiveNotification] =
    useState<NotificationData | null>(null);
  const [allNotification, setAllNotification] = useState<NotificationData[]>(
    [],
  );
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const notifications = useAppSelector(
    (state) => state.notification.notifications,
  );

  useEffect(() => {
    if (!isAuth) {
      const cookies = uploadStorage<CookiesType>(`cookies`);
      if (!cookies?.accepted) {
        setCookificationIsOpen(true);
      }
    } else {
      const notificationAcceptanceState =
        uploadLocalStorage<NotificationMessages>(`notifications`);
      const updatedNotifications = notifications.map((message) => {
        const notice = notificationAcceptanceState?.messages?.find(
          (userNotice) => userNotice.id === message.id,
        );
        return {
          ...message,
          read: notice ? notice.read : message.read,
        };
      });
      const notification = updatedNotifications.find(
        (message) => !message.read,
      );
      setAllNotification(updatedNotifications);
      setActiveNotification(notification || null);
    }
  }, [notifications, isAuth]);

  const closeNotificationHandler = () => {
    const noticeInfo = allNotification.map((message) => {
      return {
        ...message,
        read: activeNotification?.id === message.id ? true : message.read,
      };
    });
    saveToLocalStorage(`notifications`, { messages: noticeInfo });
    setAllNotification(noticeInfo);
    setActiveNotification(null);
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
