import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const ActiveCarouselContentWrap = ({ className, children }) => {
  const isFixed = useSelector((state) => state.general.headerIsFixed);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 30 },
      }}
      initial="hidden"
      animate="visible"
      exit={isFixed ? "exit" : ""}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ActiveCarouselContentWrap;
