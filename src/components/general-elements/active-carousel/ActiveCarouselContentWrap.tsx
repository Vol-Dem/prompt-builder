import { motion, useIsPresent } from "framer-motion";
import { useEffect, useRef, type ComponentProps } from "react";
import { useAppSelector } from "../../../store/hooks/hooks";

type ActiveCarouselContentWrapProps = Pick<
  ComponentProps<"div">,
  "className" | "children" | "aria-label"
> & { onClose: () => void };

/**
 * Active carousel animation container.
 *
 * Disables animation when header is fixed to prevents animation glitches.
 *
 * @component
 * @returns Active carousel animation container.
 */
const ActiveCarouselContentWrap = ({
  className,
  children,
  onClose,
  "aria-label": label,
}: ActiveCarouselContentWrapProps) => {
  const isFixed = useAppSelector((state) => state.general.headerIsFixed);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const doc = dialog.ownerDocument;
    const opener = doc.activeElement;
    dialog.focus({ preventScroll: true });

    return () => {
      // Navigation elsewhere in the page should keep its new focus.
      if (
        opener instanceof HTMLElement &&
        opener.isConnected &&
        (doc.activeElement === doc.body || dialog.contains(doc.activeElement))
      ) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    // A grid thumbnail is removed when it opens the details view.
    if (dialog && dialog.ownerDocument.activeElement === dialog.ownerDocument.body) {
      dialog.focus({ preventScroll: true });
    }
  }, [label]);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      aria-hidden={!isPresent || undefined}
      inert={!isPresent}
      onKeyDown={(event) => {
        if (
          isPresent &&
          event.key === "Escape" &&
          !event.defaultPrevented &&
          event.currentTarget.contains(event.target as Node)
        ) {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        exit: {
          opacity: 0,
          y: 30,
          transition: { duration: isFixed ? 0.2 : 0 }, // disable close animition when header is fixed
        },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ActiveCarouselContentWrap;
