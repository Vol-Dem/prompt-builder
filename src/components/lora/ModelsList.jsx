import React, { useEffect, useMemo, useRef, useState } from "react";
import classes from "./ModelsList.module.scss";
import PreviewCard from "../previewCard/PreviewCard";
import { useDispatch, useSelector } from "react-redux";
import {
  getModelsPreview,
  switchPreviewFullView,
  tabActions,
} from "../../store/tabs";
import Spinner from "../ui/Spinner";
import Select from "../ui/Select";
import NotificationMessage from "../ui/NotificationMessage";
import usePageEnd from "../../hooks/use-page-end";
import { useOnlineStatus } from "../../hooks/use-online-status";
import ErrorMessage from "../ui/ErrorMessage";
import {
  GUIDE_STEP_OPEN_MODEL,
  ERROR_MESSAGE_OFFLINE,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_SLIDEIN,
} from "../../variables/constants";
import OpenModelGuide from "../ui/guide/home/OpenModelGuide";
import { guideActions } from "../../store/guide";
import { motion } from "framer-motion";
import AddToPanelAnimContainer from "../ui/AddToPanelAnimContainer";
import ButtonTertiary from "../ui/ButtonTertiary";
import { Bars2Icon, Bars4Icon } from "@heroicons/react/24/outline";

const sortTypes = [
  { name: "Newest", value: "createdAt" },
  { name: "Name", value: "name" },
];
const baseModelsDef = [{ name: "-", value: "-" }];

