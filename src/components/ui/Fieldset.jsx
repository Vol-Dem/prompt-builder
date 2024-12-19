import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../variables/constants";
import classes from "./Fieldset.module.scss";
import { motion } from "framer-motion";

const Fieldset = (props) => {
  const { legend, className } = props;
  return (
    <motion.fieldset
      // variants={{
      //   hidden: ANIMATIONS_FM_SLIDEIN_INITIAL,
      //   visible: ANIMATIONS_FM_SLIDEIN,
      // }}
      // initial="hidden"
      // animate="visible"
      className={`${classes.fieldset} ${className || ""}`}
    >
      <legend className={classes.legend}>{legend}</legend>
      {props.children}
    </motion.fieldset>
  );
};

export default Fieldset;
