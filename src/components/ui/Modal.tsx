import { type ComponentProps, type ReactNode } from "react";
import { DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

import Card from "./Card";
import DialogContainer from "./DialogContainer";
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
    role?: "dialog" | "alertdialog";
  }
>;

/**
 * Portal-based modal with animated backdrop and content.
 *
 * Keeps scroll containment in the modal without changing the page scroll container.
 *
 * @param props
 * @param props.disableClass - Optional class for modal root.
 * @param props.onClose - Requests dismissal through Escape, the backdrop, or the close button.
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
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  ...props
}: ModalProps) => {
  return (
    <DialogContainer
      {...props}
      onClose={onClose}
      aria-label={ariaLabel ?? (!title && !labelledBy ? "Dialog" : undefined)}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={`${classes["modal"]} ${disableClass || ""}`}
    >
      <DialogBackdrop
        as={motion.div}
        variants={ANIMATIONS_FM_FADE_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`${classes["modal__backdrop"]}`}
      />
      <DialogPanel
        as={motion.div}
        layout
        variants={ANIMATIONS_FM_SLIDEIN_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`${classes["modal__content"]} ${className ? className : ""}`}
      >
        <Card>
          {title && (
            <DialogTitle className={classes.title}>{title}</DialogTitle>
          )}
          {children}
          <button
            type="button"
            className={classes["modal__close"]}
            onClick={() => onClose()}
            title="Close"
            aria-label="Close"
          >
            <XMarkIcon />
          </button>
        </Card>
      </DialogPanel>
    </DialogContainer>
  );
};

export default Modal;
