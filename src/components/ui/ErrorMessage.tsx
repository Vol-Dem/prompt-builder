import { motion } from "framer-motion";

import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../variables/constants";
import classes from "./ErrorMessage.module.scss";
import type { ComponentProps } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type ErrorMessageProps = ComponentProps<"div">;

const ErrorMessage = ({ className, children }: ErrorMessageProps) => {
  return (
    <motion.div
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      data-testid="error-message"
      className={`${classes.error} ${className || ""}`}
    >
      <ExclamationTriangleIcon />
      {children}
    </motion.div>
  );
};

export default ErrorMessage;
