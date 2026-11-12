import { useEffect, useState, type ComponentProps } from "react";
import { Dialog } from "@headlessui/react";
import { useIsPresent } from "framer-motion";

import classes from "./DialogContainer.module.scss";
import type { OverrideFields } from "../../../shared/types/general";

type DialogContainerProps = OverrideFields<
  ComponentProps<"div">,
  {
    onClose: () => void;
    role?: "dialog" | "alertdialog";
  }
>;

type DialogRootProps = ComponentProps<"div"> & {
  dialogLabelledBy?: string;
  dialogDescription?: string;
};

// Headless UI supplies title/description IDs; explicit caller associations take precedence.
const DialogRoot = ({
  dialogLabelledBy,
  dialogDescription,
  ...props
}: DialogRootProps) => (
  <div
    {...props}
    aria-labelledby={
      dialogLabelledBy ??
      (props["aria-label"] ? undefined : props["aria-labelledby"])
    }
    aria-describedby={dialogDescription ?? props["aria-describedby"]}
  />
);

/** Shared modal focus, naming and dismissal lifecycle, independent of presentation. */
const DialogContainer = ({
  onClose,
  className,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  ...props
}: DialogContainerProps) => {
  const isPresent = useIsPresent();
  const [ready, setReady] = useState(false);

  // Register the page tree before Headless UI enables isolation and focus trapping.
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <Dialog
      {...props}
      as={DialogRoot}
      open={ready}
      onClose={() => {
        if (isPresent) onClose();
      }}
      dialogLabelledBy={labelledBy}
      dialogDescription={describedBy}
      aria-hidden={!isPresent || props["aria-hidden"]}
      inert={!isPresent || props.inert}
      className={`${classes.dialog} ${className || ""}`}
    />
  );
};

export default DialogContainer;
