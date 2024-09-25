import { useEffect } from "react";
import Card from "./Card";
import classes from "./Modal.module.scss";
import { createPortal } from "react-dom";
import CrossSvg from "../../assets/CrossSvg";

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
        <div className={`${props?.disableClass || ""}`}>
          <div
            className={`${classes.modal} ${classes["modal--backdrop"]}`}
            onClick={props.onClose}
          ></div>
          <Card
            className={`${classes.modal} ${classes["modal--content"]} ${
              props?.className ? props.className : ""
            }`}
          >
            {props.title && <h2 className={classes.title}>{props.title}</h2>}
            {props.children}
            <button className={classes["modal__close"]} onClick={props.onClose}>
              <CrossSvg />
            </button>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
};

export default Modal;
