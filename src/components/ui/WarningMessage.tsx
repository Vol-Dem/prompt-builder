import { motion } from "framer-motion";

import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../variables/constants";
import classes from "./WarningMessage.module.scss";
import type { ComponentProps } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type WarningMessageProps = ComponentProps<"div">;

const WarningMessage = ({ children, className }: WarningMessageProps) => {
  return (
    <motion.div
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      className={`${classes.warning} ${className || ""}`}
    >
      <ExclamationTriangleIcon />
      <div>{children}</div>
    </motion.div>
  );
};

export default WarningMessage;
