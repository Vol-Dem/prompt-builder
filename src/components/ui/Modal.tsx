import { useEffect, type ComponentProps, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

import Card from "./Card";
import classes from "./Modal.module.scss";
import {
  ANIMATIONS_FM_FADE_VARIANTS,
  ANIMATIONS_FM_SLIDEIN_VARIANTS,
} from "../../variables/constants";
import type { OverrideFields } from "../../../shared/types/general";

type ModalProps = OverrideFields<
  ComponentProps<"div">,
  {
    disableClass?: string;
    title?: ReactNode;
    onClose: () => void;
  }
>;

/**
 * Portal-based modal with animated backdrop and content.
 *
 * Disables page scroll while open.
 *
 * @param props
 * @param props.disableClass - Optional class for modal root.
 * @param props.onClose - Called when backdrop or close button is clicked.
 * @param props.className - Optional class for modal content.
 * @param props.title - Optional modal title.
 * @param props.children - Modal content.
 * @returns Rendered modal.
 */
const Modal = ({
  disableClass,
  onClose,
  className,
  title,
  children,
}: ModalProps) => {
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
            variants={ANIMATIONS_FM_FADE_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${classes["modal__backdrop"]}`}
            onClick={onClose}
          ></motion.div>
          <motion.div
            layout
            variants={ANIMATIONS_FM_SLIDEIN_VARIANTS}
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
              <button
                className={classes["modal__close"]}
                onClick={onClose}
                title="Close"
              >
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
