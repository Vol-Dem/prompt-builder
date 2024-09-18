import classes from "./EditTWGuide.module.scss";
import { useEffect, useRef, useState } from "react";
import ArrowRightSvg from "../../../assets/ArrowRight";
import ButtonTertiary from "../ButtonTertiary";
import ArrowLeftSvg from "../../../assets/ArrowLeft";
import { useDispatch, useSelector } from "react-redux";
import { setGuideData } from "../../../store/auth";
import useIntersection from "../../../hooks/use-intersection";

const guideSteps = [
  {
    step: 1,
    text: "Here you can add tag sets and edit version trigger words",
  },
];

const EditTWGuide = (props) => {
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [guideIsOpen, setGuideIsOpen] = useState(false);
  const guideState = useSelector((state) => state.auth.guide);
  const dispatch = useDispatch();
  const guideRef = useRef(null);
  const isIntersecting = useIntersection(guideRef, false);

  useEffect(() => {
    setGuideIsOpen(!guideState?.editTW);
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
    dispatch(setGuideData({ editTW: true }));
  };

  return (
    <div ref={guideRef}>
      {guideIsOpen && isIntersecting && (
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
            </div>
            <div className={classes["guide__controls"]}>
              <div className={classes["guide__controls-steps"]}>
                {guideSteps.length > 1 && (
                  <>
                    <ButtonTertiary
                      className={classes["guide__controls-btn"]}
                      onClick={prevStepHandler}
                      title="Previous tip"
                    >
                      <ArrowLeftSvg />
                    </ButtonTertiary>
                    <span>
                      {guideSteps[guideStepIndex].step} / {guideSteps.length}
                    </span>
                    <ButtonTertiary
                      className={classes["guide__controls-btn"]}
                      onClick={nextStepHandler}
                      title="Next tip"
                    >
                      <ArrowRightSvg />
                    </ButtonTertiary>
                  </>
                )}
              </div>
              <ButtonTertiary onClick={closeGuideHandler}>close</ButtonTertiary>
            </div>
            <div className={classes["guide__arrow-bg"]}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTWGuide;
