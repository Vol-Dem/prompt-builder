import { motion } from "framer-motion";

import classes from "./Fieldset.module.scss";

const Fieldset = ({ legend, className, children }) => {
  return (
    <motion.fieldset className={`${classes.fieldset} ${className || ""}`}>
      <legend className={classes.legend}>{legend}</legend>
      {children}
    </motion.fieldset>
  );
};

export default Fieldset;
