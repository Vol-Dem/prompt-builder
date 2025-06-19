import classes from "./NotificationMessage.module.scss";
import { ReactComponent as TriangleIcon } from "./../../assets/triangle.svg";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

const NotificationMessage = ({ children, type, className }) => {
  return (
    <div className={`${classes.notification}  ${className || ""}`}>
      {type && (
        <div className={classes["notification__icon"]}>
          {type === "notification" && <ExclamationCircleIcon />}
          {type === "warning" && <TriangleIcon />}
        </div>
      )}
      <div className={classes["notification__message"]}>{children}</div>
    </div>
  );
};

export default NotificationMessage;
