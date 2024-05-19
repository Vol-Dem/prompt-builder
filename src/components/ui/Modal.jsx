import { useEffect } from "react";
import Card from "./Card";
import classes from "./Modal.module.scss";
import { createPortal } from "react-dom";

const Modal = (props) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = null;
    };
  }, []);

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
              {/* <span className={classes["modal__cross"]}></span> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
};

export default Modal;
