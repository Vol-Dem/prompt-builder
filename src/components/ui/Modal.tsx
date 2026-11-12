import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { motion, useIsPresent } from "framer-motion";
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
    role?: "dialog" | "alertdialog";
  }
>;

type ModalRootProps = ComponentProps<"div"> & {
  dialogLabelledBy?: string;
  dialogDescription?: string;
};

// Headless UI supplies title/description IDs; explicit caller associations take precedence.
const ModalRoot = ({
  dialogLabelledBy,
  dialogDescription,
  ...props
}: ModalRootProps) => (
  <div
    {...props}
    aria-labelledby={
      dialogLabelledBy ??
      (props["aria-label"] ? undefined : props["aria-labelledby"])
    }
    aria-describedby={dialogDescription ?? props["aria-describedby"]}
  />
);

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
  const isPresent = useIsPresent();
  const [ready, setReady] = useState(false);

  // Register the page tree before Headless UI enables isolation and focus trapping.
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <Dialog
      {...props}
      as={ModalRoot}
      open={ready}
      onClose={() => {
        if (isPresent) onClose();
      }}
      aria-label={ariaLabel ?? (!title && !labelledBy ? "Dialog" : undefined)}
      dialogLabelledBy={labelledBy}
      dialogDescription={describedBy}
      aria-hidden={!isPresent || props["aria-hidden"]}
      inert={!isPresent || props.inert}
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
    </Dialog>
  );
};

export default Modal;
