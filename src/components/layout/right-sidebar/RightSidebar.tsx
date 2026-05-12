import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import classes from "./RightSidebar.module.scss";
import { usedModelsActions } from "../../../store/usedModels";
import OpenSidePanelGuide from "../../general-elements/guide/model/OpenSidePanelGuide";
import ReferenceImageList from "./reference-image-list/ReferenceImageList";
import RightSidebarFooter from "./right-sidebar-footer/RightSidebarFooter";
import RightSidebarHeader from "./right-sidebar-header/RightSidebarHeader";
import RightSidebarBtnOpen from "./right-sidebar-btn-open/RightSidebarBtnOpen";
import useTouchOpenState from "../../../hooks/use-touch-open-state";
import RightSidebarCardAnimated from "./right-sidebar-card/RightSidebarCardAnimated";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { PlusIcon } from "@heroicons/react/24/outline";

// Distance in pixels to change open state to true
const slideDistanceToOpen = 10;

// Distance in pixels to change open state to falce
const slideDistanceToClose = 40;

// Open panel button initial width
const defBtnOffsetWidth = 20;

/**
 * Application right sidebar with touch swipe support.
 *
 * Displays a slide-in sidebar panel that can be opened or closed using a toggle
 * button or by swiping on touch devices.
 *
 * Shows reference images and models with controls to clear the panel, switch
 * between compact and expanded card views, and a form for adding new models
 * or collections.
 *
 * @component
 *
 * @returns The animated right sidebar component.
 */
const RightSidebar = memo(() => {
  const usedModels = useAppSelector((state) => state.used.models);
  const usedImages = useAppSelector((state) => state.used.images);
  const panelIsOpen = useAppSelector((state) => state.used.panelIsOpen);
  const fullCardView = useAppSelector((state) => state.used.fullCardView);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const openPanelBtnRef = useRef<HTMLButtonElement>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const changeSidePanelStateOnTouch = useCallback(
    (state: boolean) => {
      dispatch(usedModelsActions.panelState(state));
    },
    [dispatch],
  );

  // Adds a touch event to the sidebar and changes the panelIsOpen state on slide.
  useTouchOpenState(
    panelContainerRef,
    "X",
    true,
    slideDistanceToOpen,
    slideDistanceToClose,
    changeSidePanelStateOnTouch,
    panelIsOpen,
  );

  useEffect(() => {
    if (sidePanelRef?.current && openPanelBtnRef?.current) {
      const sidepanelWidth = sidePanelRef.current.offsetWidth || 0;
      const openPanelBtnWidth =
        openPanelBtnRef.current.offsetWidth || defBtnOffsetWidth;
      dispatch(
        usedModelsActions.setSidePanelWidth(sidepanelWidth + openPanelBtnWidth),
      );
    }
  }, [panelIsOpen, dispatch]);

  const modelCardsHtml = useMemo(() => {
    return usedModels.map((model) => {
      return (
        <RightSidebarCardAnimated
          key={`sc-${model.id}`}
          model={model}
          fullView={fullCardView}
        />
      );
    });
  }, [usedModels, fullCardView]);

  return (
    <motion.aside
      ref={panelContainerRef}
      className={`${classes.container} ${
        panelIsOpen ? classes["container--open"] : ""
      }`}
      animate={{
        width: panelIsOpen
          ? (sidePanelRef?.current?.offsetWidth || 0) +
            (openPanelBtnRef?.current?.offsetWidth || defBtnOffsetWidth)
          : openPanelBtnRef?.current?.offsetWidth || defBtnOffsetWidth,
      }}
    >
      <>
        <RightSidebarBtnOpen ref={openPanelBtnRef} />
        <OpenSidePanelGuide />
        <motion.div
          ref={sidePanelRef}
          className={`${classes.panel} ${
            panelIsOpen ? classes["panel--open"] : ""
          }`}
        >
          <RightSidebarHeader />
          <div className={classes["model-cards"]}>
            <AnimatePresence>
              {!!usedImages.length && (
                <ReferenceImageList usedImages={usedImages} />
              )}
              {!!modelCardsHtml.length && modelCardsHtml}
            </AnimatePresence>
            {!modelCardsHtml.length && !usedImages.length && (
              <div className={classes["model-cards__tip"]}>
                Press{" "}
                <span className={classes.plus}>
                  <PlusIcon />
                </span>{" "}
                to add model or image to side panel
              </div>
            )}
          </div>
          <RightSidebarFooter />
        </motion.div>
      </>
    </motion.aside>
  );
});

export default RightSidebar;
