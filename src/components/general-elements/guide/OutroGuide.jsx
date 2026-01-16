import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import classes from "./OutroGuide.module.scss";
import Buttton from "../../ui/buttons/Button";
import { guideActions } from "../../../store/guide";
import GuideActionMessage from "./GuideActionMessage";

/**
 * Guide outro component.
 *
 * Displays a guide outro message when user finished the guide.
 *
 * @component
 *
 * @returns {JSX.Element} Guide outro element.
 */
const OutroGuide = () => {
  const outroIsActive = useSelector((state) => state.guide.outroIsActive);
  const dispatch = useDispatch();

  return (
    <>
      {outroIsActive && (
        <div className={classes["container"]}>
          <h2 className={classes.title}>Well done!</h2>
          <div>
            <p className={classes.text}>
              Wow, you're really here! You are the most purposeful person I
              know! If you want you can remind yourself about the capabilities
              of AIDE-TOOLS in the{" "}
              <Link to="about" className={classes.link}>
                About
              </Link>{" "}
              section
            </p>
            <p className={classes.text}>
              <GuideActionMessage>
                Thanks for completing the tutorial, I'm glad you got here :)
              </GuideActionMessage>
            </p>
            <p className={classes.text}>
              Now you can create your own model collection and start building
              prompts using the platform tools.
            </p>
          </div>
          <div className={classes["btns"]}>
            <Buttton
              className={classes.btn}
              onClick={() => {
                dispatch(guideActions.setOutroIsActive(false));
              }}
            >
              OK
            </Buttton>
          </div>
        </div>
      )}
    </>
  );
};

export default OutroGuide;
