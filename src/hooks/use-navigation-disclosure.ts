import { useCallback, useEffect, useId, useRef, useState } from "react";
import type {
  FocusEvent as ReactFocusEvent,
  MouseEvent,
  PointerEvent,
} from "react";

/** Native navigation disclosure with optional mouse hover and focus-aware dismissal. */
const useNavigationDisclosure = ({ openOnHover = false } = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openedByHover = useRef(false);

  const close = useCallback((restoreFocus = false) => {
    openedByHover.current = false;
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!isOpen || !container) return;
    const doc = container.ownerDocument;
    const isInside = (target: EventTarget | null) =>
      target instanceof Node && container.contains(target);
    const onOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!isInside(event.target)) close();
    };
    const onFocus = (event: FocusEvent) => {
      if (!isInside(event.target)) close();
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (!isInside(event.target) && !openedByHover.current) return;
      event.preventDefault();
      event.stopPropagation();
      close(isInside(doc.activeElement));
    };
    doc.addEventListener("pointerdown", onOutsidePointer, true);
    doc.addEventListener("focusin", onFocus);
    doc.addEventListener("keydown", onEscape);
    return () => {
      doc.removeEventListener("pointerdown", onOutsidePointer, true);
      doc.removeEventListener("focusin", onFocus);
      doc.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    close,
    containerProps: {
      ref: containerRef,
      onBlur: (event: ReactFocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      },
      onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
        if (!openOnHover || event.pointerType !== "mouse" || isOpen) return;
        openedByHover.current = true;
        setIsOpen(true);
      },
      onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
        if (!openOnHover || event.pointerType !== "mouse") return;
        if (
          !event.currentTarget.contains(
            event.currentTarget.ownerDocument.activeElement,
          )
        )
          close();
      },
    },
    triggerProps: {
      ref: triggerRef,
      type: "button" as const,
      "aria-expanded": isOpen,
      "aria-controls": panelId,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        // A mouse click after hovering should keep the newly opened menu open.
        if (openedByHover.current && event.detail > 0) {
          openedByHover.current = false;
          return;
        }
        openedByHover.current = false;
        setIsOpen((open) => !open);
      },
    },
    panelProps: {
      id: panelId,
      "aria-hidden": !isOpen || undefined,
      inert: !isOpen,
    },
  };
};

export default useNavigationDisclosure;
