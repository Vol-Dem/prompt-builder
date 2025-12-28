import { createPortal } from "react-dom";
import { useState } from "react";

import classes from "./Guide.module.scss";
import LinkA from "../../ui/LinkA";
import TextButtonCreate from "../../ui/text/text-buttons/TextButtonCreate";
import ArrowRightSvg from "../../../assets/ArrowRight";
import ArrowUp from "../../../assets/ArrowUp";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import CopiedSvg from "../../../assets/CopiedSvg";
import CopySvg from "../../../assets/CopySvg";

const Guide = (props) => {
  const [copied, setCopied] = useState(false);

  const copyHandler = () => {
    navigator.clipboard.writeText("727427");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

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
                    Copy the model ID or URL from{" "}
                    <LinkA external href="https://civitai.com">
                      Civitai
                    </LinkA>{" "}
                    <br />
                    <span className={classes["guide__content__comment"]}>
                      To test use ID:{" "}
                      <ButtonTertiary
                        className={`${classes["btn-copy"]} ${
                          copied ? classes["btn-copy--copied"] : ""
                        }`}
                        onClick={copyHandler}
                        title="Copy"
                      >
                        727427 {!copied && <CopySvg />}
                        {copied && <CopiedSvg />}
                      </ButtonTertiary>
                    </span>
                  </p>

                  <ArrowRightSvg />
                </li>
                <li className={classes["guide__content__item"]}>
                  <p className={classes["guide__content__text"]}>
                    Enter the category name <br /> and click{" "}
                    <TextButtonCreate className={classes.create} /> in the
                    dropdown
                    <br />
                  </p>

                  <ArrowRightSvg />
                </li>
                <li className={classes["guide__content__item"]}>
                  <p className={classes["guide__content__text"]}>
                    Enter the subcategories
                    <br />
                    <span className={classes["guide__content__comment"]}>
                      You can add multiple subcategories <br /> by clicking
                      "+add subcategory"
                    </span>
                  </p>

                  <ArrowRightSvg />
                </li>
              </ul>
            )}
            <div className={classes["guide__close"]} onClick={props.onClose}>
              <span>Close</span>
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

export default Guide;
