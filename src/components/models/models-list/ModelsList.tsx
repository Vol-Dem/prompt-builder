import { useEffect, useRef, useState } from "react";

import classes from "./ModelsList.module.scss";
import { getModelsPreview } from "../../../store/tabs";
import Spinner from "../../ui/Spinner";
import NotificationMessage from "../../ui/NotificationMessage";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import ErrorMessage from "../../ui/ErrorMessage";
import {
  GUIDE_STEP_OPEN_MODEL,
  ERROR_MESSAGE_OFFLINE,
  SETTINGS_LOAD_MORE_MARGIN_SMALL,
} from "../../../variables/constants";
import OpenModelGuide from "../../general-elements/guide/home/OpenModelGuide";
import { guideActions } from "../../../store/guide";
import useIntersection from "../../../hooks/use-intersection";
import PreviewCard from "../../general-elements/preview-card/PreviewCard";
import ModelsListPanel from "./models-list-panel/ModelsListPanel";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Displays a list of model previews with infinite scrolling support.
 *
 * Responsibilities:
 * - Fetches and displays model previews for the selected model version.
 * - Supports infinite scrolling with fallbacks.
 * - Displays helpful guidance when no images are available.
 * - Handles loading and error states.
 *
 * @component
 *
 * @returns {JSX.Element} List of model previews with infinite scroll behavior.
 */
const ModelsList = () => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const modelsData = useAppSelector((state) => state.tabs.modelsData);
  const isLoading = useAppSelector((state) => state.tabs.isLoading);
  const isLastPage = useAppSelector((state) => state.tabs.isLastPage);
  const activeTab = useAppSelector((state) => state.tabs.currTab);
  const activeCategory = useAppSelector((state) => state.tabs.currCategory);
  const activeSubcategory = useAppSelector(
    (state) => state.tabs.currSubcategory,
  );
  const errorMessage = useAppSelector((state) => state.tabs.errorMessage);
  const previewFullView = useAppSelector((state) => state.tabs.previewFullView);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const guideState = useAppSelector((state) => state.guide.home);
  const endPageRef = useRef(null);
  const isOnline = useOnlineStatus();
  const dispatch = useAppDispatch();
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`,
  );

  useEffect(() => {
    setIsIntersecting(intersecting || intersectingSmall);
  }, [
    nsfwMode,
    intersecting,
    intersectingSmall,
    activeTab,
    activeCategory,
    activeSubcategory,
  ]);

  useEffect(() => {
    if (
      guideState?.step < GUIDE_STEP_OPEN_MODEL &&
      modelsData?.previews?.length
    ) {
      dispatch(
        guideActions.setGuideStep({
          type: "home",
          value: GUIDE_STEP_OPEN_MODEL,
        }),
      );
    }
  }, [guideState, modelsData?.previews, dispatch]);

  useEffect(() => {
    const loadMore = !!modelsData?.previews?.length;

    const getAllModels =
      activeTab === "all" ||
      activeCategory === "all" ||
      activeSubcategory === "all";
    const getSubcategoryModels =
      activeTab && activeCategory && activeSubcategory;

    if (
      isIntersecting &&
      !isLastPage &&
      isOnline &&
      (getSubcategoryModels || getAllModels)
    ) {
      setIsIntersecting(false);
      dispatch(
        getModelsPreview(
          activeTab,
          activeCategory,
          activeSubcategory,
          loadMore,
          nsfwMode,
        ),
      );
    }
  }, [
    dispatch,
    modelsData,
    nsfwMode,
    isLastPage,
    isOnline,
    activeTab,
    activeCategory,
    activeSubcategory,
    isIntersecting,
  ]);

  const modelsPreviewHtml = modelsData?.previews?.map((item, i) => {
    return <PreviewCard key={i} item={item} fullView={previewFullView} />;
  });

  return (
    <div className={classes["container"]}>
      {activeSubcategory && <ModelsListPanel />}
      <div
        className={`${classes["category"]} ${
          previewFullView ? classes["category__full"] : ""
        }`}
      >
        {modelsPreviewHtml}
      </div>
      {guideState?.active && !isLoading && !!modelsPreviewHtml?.length && (
        <OpenModelGuide />
      )}
      {!modelsPreviewHtml?.length &&
        !errorMessage &&
        !isLoading &&
        isOnline &&
        activeSubcategory && (
          <NotificationMessage className={classes.empty} type="notification">
            This category is empty. Try changing the filter.
          </NotificationMessage>
        )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <div ref={endPageRef}></div>
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default ModelsList;
