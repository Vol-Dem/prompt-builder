import { motion } from "framer-motion";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../variables/constants";

const AddToPanelAnimContainer = (props) => {
  return (
    <motion.div
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
      style={{ position: "relative" }}
    >
      {props.children}
    </motion.div>
  );
};

export default AddToPanelAnimContainer;
