import { useEffect } from "react";
import Card from "./Card";
import classes from "./Modal.module.scss";
import { createPortal } from "react-dom";
import CrossSvg from "../../assets/CrossSvg";
import { motion } from "framer-motion";

const Modal = (props) => {
  useEffect(() => {
    const scrollTop = document.documentElement.scrollTop;
    const disableScrollHandler = (e) => {
      window.scrollTo(0, scrollTop);
    };
    window.addEventListener("scroll", disableScrollHandler);
    // document.body.style.overflow = "hidden";
    // document.body.style.marginRight = "8px";
    return () => {
      window.removeEventListener("scroll", disableScrollHandler);
      // document.body.style.overflow = null;
      // document.body.style.marginRight = "0";
    };
  }, []);

  return (
    <>
      {createPortal(
        <div className={`${classes["modal"]} ${props?.disableClass || ""}`}>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${classes["modal__backdrop"]}`}
            onClick={props.onClose}
          ></motion.div>
          <motion.div
            layout
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 30 },
              // hidden: { opacity: 0, y: "-30%", x: "-50%" },
              // visible: { opacity: 1, y: "-50%", x: "-50%" },
              // exit: { opacity: 0, y: "-30%", x: "-50%" },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${classes["modal__content"]} ${
              props?.className ? props.className : ""
            }`}
          >
            <Card>
              {props.title && <h2 className={classes.title}>{props.title}</h2>}
              {props.children}
              <button
                className={classes["modal__close"]}
                onClick={props.onClose}
              >
                <CrossSvg />
              </button>
            </Card>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Modal;
