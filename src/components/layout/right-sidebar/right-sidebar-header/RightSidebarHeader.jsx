import { Bars2Icon, Bars4Icon, TrashIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";

import classes from "./RightSidebarHeader.module.scss";
import SidePanelGuide from "../../../ui/guide/model/SidePanelGuide";
import ButtonTertiary from "../../../ui/ButtonTertiary";
import RightSidebarForm from "../right-sidebar-form/RightSidebarForm";
import { DEV_GUIDE_TEST } from "../../../../variables/constants";
import { guideActions } from "../../../../store/guide";
import {
  switchSidePanelfullView,
  usedModelsActions,
} from "../../../../store/usedModels";

const RightSidebarHeader = () => {
  const fullCardView = useSelector((state) => state.used.fullCardView);
  const dispatch = useDispatch();

  const clearPanelHandler = () => {
    dispatch(usedModelsActions.clearPanel());
  };

  //guide test
  const nextStepHandler = () => {
    dispatch(guideActions.guideNextStep({ type: "model" }));
  };

  const prevStepHandler = () => {
    dispatch(guideActions.guidePrevStep({ type: "model" }));
  };
  //////////////

  return (
    <div className={classes["options"]}>
      {DEV_GUIDE_TEST && (
        <div>
          <button onClick={prevStepHandler}>prev</button>
          <button onClick={nextStepHandler}>next</button>
        </div>
      )}
      <RightSidebarForm />
      <div className={classes["controls"]}>
        <ButtonTertiary
          className={classes["controls__clear"]}
          type="button"
          onClick={clearPanelHandler}
        >
          <TrashIcon className={classes["controls__svg"]} /> Clear
        </ButtonTertiary>
        <div>
          <ButtonTertiary
            type="button"
            className={`${classes["controls__btn"]} ${
              !fullCardView ? classes["controls__btn--active"] : ""
            }`}
            onClick={() => {
              dispatch(switchSidePanelfullView(false));
            }}
            title="Short view"
          >
            <Bars2Icon />
          </ButtonTertiary>
          <ButtonTertiary
            type="button"
            className={`${classes["controls__btn"]} ${
              fullCardView ? classes["controls__btn--active"] : ""
            }`}
            onClick={() => {
              dispatch(switchSidePanelfullView(true));
            }}
            title="Expanded view"
          >
            <Bars4Icon />
          </ButtonTertiary>
        </div>
      </div>
      <SidePanelGuide />
    </div>
  );
};

export default RightSidebarHeader;
