import { useState, type ComponentProps } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { AnimatePresence } from "framer-motion";

import Modal from "../Modal";
import classes from "./ButtonInfo.module.scss";

type ButtonInfoProps = ComponentProps<"button">;

const ButtonInfo = ({ children, className }: ButtonInfoProps) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="More information"
        className={`${classes.btn} ${className || ""}`}
        onClick={() => {
          setShowInfo((prevState) => !prevState);
        }}
      >
        <QuestionMarkCircleIcon />
      </button>

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
