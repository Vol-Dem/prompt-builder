import { Link } from "react-router-dom";

import classes from "./OutroGuide.module.scss";
import Button from "../../ui/buttons/Button";
import { guideActions } from "../../../store/guide";
import GuideActionMessage from "./GuideActionMessage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Guide outro component.
 *
 * Displays a guide outro message when user finished the guide.
 *
 * @component
 *
 * @returns Guide outro element.
 */
const OutroGuide = () => {
  const outroIsActive = useAppSelector((state) => state.guide.outroIsActive);
  const dispatch = useAppDispatch();

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
            <Button
              className={classes.btn}
              onClick={() => {
                dispatch(guideActions.setOutroIsActive(false));
              }}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default OutroGuide;
