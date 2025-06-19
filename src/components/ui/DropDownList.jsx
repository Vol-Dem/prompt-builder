import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
} from "../../variables/constants";
import classes from "./DropDownList.module.scss";
import { motion } from "framer-motion";

const DropDownList = ({ children, className, onClose, title }) => {
  return (
    <div className={`${classes["dropdown"]} ${className || ""}`}>
      <motion.div
        initial={ANIMATIONS_FM_ZOOM_IN_INITIAL}
        animate={ANIMATIONS_FM_ZOOM_IN}
        exit={ANIMATIONS_FM_ZOOM_IN_INITIAL}
        className={classes["dropdown__container"]}
      >
        <div className={classes["dropdown__settings"]}>
          <span className={classes["dropdown__title"]}>{title}</span>
          <button
            className={classes["btn-close"]}
            onClick={() => {
              onClose();
            }}
          >
            <span className={classes["btn-close__cross"]}></span>
          </button>
        </div>
        <div className={classes["dropdown__content"]}>{children}</div>
      </motion.div>
    </div>
  );
};

export default DropDownList;
