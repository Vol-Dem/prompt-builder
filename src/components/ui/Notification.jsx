import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import Buttton from "./Button";
import Card from "./Card";
import classes from "./Notification.module.scss";
// import { ReactComponent as TriangleIcon } from "./../../assets/triangle.svg";
// import ExclamationCircleSvg from "../../assets/ExclamationCircleSvg";

const Notification = ({ type = "notification", title, onClick, children }) => {
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
            <Buttton className={classes["notification__btn"]} onClick={onClick}>
              Got it!
            </Buttton>
          </Card>
        </motion.div>,
        document.body
      )}
    </>
  );
};

export default Notification;
