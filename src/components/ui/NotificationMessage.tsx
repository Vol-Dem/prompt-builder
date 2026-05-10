import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import classes from "./NotificationMessage.module.scss";
import type { ComponentProps } from "react";

type NotificationMessageProps = ComponentProps<"div"> & {
  type?: "notification" | "warning";
};

/**
 * Inline notification message block.
 * @param props
 * @param props.children - Message content.
 * @param props.type - Icon style.
 * @param props.className - Optional custom class.
 * @returns Rendered notification message.
 */
const NotificationMessage = ({
  children,
  type,
  className,
}: NotificationMessageProps) => {
  return (
    <div className={`${classes.notification}  ${className || ""}`}>
      {type && (
        <div
          className={`${classes["notification__icon"]} ${
            classes[`notification__icon--${type}`]
          }`}
        >
          {type === "notification" && <ExclamationCircleIcon />}
          {type === "warning" && <ExclamationTriangleIcon />}
        </div>
      )}
      <div className={classes["notification__message"]}>{children}</div>
    </div>
  );
};

export default NotificationMessage;
