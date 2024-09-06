import classes from "./TopPanelGuide.module.scss";
import { useEffect, useState } from "react";
import ArrowRightSvg from "../../../assets/ArrowRight";
import ButtonTertiary from "../ButtonTertiary";
import ArrowLeftSvg from "../../../assets/ArrowLeft";
import { useDispatch, useSelector } from "react-redux";
import { authActions, setGuideData } from "../../../store/auth";

const stepsAmount = 2;
const guideSteps = [
  {
    step: 1,
    text: "Click to switch between tag and text mode. The text will be automatically split into tags",
  },
  {
    step: 2,
    text: "Add commonly used trigger words into presets. Create presets for both positive and negative words",
  },
];

const TopPanelGuide = (props) => {
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [guideIsOpen, setGuideIsOpen] = useState(false);
  const guideState = useSelector((state) => state.auth.guide);
  const dispatch = useDispatch();

  useEffect(() => {
    setGuideIsOpen(!guideState?.topPanel);
  }, [guideState]);

  const nextStepHandler = () => {
    setGuideStepIndex((prevState) => {
      if (prevState >= guideSteps?.length - 1) {
        return prevState;
      } else {
        return prevState + 1;
      }
    });
  };

  const prevStepHandler = () => {
    setGuideStepIndex((prevState) => {
      if (prevState <= 0) {
        return 0;
      } else {
        return prevState - 1;
      }
    });
  };

  const closeGuideHandler = () => {
    setGuideIsOpen(false);
    dispatch(setGuideData({ topPanel: true }));
  };

  return (
    <>
      {guideIsOpen && (
        <div
          className={`${classes["guide-container"]} ${
            props?.className ? props?.className : ""
          }`}
        >
          <div
            className={`${classes.guide} ${classes["guide__content"]} ${
              classes[`guide__content--${guideSteps[guideStepIndex].step}`]
            }`}
          >
            <div className={classes["guide__content__item"]}>
              <p className={classes["guide__content__text"]}>
                {guideSteps[guideStepIndex].text}
              </p>
              {/* <ArrowUp className={classes["guide__arrow-up"]} />
               */}
              {/* <ArrowDownSvg className={classes["guide__arrow-down"]} /> */}
            </div>
            <div className={classes["guide__controls"]}>
              <div className={classes["guide__controls-steps"]}>
                <ButtonTertiary
                  className={classes["guide__controls-btn"]}
                  onClick={prevStepHandler}
                >
                  <ArrowLeftSvg />
                </ButtonTertiary>
                <span>
                  {guideSteps[guideStepIndex].step} / {stepsAmount}
                </span>
                <ButtonTertiary
                  className={classes["guide__controls-btn"]}
                  onClick={nextStepHandler}
                >
                  <ArrowRightSvg />
                </ButtonTertiary>
              </div>
              <ButtonTertiary onClick={closeGuideHandler}>close</ButtonTertiary>
            </div>
            <div className={classes["guide__arrow-bg"]}></div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopPanelGuide;
