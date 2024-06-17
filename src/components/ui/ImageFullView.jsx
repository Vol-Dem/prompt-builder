import { useEffect } from "react";
import classes from "./ImageFullView.module.scss";
import { createPortal } from "react-dom";
import Card from "./Card";

const ImageFullView = (props) => {
  //   useEffect(() => {
  //     document.body.style.overflow = "hidden";
  //     console.log(props.src);
  //     return () => {
  //       document.body.style.overflow = null;
  //     };
  //   }, [props.src]);

  return (
    <>
      {createPortal(
        <div className={classes.test}>
          <div
            className={`${classes.modal} ${classes["modal--backdrop"]}`}
            onClick={props.onClose}
          ></div>
          <div className={`${classes.modal} ${classes["modal--content"]}`}>
            {props.title && <h2 className={classes.title}>{props.title}</h2>}
            <img src={props?.src} alt="" className={classes.img} />
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
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ImageFullView;
