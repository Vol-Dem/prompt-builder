import classes from "./Guide.module.scss";
// import { useEffect } from "react";
import { createPortal } from "react-dom";
import LinkA from "../LinkA";
import ArrowRightSvg from "../../../assets/ArrowRight";
import ArrowUp from "../../../assets/ArrowUp";

const Guide = (props) => {
  // useEffect(() => {
  //   const scrollTop = document.documentElement.scrollTop;
  //   const disableScrollHandler = (e) => {
  //     window.scrollTo(0, scrollTop);
  //   };
  //   window.addEventListener("scroll", disableScrollHandler);
  //   return () => {
  //     window.removeEventListener("scroll", disableScrollHandler);
  //   };
  // }, []);

  return (
    <>
      {createPortal(
        <div className={`${props?.className ? props?.className : ""}`}>
          <div
            className={`${classes.guide} ${classes["guide__backdrop-left"]} ${
              classes[`guide__backdrop-left--${props.stage}`]
            }`}
          ></div>
          <div
            className={`${classes.guide} ${classes["guide__backdrop-bottom"]} ${
              classes[`guide__backdrop-bottom--${props.stage}`]
            }`}
          ></div>
          <div
            className={`${classes.guide} ${classes["guide__content"]} ${
              classes[`guide__content--${props.stage}`]
            }`}
          >
            {props.stage === 1 && (
              <div className={classes["guide__content__item"]}>
                <p className={classes["guide__content__text"]}>
                  Click "New Resource" to add your first model
                </p>
                <ArrowUp className={classes["guide__arrow-up"]} />
              </div>
            )}

            {props.stage === 2 && (
              <ul className={classes["guide__content__list"]}>
                <li className={classes["guide__content__item"]}>
                  <p className={classes["guide__content__text"]}>
                    Select the model type
                  </p>
                  <ArrowRightSvg />
                </li>
                <li className={classes["guide__content__item"]}>
                  <p className={classes["guide__content__text"]}>
                    Copy the model ID or URL from
                    {/* <br /> */}{" "}
                    <LinkA external href="https://civitai.com">
                      Civitai
                    </LinkA>{" "}
                    <br />
                    <span className={classes["guide__content__comment"]}>
                      To test use ID: 727427
                    </span>
                  </p>

                  <ArrowRightSvg />
                </li>
                <li className={classes["guide__content__item"]}>
                  <p className={classes["guide__content__text"]}>
                    Enter the category
                    <br />
                    <span className={classes["guide__content__comment"]}>
                      The category will be created automatically
                    </span>
                  </p>

                  <ArrowRightSvg />
                </li>
                <li className={classes["guide__content__item"]}>
                  <p className={classes["guide__content__text"]}>
                    Enter the subcategories
                  </p>

                  <ArrowRightSvg />
                </li>
              </ul>
            )}
            {true && (
              <div className={classes["guide__close"]} onClick={props.onClose}>
                <span>Close guide</span>
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
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Guide;
