import classes from "./Fieldset.module.scss";
import { motion } from "framer-motion";

const Fieldset = (props) => {
  const { legend, className } = props;
  return (
    <motion.fieldset className={`${classes.fieldset} ${className || ""}`}>
      <legend className={classes.legend}>{legend}</legend>
      {props.children}
    </motion.fieldset>
  );
};

export default Fieldset;
