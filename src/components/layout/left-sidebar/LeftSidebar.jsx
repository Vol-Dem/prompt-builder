import {
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  FunnelIcon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ButtonTertiary from "../../ui/ButtonTertiary";
import classes from "./LeftSidebar.module.scss";
import { motion } from "framer-motion";
import { useState } from "react";

const LeftSidebar = ({
  className,
  isOpen,
  onClose,
  onOpen,
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
    document.body.addEventListener("tou");
  };

  const closesSidebar = (url) => {
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

  const mouseUp = (e) => {
    if (!cursorInitialX || !cursorCurX) return;
    const offcet = Math.round(cursorInitialX) - Math.round(cursorCurX);
    setCursorCurX(null);
    setCursorInitialX(null);

    if (!!offcet && offcet > 0 && Math.abs(offcet) > 40) {
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
        // transition={{ type: "spring", bounce: 0.3 }}
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
