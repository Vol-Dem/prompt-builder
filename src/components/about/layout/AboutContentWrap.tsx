import { motion } from "framer-motion";

import {
  ANIMATIONS_FM_FADEIN,
  ANIMATIONS_FM_FADEIN_INITIAL,
} from "../../../variables/constants";
import classes from "./AboutContentWrap.module.scss";
import AboutNavBtnContainer from "./AboutNavBtnContainer";
import type { ComponentProps } from "react";

type AboutContentWrapProps = ComponentProps<"div">;

/**
 * Content wrapper for the About section.
 *
 * Renders the content of the About section and buttons for navigating between sections
 *
 * @component
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Nested About section content.
 * @returns {JSX.Element} The About section content with navigation buttons.
 */
const AboutContentWrap = ({ children }: AboutContentWrapProps) => {
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
