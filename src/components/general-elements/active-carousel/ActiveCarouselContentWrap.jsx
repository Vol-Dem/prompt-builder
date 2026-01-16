import { motion } from "framer-motion";
import { useSelector } from "react-redux";

/**
 * Active carousel animation container.
 *
 * Disables animation when header is fixed to prevents animation glitches.
 *
 * @component
 * @returns {JSX.Element} Active carousel animation container.
 */
const ActiveCarouselContentWrap = ({ className, children }) => {
  const isFixed = useSelector((state) => state.general.headerIsFixed);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        exit: {
          opacity: 0,
          y: 30,
          transition: { duration: isFixed ? 0.2 : 0 }, // disable close animition when header is fixed
        },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ActiveCarouselContentWrap;
