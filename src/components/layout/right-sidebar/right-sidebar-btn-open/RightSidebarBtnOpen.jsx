import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { forwardRef } from "react";

import classes from "./RightSidebarBtnOpen.module.scss";
import { usedModelsActions } from "../../../../store/usedModels";

/**
 * Displays a button to open the right sidebar.
 * Changes the open state of the sidebar when clicked.
 *
 * @component
 *
 * @returns {JSX.Element} The right sidebar open button.
 */
const RightSidebarBtnOpen = forwardRef((props, ref) => {
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const dispatch = useDispatch();

  const openPanelHandler = () => {
    dispatch(usedModelsActions.panelState(!panelIsOpen));
  };

  return (
    <button
      ref={ref}
      type="button"
      title={panelIsOpen ? "Close side panel" : "Open side panel"}
      onClick={openPanelHandler}
      className={classes["btn__open"]}
    >
      {!panelIsOpen && <ChevronLeftIcon />}
      {panelIsOpen && <ChevronRightIcon />}
    </button>
  );
});

export default RightSidebarBtnOpen;
