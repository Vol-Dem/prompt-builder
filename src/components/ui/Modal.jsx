import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

import Card from "./Card";
import classes from "./Modal.module.scss";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../variables/constants";

/**
 * Portal-based modal with animated backdrop and content.
 *
 * Disables page scroll while open.
 *
 * @param {string} [disableClass] - Optional class for modal root.
 * @param {function} onClose - Called when backdrop or close button is clicked.
 * @param {string} [className] - Optional class for modal content.
 * @param {string} [title] - Optional modal title.
 * @param {React.ReactNode} children - Modal content.
 * @returns {JSX.Element} Rendered modal.
 */
const Modal = ({ disableClass, onClose, className, title, children }) => {
  useEffect(() => {
    const scrollTop = document.documentElement.scrollTop;
    const disableScrollHandler = () => {
      window.scrollTo(0, scrollTop);
    };
    window.addEventListener("scroll", disableScrollHandler);
    return () => {
      window.removeEventListener("scroll", disableScrollHandler);
    };
  }, []);

  return (
    <>
      {createPortal(
        <div className={`${classes["modal"]} ${disableClass || ""}`}>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${classes["modal__backdrop"]}`}
            onClick={onClose}
          ></motion.div>
          <motion.div
            layout
            variants={{
              hidden: ANIMATIONS_FM_SLIDEIN_INITIAL,
              visible: ANIMATIONS_FM_SLIDEIN,
              exit: ANIMATIONS_FM_SLIDEIN_INITIAL,
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${classes["modal__content"]} ${
              className ? className : ""
            }`}
          >
            <Card>
              {title && <h2 className={classes.title}>{title}</h2>}
              {children}
              <button className={classes["modal__close"]} onClick={onClose}>
                <XMarkIcon />
              </button>
            </Card>
          </motion.div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default Modal;