const ModelsList = () => {
  const modelsData = useSelector((state) => state.tabs.modelsData);
  const isLoading = useSelector((state) => state.tabs.isLoading);
  const isLastPage = useSelector((state) => state.tabs.isLastPage);
  const sortBy = useSelector((state) => state.tabs.sortBy);
  const modelType = useSelector((state) => state.tabs.modelType);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const errorMessage = useSelector((state) => state.tabs.errorMessage);
  const baseModels = useSelector((state) => state.tabs.baseModels);
  const previewFullView = useSelector((state) => state.tabs.previewFullView);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const guideState = useSelector((state) => state.guide.home);
  const usedModels = useSelector((state) => state.used.models);
  const endPage = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const isPageEnd = usePageEnd(100);
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();
  const getAllModels = useMemo(
    () =>
      activeTab === "all" ||
      activeCategory === "all" ||
      activeSubcategory === "all",
    [activeTab, activeCategory, activeSubcategory]
  );

  const getSubcategoryModels = useMemo(
    () => activeTab && activeCategory && activeSubcategory,
    [activeTab, activeCategory, activeSubcategory]
  );

  const baseModelsData = !baseModels?.length
    ? baseModelsDef
    : [
        ...baseModelsDef,
        ...baseModels?.map((model) => {
          return { name: model, value: model };
        }),
      ];

  useEffect(() => {
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);

  // useEffect(() => {
  //   dispatch(tabActions.resetModelsData());
  //   dispatch(tabActions.setIsLastPage(false));
  //   // if (
  //   //   activeTab === "all" ||
  //   //   activeCategory === "all" ||
  //   //   activeSubcategory === "all"
  //   // ) {
  //   //   dispatch(tabActions.resetModelsData());
  //   //   dispatch(tabActions.setIsLastPage(false));
  //   // } else {
  //   //   // dispatch(tabActions.setIsLastPage(false));
  //   //   dispatch(tabActions.resetModelsData());
  //   // }
  // }, [activeTab, activeCategory, activeSubcategory, dispatch]);

  useEffect(() => {
    if (
      guideState?.step < GUIDE_STEP_OPEN_MODEL &&
      modelsData?.previews?.length
    ) {
      dispatch(
        guideActions.setGuideStep({
          type: "home",
          value: GUIDE_STEP_OPEN_MODEL,
        })
      );
    }
  }, [guideState, modelsData?.previews, dispatch]);

  useEffect(() => {
    if (
      activeTab === modelsData.tab &&
      activeCategory === modelsData.category &&
      activeSubcategory === modelsData.subcategory &&
      nsfwMode !== modelsData.nsfw
    ) {
      dispatch(tabActions.resetModelsData());
      dispatch(tabActions.setIsLastPage(false));
    }
  }, [
    dispatch,
    modelsData,
    nsfwMode,
    activeCategory,
    activeSubcategory,
    activeTab,
    getAllModels,
    getSubcategoryModels,
  ]);

  useEffect(() => {
    if (
      !modelsData?.previews?.length &&
      !isLastPage &&
      isOnline &&
      (getSubcategoryModels || getAllModels)
    ) {
      dispatch(
        getModelsPreview(
          activeTab,
          activeCategory,
          activeSubcategory,
          false,
          nsfwMode
        )
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
    getAllModels,
    getSubcategoryModels,
  ]);

  useEffect(() => {
    if (
      !isLastPage &&
      isIntersecting &&
      !!modelsData?.previews?.length &&
      isOnline
    ) {
      clearTimeout(timeoutRef.current);
      setIsIntersecting(false);
      timeoutRef.current = setTimeout(() => {
        dispatch(
          getModelsPreview(
            activeTab,
            activeCategory,
            activeSubcategory,
            true,
            nsfwMode
          )
        );
      }, 1000);
    }
  }, [
    isIntersecting,
    dispatch,
    isLastPage,
    modelsData,
    nsfwMode,
    isOnline,
    activeTab,
    activeCategory,
    activeSubcategory,
  ]);

  const loraHtml = modelsData?.previews?.map((item, i) => {
    return (
      <AddToPanelAnimContainer key={i}>
        <PreviewCard
          layout={false}
          previewData={item}
          fullView={previewFullView}
        />
        <PreviewCard
          layout={true}
          previewData={item}
          fullView={previewFullView}
        />
      </AddToPanelAnimContainer>
    );
  });

  const sortSelectOption = sortTypes.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  const changeViewHandler = (e) => {
    dispatch(tabActions.setPreviewFullView(true));
  };

  return (
    <div className={classes["container"]}>
      {!!modelsData?.previews?.length && (
        <div className={classes.panel}>
          <span className={classes["panel__title"]}>Sort by:</span>
          <Select
            id="sort"
            name="sort"
            selected={sortBy}
            onChange={(value) => {
              dispatch(tabActions.setSortBy(value));
              dispatch(tabActions.setModelsData([]));
              dispatch(
                getModelsPreview(
                  activeTab,
                  activeCategory,
                  activeSubcategory,
                  false,
                  nsfwMode
                )
              );
            }}
            options={sortSelectOption}
            className={classes.select}
          />
          <Select
            id="model"
            name="model"
            selected={modelType}
            onChange={(value) => {
              dispatch(tabActions.setModelType(value));
              dispatch(tabActions.setModelsData([]));
              dispatch(
                getModelsPreview(
                  activeTab,
                  activeCategory,
                  activeSubcategory,
                  false,
                  nsfwMode
                )
              );
            }}
            options={baseModelsData}
            className={classes.select}
          />
          <div className={classes["panel__view"]}>
            <ButtonTertiary
              type="button"
              className={`${classes["panel__btn"]} ${
                !previewFullView ? classes["panel__btn--active"] : ""
              }`}
              onClick={() => {
                dispatch(switchPreviewFullView(false));
              }}
              title="Short view"
            >
              <Bars2Icon className={classes["panel__btn-icon"]} />
            </ButtonTertiary>
            <ButtonTertiary
              type="button"
              className={`${classes["panel__btn"]} ${
                previewFullView ? classes["panel__btn--active"] : ""
              }`}
              onClick={() => {
                dispatch(switchPreviewFullView(true));
              }}
              title="Expanded view"
            >
              <Bars4Icon className={classes["panel__btn-icon"]} />
            </ButtonTertiary>
          </div>
        </div>
      )}
      <div
        className={`${classes["category"]} ${
          previewFullView ? classes["category__full"] : ""
        }`}
      >
        {loraHtml}
      </div>
      {guideState?.active && !isLoading && <OpenModelGuide />}
      {!loraHtml?.length &&
        !errorMessage &&
        !isLoading &&
        isOnline &&
        (getAllModels || getSubcategoryModels) && (
          <NotificationMessage className={classes.empty} type="notification">
            This category is empty
          </NotificationMessage>
        )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <div ref={endPage}></div>
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default ModelsList;
