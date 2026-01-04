import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useState } from "react";

import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import classes from "./LeftSidebar.module.scss";

/**
 * Application left sidebar with touch swipe support.
 *
 * Displays a slide-in sidebar panel that can be opened and closed via a toggle
 * button or by swiping on touch devices. Renders an overlay when open and
 * animates its visibility using Framer Motion.
 *
 * @component
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the sidebar is currently open.
 * @param {() => void} props.onClose - Callback to close the sidebar.
 * @param {() => void} props.onOpen - Callback to open the sidebar.
 * @param {string} [props.className] - Optional CSS class for custom styling.
 * @param {React.ReactNode} [props.btnContent] - Optional custom content for the open button.
 * @param {React.ReactNode} props.children - Sidebar content.
 *
 * @returns {JSX.Element} The animated left sidebar container.
 */
const LeftSidebar = ({
  isOpen,
  onClose,
  onOpen,
  className,
  btnContent = <Bars3Icon />,
  children,
}) => {
  const [cursorInitialX, setCursorInitialX] = useState(null);
  const [cursorCurX, setCursorCurX] = useState(null);

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

  const moveElement = (e) => {
    const clientX = Math.round(e.clientX || e.touches[0].clientX);
    setCursorCurX(clientX);
  };

  const mouseDownHandler = (e) => {
    const clientX = Math.round(e.clientX || e.touches[0].clientX);
    setCursorInitialX(clientX);
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
