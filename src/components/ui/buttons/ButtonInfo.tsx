import { useState, type ComponentProps } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { AnimatePresence } from "framer-motion";

import Modal from "../Modal";
import classes from "./ButtonInfo.module.scss";

type ButtonInfoProps = ComponentProps<"span">;

const ButtonInfo = ({ children, className }: ButtonInfoProps) => {
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
