import { motion } from "framer-motion";
import {
  ANIMATIONS_FM_FADEIN,
  ANIMATIONS_FM_FADEIN_INITIAL,
} from "../../../variables/constants";
import classes from "./AboutContentWrap.module.scss";
import AboutNavBtnContainer from "./AboutNavBtnContainer";

const AboutContentWrap = ({ children }) => {
  return (
    <motion.div
      initial={ANIMATIONS_FM_FADEIN_INITIAL}
      animate={ANIMATIONS_FM_FADEIN}
      className={classes.wrap}
    >
      {children}
      <AboutNavBtnContainer />
    </motion.div>
  );
};

export default AboutContentWrap;
