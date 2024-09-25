import classes from "./GuideMessage.module.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import ArrowRightSvg from "../../../assets/ArrowRight";
import ButtonTertiary from "../ButtonTertiary";
import { useDispatch, useSelector } from "react-redux";
import { guideActions } from "../../../store/guide";
import ExitGuideRequest from "./ExitGuideRequest";
import {
  GUIDE_LAST_STEP,
  GUIDE_LAST_STEP_TYPE,
} from "../../../variables/constants";
import CrossSvg from "../../../assets/CrossSvg";

const GuideMessage = (props) => {
  const {
    type,
    step,
    next,
    arrowPosition,
    className,
    autoScroll = true,
    autoScrollTo = "center",
  } = props;
  const [exitRequestIsOpen, setExitRequestIsOpen] = useState(false);
  const dispatch = useDispatch();
  const guideMessageRef = useRef(null);
  const guideState = useSelector((state) => state.guide);
  const lastStep = type === GUIDE_LAST_STEP_TYPE && step === GUIDE_LAST_STEP;
  const curGuideIsActive = useMemo(() => {
    if (type && guideState && guideState.hasOwnProperty(type)) {
      return guideState[type].active;
    }
    return null;
  }, [type, guideState]);

  const closeGuideHandler = () => {
    dispatch(guideActions.setGuideIsActive(false));
  };
  const openExitRequestHandler = () => {
    setExitRequestIsOpen(true);
  };

  const nextStepHandler = () => {
    dispatch(guideActions.guideNextStep({ type: type }));
  };

  const finishHandler = () => {
    dispatch(guideActions.setGuideIsActive(false));
    dispatch(guideActions.setOutroIsActive(true));
  };

  useEffect(() => {
    if (autoScroll && guideMessageRef?.current && step) {
      guideMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: autoScrollTo,
      });
    }
  }, [step, autoScroll, autoScrollTo]);

  return (
    <>
      {guideState?.active && curGuideIsActive && (
        <div
          ref={guideMessageRef}
          className={`${classes["guide-container"]} ${
            className ? className : ""
          }`}
        >
          <div className={`${classes.guide} ${classes["guide__content"]}`}>
            <div className={classes["guide__content__item"]}>
              <p className={classes["guide__content__text"]}>
                {props.children}
              </p>
            </div>
            <div className={classes["guide__controls"]}>
              <div className={classes["guide__controls-steps"]}>
                {true && !lastStep && (
                  <ButtonTertiary
                    type="button"
                    className={`${classes["guide__controls-btn"]} ${
                      next ? classes["guide__controls-btn--next"] : ""
                    }`}
                    onClick={nextStepHandler}
                    title={`${
                      next
                        ? "Next tip"
                        : "To proceed, perform the action highlighted in yellow"
                    }`}
                    disabled={!next}
                  >
                    <span>Next step</span> <ArrowRightSvg />
                  </ButtonTertiary>
                )}
                {lastStep && (
                  <ButtonTertiary
                    type="button"
                    className={`${classes["guide__controls-btn"]} ${
                      next ? classes["guide__controls-btn--next"] : ""
                    }`}
                    onClick={finishHandler}
                    title="Next tip"
                  >
                    <span>Finish tutorial</span> <ArrowRightSvg />
                  </ButtonTertiary>
                )}
              </div>
            </div>
            <div
              className={`${classes["guide__arrow-bg"]} ${
                classes[`guide__arrow-bg--${arrowPosition || 0}`]
              }`}
            ></div>
            <button
              className={classes["guide__close"]}
              onClick={openExitRequestHandler}
            >
              <CrossSvg />
            </button>
          </div>

          {exitRequestIsOpen && (
            <ExitGuideRequest
              onSubmit={closeGuideHandler}
              onClose={() => {
                setExitRequestIsOpen(false);
              }}
            >
              Are you sure you want to exit tutorial?
            </ExitGuideRequest>
          )}
        </div>
      )}
    </>
  );
};

export default GuideMessage;
