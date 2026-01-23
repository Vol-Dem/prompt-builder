import { motion } from "framer-motion";

import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../../variables/constants";

/**
 * Motion wrapper with slide-in animation.
 *
 * Used for animated mounting/unmounting of panel content.
 *
 * @param {React.ReactNode} children - Wrapped content.
 * @param {object} props - Motion div props.
 * @returns {JSX.Element} Animated container.
 */
const AddToPanelAnimContainer = ({ children, ...props }) => {
  return (
    <motion.div
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
      style={{ position: "relative" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AddToPanelAnimContainer;
