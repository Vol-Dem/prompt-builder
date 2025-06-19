import { useEffect } from "react";
import Card from "./Card";
import classes from "./Modal.module.scss";
import { createPortal } from "react-dom";
import CrossSvg from "../../assets/CrossSvg";
import { motion } from "framer-motion";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../variables/constants";

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
              hidden: ANIMATIONS_FM_SLIDEIN_INITIAL,
              visible: ANIMATIONS_FM_SLIDEIN,
              exit: ANIMATIONS_FM_SLIDEIN_INITIAL,
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
