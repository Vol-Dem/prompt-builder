import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { type ComponentProps } from "react";

import classes from "./RightSidebarBtnOpen.module.scss";
import { usedModelsActions } from "../../../../store/usedModels";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";

type RightSidebarBtnOpenProps = ComponentProps<"button">;

/**
 * Displays a button to open the right sidebar.
 * Changes the open state of the sidebar when clicked.
 *
 * @component
 *
 * @returns The right sidebar open button.
 */
const RightSidebarBtnOpen = ({ ref }: RightSidebarBtnOpenProps) => {
  const panelIsOpen = useAppSelector((state) => state.used.panelIsOpen);
  const dispatch = useAppDispatch();

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
};

export default RightSidebarBtnOpen;
