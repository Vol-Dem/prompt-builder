import classes from "./RightSidebar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import RightSidebarCard from "./right-sidebar-card/RightSidebarCard";
import { usedModelsActions } from "../../../store/usedModels";
import PlusSvg from "../../../assets/PlusSvg";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import OpenSidePanelGuide from "../../ui/guide/model/OpenSidePanelGuide";
import ReferenceImageList from "./reference-image-list/ReferenceImageList";
import { AnimatePresence, motion } from "framer-motion";
import RightSidebarFooter from "./right-sidebar-footer/RightSidebarFooter";
import RightSidebarHeader from "./right-sidebar-header/RightSidebarHeader";
import RightSidebarBtnOpen from "./right-sidebar-btn-open/RightSidebarBtnOpen";
import useTouchOpenState from "../../../hooks/use-touch-open-state";

const RightSidebar = memo(() => {
  const usedModels = useSelector((state) => state.used.models);
  const usedImages = useSelector((state) => state.used.images);
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const fullCardView = useSelector((state) => state.used.fullCardView);
  const sidePanelRef = useRef({ offsetWidth: 0 });
  const openPanelBtnRef = useRef({ offsetWidth: 20 });
  const panelContainerRef = useRef(null);
  const dispatch = useDispatch();

  const changeSidePanelStateOnTouch = useCallback(
    (state) => {
      dispatch(usedModelsActions.panelState(state));
    },
    [dispatch]
  );

  // Adds a touch event to the sidebar and changes the panelIsOpen state on slide.
  useTouchOpenState(
    panelContainerRef,
    "X",
    true,
    10,
    40,
    changeSidePanelStateOnTouch,
    panelIsOpen
  );

  useEffect(() => {
    if (sidePanelRef?.current && openPanelBtnRef?.current) {
      dispatch(
        usedModelsActions.setSidePanelWidth(
          sidePanelRef.current.offsetWidth + openPanelBtnRef.current.offsetWidth
        )
      );
    }
  }, [panelIsOpen, dispatch]);

  const modelCardsHtml = useMemo(() => {
    return usedModels.map((model, i) => {
      return (
        <div key={`side-card-${model.id}`} style={{ position: "relative" }}>
          <RightSidebarCard
            layoutId={model.id}
            previewData={model}
            fullView={fullCardView}
          />
          <RightSidebarCard previewData={model} fullView={fullCardView} />
        </div>
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
          ? sidePanelRef?.current?.offsetWidth +
            openPanelBtnRef?.current?.offsetWidth
          : openPanelBtnRef?.current?.offsetWidth,
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
                  <PlusSvg />
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
