import classes from "./ButtonInfo.module.scss";
import { useState } from "react";
import Modal from "../Modal";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { AnimatePresence } from "framer-motion";

const ButtonInfo = ({ children, className }) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <>
      <span
        className={`${classes.btn} ${className || ""}`}
        onClick={() => {
          setShowInfo((prevState) => !prevState);
        }}
      >
        <QuestionMarkCircleIcon />
      </span>

      <AnimatePresence>
        {showInfo && (
          <Modal
            onClose={() => {
              setShowInfo(false);
            }}
          >
            {children}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default ButtonInfo;
