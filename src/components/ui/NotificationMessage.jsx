import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import classes from "./NotificationMessage.module.scss";
// import { ReactComponent as TriangleIcon } from "./../../assets/triangle.svg";

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
