import classes from "./ImageSidePanelGuide.module.scss";
import { useEffect, useState } from "react";
import ArrowRightSvg from "../../../assets/ArrowRight";
import ButtonTertiary from "../ButtonTertiary";
import ArrowLeftSvg from "../../../assets/ArrowLeft";
import { useDispatch, useSelector } from "react-redux";
import { authActions, setGuideData } from "../../../store/auth";
import FolderSvg from "../../../assets/FolderSvg";
import PlusSvg from "../../../assets/PlusSvg";

const stepsAmount = 2;

const ImageSidePanelGuide = (props) => {
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [guideIsOpen, setGuideIsOpen] = useState(true);
  const guideState = useSelector((state) => state.auth.guide);
  const dispatch = useDispatch();

  const downloadImage = (
    <FolderSvg className={`${classes["svg"]} ${classes["svg--medium"]}`} />
  );

  const plusImage = (
    <span className={classes["btn-container"]}>
      <PlusSvg />
    </span>
  );

  const guideSteps = [
    {
      step: 1,
      text: (
        <>
          Click {downloadImage} to save image generation data to use it as a
          reference later
        </>
      ),
    },
    {
      step: 2,
      text: (
        <>Click {plusImage} to add image to side panel to use as reference</>
      ),
    },
  ];

  useEffect(() => {
    setGuideIsOpen(!guideState?.image);
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
    dispatch(setGuideData({ image: true }));
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

export default ImageSidePanelGuide;
