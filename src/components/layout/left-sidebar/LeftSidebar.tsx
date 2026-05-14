import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import {
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from "react";

import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import classes from "./LeftSidebar.module.scss";

type LeftSidebar = ComponentProps<"div"> & {
  isOpen: boolean;
  onClose: (url?: string) => void;
  onOpen: () => void;
  btnContent?: ReactNode;
};

/**
 * Application left sidebar with touch swipe support.
 *
 * Displays a slide-in sidebar panel that can be opened and closed via a toggle
 * button or by swiping on touch devices. Renders an overlay when open and
 * animates its visibility using Framer Motion.
 *
 * @component
 *
 * @param props
 * @param props.isOpen - Whether the sidebar is currently open.
 * @param props.onClose - Callback to close the sidebar.
 * @param props.onOpen - Callback to open the sidebar.
 * @param props.className - Optional CSS class for custom styling.
 * @param props.btnContent - Optional custom content for the open button.
 * @param props.children - Sidebar content.
 *
 * @returns The animated left sidebar container.
 */
const LeftSidebar = ({
  isOpen,
  onClose,
  onOpen,
  className,
  btnContent = <Bars3Icon />,
  children,
}: LeftSidebar) => {
  const [cursorInitialX, setCursorInitialX] = useState<number | null>(null);
  const [cursorCurX, setCursorCurX] = useState<number | null>(null);

  const sidebarStateHandler = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  const closesSidebar = () => {
    onClose();
  };

  const moveElement = (e: MouseEvent | TouchEvent) => {
    let clientX: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    setCursorCurX(Math.round(clientX));
  };

  const mouseDownHandler = (e: MouseEvent | TouchEvent) => {
    let clientX: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    setCursorInitialX(Math.round(clientX));
  };

  // Close sidebar when user swipes left by more than 40px
  const mouseUp = () => {
    if (!cursorInitialX || !cursorCurX) return;
    const offset = Math.round(cursorInitialX) - Math.round(cursorCurX);
    setCursorCurX(null);
    setCursorInitialX(null);

    if (!!offset && offset > 0 && Math.abs(offset) > 40) {
      onClose();
    }
  };

  return (
    <div>
      <ButtonTertiary
        title={`${!isOpen ? "Open" : "Close"} sidebar`}
        className={classes["nav-btn"]}
        onClick={sidebarStateHandler}
      >
        {!isOpen && btnContent}
        {isOpen && <XMarkIcon />}
      </ButtonTertiary>
      {isOpen && (
        <div className={classes.overlay} onClick={closesSidebar}></div>
      )}
      <motion.aside
        initial={{ left: "-100%" }}
        animate={{ left: isOpen ? 0 : "-100%" }}
        className={`${classes["sidebar"]} ${className || ""}`}
        onTouchEnd={mouseUp}
        onTouchStart={mouseDownHandler}
        onTouchMove={moveElement}
      >
        {children}
      </motion.aside>
    </div>
  );
};

export default LeftSidebar;
