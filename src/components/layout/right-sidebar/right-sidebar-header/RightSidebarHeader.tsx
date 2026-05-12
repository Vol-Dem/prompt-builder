import { Bars2Icon, Bars4Icon, TrashIcon } from "@heroicons/react/24/outline";

import classes from "./RightSidebarHeader.module.scss";
import SidePanelGuide from "../../../general-elements/guide/model/SidePanelGuide";
import ButtonTertiary from "../../../ui/buttons/ButtonTertiary";
import RightSidebarForm from "../right-sidebar-form/RightSidebarForm";
import { DEV_GUIDE_TEST } from "../../../../variables/constants";
import { guideActions } from "../../../../store/guide";
import {
  switchSidePanelfullView,
  usedModelsActions,
} from "../../../../store/usedModels";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";

/**
 * Right sidebar header with panel controls.
 *
 * Renders controls for:
 * - Clearing the right sidebar panel.
 * - Switching between short and expanded card views.
 * - Rendering the sidebar form controller.
 * - Displaying the contextual sidebar guide.
 *
 * In development mode, when `DEV_GUIDE_TEST` is enabled, also renders
 * temporary debug buttons that allow manually switching between
 * interactive guide steps. These controls are intended **only for
 * testing and debugging the guide flow** and are not part of the
 * production UI.
 *
 * @component
 * @returns The right sidebar header with panel controls.
 */
const RightSidebarHeader = () => {
  const fullCardView = useAppSelector((state) => state.used.fullCardView);
  const dispatch = useAppDispatch();

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
