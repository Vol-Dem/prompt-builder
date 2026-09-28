import { useEffect, useRef, useState } from "react";

import { getModelsPreview } from "../store/tabs";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { useOnlineStatus } from "./use-online-status";
import useIntersection from "./use-intersection";
import { SETTINGS_LOAD_MORE_MARGIN_SMALL } from "../variables/constants";

/** Loads model previews as the list end becomes visible or nearby. */
const useModelPreviewLoading = () => {
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
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
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

  return {
    previews: modelsData?.previews,
    endPageRef,
    status: { isLoading, errorMessage, isOnline },
  };
};

export default useModelPreviewLoading;
