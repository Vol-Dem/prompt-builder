import { useDispatch, useSelector } from "react-redux";

import classes from "./IntroGuide.module.scss";
import Buttton from "../Button";
import { guideActions } from "../../../store/guide";
import GuideActionMessage from "./GuideActionMessage";

const IntroGuide = () => {
  const guideIsActive = useSelector((state) => state.guide.active);
  const introDisabled = useSelector((state) => state.guide.introDisabled);
  const dispatch = useDispatch();

  return (
    <>
      {!guideIsActive && !introDisabled && (
        <div className={classes["container"]}>
          <h2 className={classes.title}>Interactive guide</h2>
          <div>
            <p className={classes.text}>
              Welcome! I have prepared a <del>long</del> short tutorial to help
              you learn the main features of the platform.{" "}
            </p>
            <p className={classes.text}>
              To progress through the guide you will need to{" "}
              <GuideActionMessage>
                perform the action highlighted in yellow
              </GuideActionMessage>{" "}
              or click "Next Step" (if it's active).
            </p>
            <div></div>
            <p className={classes.text}>
              You can exit the tutorial at any time.
            </p>
          </div>
          <div className={classes["btns"]}>
            <Buttton
              className={classes.btn}
              onClick={() => {
                dispatch(guideActions.setGuideIsActive(true));
                dispatch(guideActions.setIntroDisabled(true));
              }}
            >
              Start
            </Buttton>
            <Buttton
              className={`${classes.btn} ${classes["btn--close"]}`}
              onClick={() => {
                dispatch(guideActions.setIntroDisabled(true));
              }}
            >
              Exit
            </Buttton>
          </div>
        </div>
      )}
    </>
  );
};

export default IntroGuide;
