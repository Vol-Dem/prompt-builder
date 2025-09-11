import Buttton from "./Button";
import Card from "./Card";
import classes from "./Notification.module.scss";
import { ReactComponent as TriangleIcon } from "./../../assets/triangle.svg";
import { createPortal } from "react-dom";
import ExclamationCircleSvg from "../../assets/ExclamationCircleSvg";
import { motion } from "framer-motion";

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
              {type === "notification" && <ExclamationCircleSvg />}
              {type === "warning" && <TriangleIcon />}
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
