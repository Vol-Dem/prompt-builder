import { motion, type HTMLMotionProps } from "framer-motion";

import classes from "./Fieldset.module.scss";
import type { ComponentProps } from "react";

type FieldsetProps = HTMLMotionProps<"fieldset"> &
  ComponentProps<"fieldset"> & { legend: string };

/**
 * Presentational wrapper for fieldset.
 * Displays fieldset content with legend.
 *
 * @param {string} legend - Field legend.
 * @param {React.ReactNode} children - Field content.
 * @param {string} [className] - Optional custom class.
 *
 * @returns {JSX.Element} Fieldset.
 */
const Fieldset = ({ legend, className, children }: FieldsetProps) => {
  return (
    <motion.fieldset className={`${classes.fieldset} ${className || ""}`}>
      <legend className={classes.legend}>{legend}</legend>
      {children}
    </motion.fieldset>
  );
};

export default Fieldset;
