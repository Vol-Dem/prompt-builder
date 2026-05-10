import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import Button from "./buttons/Button";
import Card from "./Card";
import classes from "./Notification.module.scss";
import type { ComponentProps } from "react";
import type { NotificationType } from "../../types/notification.types";

type NotificationProps = ComponentProps<"div"> & {
  type: NotificationType;
  title?: string;
  onClick: () => void;
};

/**
 * Floating notification popup rendered via portal.
 *
 * @param props
 * @param props.type - Notification type.
 * @param props.title - Optional title.
 * @param props.onClick - Called when user confirms.
 * @param props.children - Notification message.
 * @returns Rendered notification.
 */
const Notification = ({
  type = "notification",
  title,
  onClick,
  children,
}: NotificationProps) => {
  return (
    <>
      {createPortal(
        <motion.div
          initial={{ opacity: 0, y: 30, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 30, x: "-50%" }}
          className={classes["notification-container"]}
        >
          <Card className={classes.notification}>
            <div className={classes["notification__icon"]}>
              {type === "notification" && <ExclamationCircleIcon />}
              {type === "warning" && <ExclamationTriangleIcon />}
            </div>

            <div className={classes["notification__message"]}>
              {title && (
                <h4 className={classes["notification__title"]}>{title}</h4>
              )}
              <p className={classes["notification__text"]}>{children}</p>
            </div>
            <Button className={classes["notification__btn"]} onClick={onClick}>
              Got it!
            </Button>
          </Card>
        </motion.div>,
        document.body,
      )}
    </>
  );
};

export default Notification;
