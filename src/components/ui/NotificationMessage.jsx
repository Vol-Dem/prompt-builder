import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import classes from "./NotificationMessage.module.scss";
// import { ReactComponent as TriangleIcon } from "./../../assets/triangle.svg";

/**
 * Inline notification message block.
 *
 * @param {React.ReactNode} children - Message content.
 * @param {"notification"|"warning"} [type] - Icon style.
 * @param {string} [className] - Optional custom class.
 * @returns {JSX.Element} Rendered notification message.
 */
const NotificationMessage = ({ children, type, className }) => {
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
