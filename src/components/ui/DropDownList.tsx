import { motion, type HTMLMotionProps } from "framer-motion";

import {
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
} from "../../variables/constants";
import classes from "./DropDownList.module.scss";
import type { ComponentProps } from "react";

type DropDownListProps = ComponentProps<"div"> &
  HTMLMotionProps<"div"> & {
    onClose: () => void;
    title?: string;
  };

/**
 * Animated dropdown container with header and close button.
 *
 * @param {React.ReactNode} children - Dropdown content.
 * @param {string} [className] - Optional custom class.
 * @param {function} onClose - Called when dropdown is closed.
 * @param {string} title - Dropdown title.
 * @returns {JSX.Element} Rendered dropdown list.
 */
const DropDownList = ({
  children,
  className,
  onClose,
  title,
}: DropDownListProps) => {
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
            title="Close"
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
