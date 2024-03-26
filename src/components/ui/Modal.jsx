import Card from "./Card";
import classes from "./Modal.module.scss";
import { createPortal } from "react-dom";

const Modal = (props) => {
  return (
    <>
      {createPortal(
        <div className={classes.test}>
          <div
            className={`${classes.modal} ${classes["modal--backdrop"]}`}
            onClick={props.onClose}
          ></div>
          <Card className={`${classes.modal} ${classes["modal--content"]}`}>
            {props.title && <h2 className={classes.title}>{props.title}</h2>}
            {props.children}
            <div className={classes["modal__close"]} onClick={props.onClose}>
              <span className={classes["modal__cross"]}></span>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
};

export default Modal;
