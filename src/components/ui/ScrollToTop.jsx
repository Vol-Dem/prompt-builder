import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";

import classes from "./ScrollToTop.module.scss";
import useScrollTop from "../../hooks/use-scroll-top";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_SCROLL_TOP,
} from "../../variables/constants";

const ScrollToTop = () => {
  const scrollToTop = useScrollTop();

  const scrollToTopHandler = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {scrollToTop > SETTINGS_SCROLL_TOP && (
        <motion.div
          initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          animate={ANIMATIONS_FM_SLIDEIN}
          whileHover={{ scale: 1.1 }}
          exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
          className={classes.button}
          onClick={scrollToTopHandler}
        >
          <ArrowUpIcon />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
